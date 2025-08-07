const pool = require('../../config/database');
const { calculateAge } = require('../../utils/ageCalculator');

async function create(animalData, ownerId, imageFile) {
  const { nome, data_nascimento, especie, porte, sexo, descricao } = animalData;

  if (!nome || !data_nascimento || !especie || !porte || !sexo) {
    throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
  }

  // O caminho da imagem para salvar no banco. Se não houver imagem, salva null.
  const imagePath = imageFile ? imageFile.path.replace(/\\/g, '/') : null;

  const query = `
    INSERT INTO animal (nome, data_nascimento, especie, porte, sexo, descricao, imagem_animal, id_cliente_cadastrou, status_adocao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'disponivel')
  `;
  const [result] = await pool.query(query, [nome, data_nascimento, especie, porte, sexo, descricao, imagePath, ownerId]);

  return { id_animal: result.insertId, ...animalData, imagem_animal: imagePath };
}

async function findAll(filters) {
  let query = `
    SELECT id_animal, nome, especie, porte, sexo, imagem_animal, data_nascimento
    FROM animal
    WHERE status_adocao = 'disponivel'
  `;
  const params = [];

  // Adiciona filtros dinamicamente à query
  if (filters.especie) {
    query += ' AND especie = ?';
    params.push(filters.especie);
  }
  if (filters.sexo) {
    query += ' AND sexo = ?';
    params.push(filters.sexo);
  }
  if (filters.porte) {
    query += ' AND porte = ?';
    params.push(filters.porte);
  }

  const [animals] = await pool.query(query, params);

  // Adiciona a idade calculada a cada animal
  return animals.map(animal => ({
    ...animal,
    idade: calculateAge(animal.data_nascimento)
  }));
}

async function findById(animalId) {
  const query = `
    SELECT a.*, c.nome as nome_dono, c.telefone as telefone_dono, c.cidade, c.estado
    FROM animal a
    JOIN cliente c ON a.id_cliente_cadastrou = c.id_cliente
    WHERE a.id_animal = ?
  `;
  const [rows] = await pool.query(query, [animalId]);
  const animal = rows[0];

  if (!animal) {
    throw new Error('Animal não encontrado.');
  }

  animal.idade = calculateAge(animal.data_nascimento);
  return animal;
}

async function remove(animalId, ownerId) {
  // Primeiro, verifica se o usuário que está tentando deletar é o dono do animal
  const [rows] = await pool.query('SELECT id_cliente_cadastrou FROM animal WHERE id_animal = ?', [animalId]);
  const animal = rows[0];

  if (!animal) {
    throw new Error('Animal não encontrado.');
  }

  if (animal.id_cliente_cadastrou !== ownerId) {
    throw new Error('Ação não permitida. Você não é o dono deste animal.');
  }

  // Antes de deletar o animal, é uma boa prática deletar as solicitações de adoção pendentes para ele
  await pool.query("DELETE FROM adocao WHERE id_animal = ? AND status_adocao = 'pendente'", [animalId]);

  const [result] = await pool.query('DELETE FROM animal WHERE id_animal = ?', [animalId]);
  if (result.affectedRows === 0) {
    throw new Error('Falha ao remover o animal.');
  }

  return true;
}

module.exports = { create, findAll, findById, remove };