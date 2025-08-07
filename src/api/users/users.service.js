const pool = require('../../config/database');
const bcrypt = require('bcrypt');
const { calculateAge } = require('../../utils/ageCalculator');
const { generateToken } = require('../../utils/jwtHelper');

/**
 * Busca o perfil de um usuário pelo seu ID.
 */
async function getUserProfileById(userId) {
  const query = 'SELECT id_cliente, nome, email, telefone, data_nascimento, rua, numero, cidade, estado, cep FROM cliente WHERE id_cliente = ?';
  const [rows] = await pool.query(query, [userId]);
  const user = rows[0];

  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  // Adiciona a idade calculada ao objeto do usuário
  user.idade = calculateAge(user.data_nascimento);

  return user;
}

/**
 * Atualiza o perfil de um usuário.
 */
async function updateUserProfile(userId, updatedData) {
  const { nome, email, telefone, data_nascimento, rua, numero, cidade, estado, cep, senha } = updatedData;

  // Constrói a query de atualização dinamicamente
  const fields = [];
  const values = [];

  if (nome) { fields.push('nome = ?'); values.push(nome); }
  if (email) { fields.push('email = ?'); values.push(email); }
  if (telefone) { fields.push('telefone = ?'); values.push(telefone); }
  if (data_nascimento) { fields.push('data_nascimento = ?'); values.push(data_nascimento); }
  if (rua) { fields.push('rua = ?'); values.push(rua); }
  if (numero) { fields.push('numero = ?'); values.push(numero); }
  if (cidade) { fields.push('cidade = ?'); values.push(cidade); }
  if (estado) { fields.push('estado = ?'); values.push(estado); }
  if (cep) { fields.push('cep = ?'); values.push(cep); }

  // Se uma nova senha foi fornecida, criptografa e adiciona à query
  if (senha) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);
    fields.push('senha = ?');
    values.push(hashedPassword);
  }

  if (fields.length === 0) {
    throw new Error('Nenhum dado para atualizar foi fornecido.');
  }

  const query = `UPDATE cliente SET ${fields.join(', ')} WHERE id_cliente = ?`;
  values.push(userId);

  await pool.query(query, values);

  // Busca os dados atualizados para retornar
  const updatedUser = await getUserProfileById(userId);

  // Gera um novo token caso o email (que faz parte do payload do token) tenha sido alterado
  const token = generateToken(updatedUser);

  return { updatedUser, token };
}

/**
 * Deleta o perfil de um usuário.
 */
async function deleteUserProfile(userId) {
  // IMPORTANTE: Aqui você pode precisar de uma lógica mais complexa,
  // como deletar ou desassociar os animais e adoções do usuário.
  // Por enquanto, vamos apenas deletar o usuário.
  const [result] = await pool.query('DELETE FROM cliente WHERE id_cliente = ?', [userId]);
  if (result.affectedRows === 0) {
    throw new Error('Usuário não encontrado para deleção.');
  }
  return true;
}

module.exports = { getUserProfileById, updateUserProfile, deleteUserProfile };