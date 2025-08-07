import pool from '../../config/database.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwtHelper.js';

/**
 * Registra um novo usuário no sistema.
 */
export async function registerUser(userData) {
  const { nome, email, senha, telefone, data_nascimento, rua, numero, cidade, estado, cep } = userData;

  // 1. Validação dos dados de entrada
  if (!nome || !email || !senha || !data_nascimento) {
    throw new Error('Campos obrigatórios (nome, email, senha, data_nascimento) não foram preenchidos.');
  }

  // 2. Verificar se o e-mail já está em uso
  const [existingUser] = await pool.query('SELECT id_cliente FROM cliente WHERE email = ?', [email]);
  if (existingUser.length > 0) {
    throw new Error('Este e-mail já está cadastrado.');
  }

  // 3. Criptografar a senha
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(senha, salt);

  // 4. Inserir o novo usuário no banco de dados
  const query = `
    INSERT INTO cliente (nome, email, senha, telefone, data_nascimento, rua, numero, cidade, estado, cep)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(query, [nome, email, hashedPassword, telefone, data_nascimento, rua, numero, cidade, estado, cep]);

  // 5. Preparar os dados do usuário para o retorno (sem a senha!)
  const newUser = {
    id_cliente: result.insertId,
    nome,
    email,
    telefone,
    data_nascimento
  };

  // 6. Gerar um token para o novo usuário já logar automaticamente
  const token = generateToken(newUser);

  return { newUser, token };
}

/**
 * Autentica um usuário e retorna um token.
 */
export async function loginUser(email, senha) {
  // 1. Buscar o usuário pelo e-mail
  const [rows] = await pool.query('SELECT * FROM cliente WHERE email = ?', [email]);
  const user = rows[0];

  if (!user) {
    throw new Error('Credenciais inválidas. Verifique o e-mail e a senha.');
  }

  // 2. Comparar a senha fornecida com a senha criptografada no banco
  const isPasswordMatch = await bcrypt.compare(senha, user.senha);
  if (!isPasswordMatch) {
    throw new Error('Credenciais inválidas. Verifique o e-mail e a senha.');
  }

  // 3. Gerar o token de autenticação
  const token = generateToken(user);
  delete user.senha; // NUNCA retorne a senha para o cliente

  return { user, token };
}