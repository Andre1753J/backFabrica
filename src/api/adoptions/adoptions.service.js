const pool = require('../../config/database');

async function createRequest(requesterId, animalId) {
  if (!animalId) {
    throw new Error('O ID do animal é obrigatório.');
  }

  // Verifica se o animal existe e está disponível
  const [animalRows] = await pool.query("SELECT id_cliente_cadastrou, status_adocao FROM animal WHERE id_animal = ?", [animalId]);
  const animal = animalRows[0];

  if (!animal) throw new Error('Animal não encontrado.');
  if (animal.status_adocao !== 'disponivel') throw new Error('Este animal não está mais disponível para adoção.');
  if (animal.id_cliente_cadastrou === requesterId) throw new Error('Você não pode adotar seu próprio animal.');

  // Verifica se já existe uma solicitação pendente do mesmo usuário para o mesmo animal
  const [existingRequest] = await pool.query("SELECT id_adocao FROM adocao WHERE id_animal = ? AND id_cliente_solicitante = ? AND status_adocao = 'pendente'", [animalId, requesterId]);
  if (existingRequest.length > 0) {
    throw new Error('Você já possui uma solicitação pendente para este animal.');
  }

  const query = `
    INSERT INTO adocao (id_animal, id_cliente_solicitante, id_cliente_dono, data_solicitacao, status_adocao)
    VALUES (?, ?, ?, NOW(), 'pendente')
  `;
  const [result] = await pool.query(query, [animalId, requesterId, animal.id_cliente_cadastrou]);

  return { id_adocao: result.insertId, id_animal: animalId, id_cliente_solicitante: requesterId };
}

async function findSentRequests(requesterId) {
  const query = `
    SELECT a.id_adocao, an.nome as nome_animal, an.imagem_animal, a.data_solicitacao, a.status_adocao
    FROM adocao a
    JOIN animal an ON a.id_animal = an.id_animal
    WHERE a.id_cliente_solicitante = ?
    ORDER BY a.data_solicitacao DESC
  `;
  const [requests] = await pool.query(query, [requesterId]);
  return requests;
}

async function findReceivedRequests(ownerId) {
  const query = `
    SELECT a.id_adocao, an.nome as nome_animal, c.nome as nome_solicitante, c.email as email_solicitante, a.data_solicitacao, a.status_adocao
    FROM adocao a
    JOIN animal an ON a.id_animal = an.id_animal
    JOIN cliente c ON a.id_cliente_solicitante = c.id_cliente
    WHERE a.id_cliente_dono = ? AND a.status_adocao = 'pendente'
    ORDER BY a.data_solicitacao DESC
  `;
  const [requests] = await pool.query(query, [ownerId]);
  return requests;
}

async function resolveRequest(adoptionId, ownerId, status) {
  if (status !== 'aprovada' && status !== 'rejeitada') {
    throw new Error("Status inválido. Use 'aprovada' ou 'rejeitada'.");
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Pega os dados da adoção e verifica se o usuário é o dono
    const [adoptionRows] = await connection.query("SELECT * FROM adocao WHERE id_adocao = ? AND id_cliente_dono = ?", [adoptionId, ownerId]);
    const adoption = adoptionRows[0];

    if (!adoption) {
      throw new Error('Solicitação de adoção não encontrada ou você não tem permissão para resolvê-la.');
    }
    if (adoption.status_adocao !== 'pendente') {
      throw new Error('Esta solicitação já foi resolvida.');
    }

    const { id_animal } = adoption;

    // 2. Se for aprovada, realiza uma série de ações
    if (status === 'aprovada') {
      // Atualiza o status da solicitação atual para 'aprovada'
      await connection.query("UPDATE adocao SET status_adocao = 'aprovada' WHERE id_adocao = ?", [adoptionId]);

      // Atualiza o status do animal para 'adotado'
      await connection.query("UPDATE animal SET status_adocao = 'adotado' WHERE id_animal = ?", [id_animal]);

      // Rejeita todas as outras solicitações pendentes para este animal
      await connection.query("UPDATE adocao SET status_adocao = 'rejeitada' WHERE id_animal = ? AND status_adocao = 'pendente'", [id_animal]);
    } else { // Se for rejeitada
      // Apenas atualiza o status desta solicitação para 'rejeitada'
      await connection.query("UPDATE adocao SET status_adocao = 'rejeitada' WHERE id_adocao = ?", [adoptionId]);
    }

    // 3. Confirma a transação
    await connection.commit();
    return true;

  } catch (error) {
    await connection.rollback(); // Desfaz tudo em caso de erro
    throw error; // Propaga o erro para o controller
  } finally {
    connection.release(); // Libera a conexão de volta para o pool
  }
}

module.exports = { createRequest, findSentRequests, findReceivedRequests, resolveRequest };