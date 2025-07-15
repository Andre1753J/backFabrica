import pool from "./connection.js";
import { gerarKey } from "./gerar_key.js";
import bcrypt from 'bcrypt';

async function executaQuery(conexao, query, params) {
    // Para INSERT, o resultado não é um array de linhas, mas um objeto de status.
    const [resultado] = await conexao.execute(query, params);
    return resultado;
}

/**
 * Cadastra a primeira parte do cliente (email e senha) e retorna uma chave de autenticação.
 * @param {string} email 
 * @param {string} senha 
 * @returns {[object, string]} Retorna o resultado da query e a chave do novo cliente.
 */
export async function cadastrar(email, senha) {
    const conexao = await pool.getConnection();
    try {
        // 1. Verificar se o e-mail já existe
        const emailExistsQuery = 'SELECT id FROM cliente WHERE email = ?';
        const existingUser = await executaQuery(conexao, emailExistsQuery, [email]);

        if (existingUser.length > 0) {
            throw new Error("Este e-mail já está em uso.");
        }

        // 2. Criptografar a senha antes de salvar
        const saltRounds = 10; // Fator de custo para o hash
        const senhaHasheada = await bcrypt.hash(senha, saltRounds);

        // 3. Inserir o novo cliente com a senha criptografada
        const insertQuery = 'INSERT INTO cliente (email, senha) VALUES (?, ?)';
        const resultadoInsert = await executaQuery(conexao, insertQuery, [email, senhaHasheada]);

        // 4. Obter o ID do usuário recém-criado
        const novoId = resultadoInsert.insertId;

        if (!novoId || novoId === 0) {
            throw new Error("Falha ao criar o usuário no banco de dados.");
        }

        // 5. Criar a chave de autenticação (recomendo não incluir a senha aqui)
        const key = gerarKey(novoId, email, senha);

        return [resultadoInsert, key];

    } finally {
        conexao.release();
    }
}

export async function login(email, senha) {
    const conexao = await pool.getConnection();
    try {
        const query = 'SELECT id, email, senha FROM cliente WHERE email = ?';
        const resultado = await executaQuery(conexao, query, [email]);

        if (resultado.length === 0) {
            throw new Error("E-mail ou senha incorretos.");
        }

        const cliente = resultado[0];

        // Compara a senha enviada com a senha criptografada do banco de dados
        const senhaCorreta = await bcrypt.compare(senha, cliente.senha);

        if (!senhaCorreta) {
            throw new Error("E-mail ou senha incorretos.");
        }
        const key = gerarKey(cliente.id, cliente.email, cliente.senha); // A senha aqui ainda é a hasheada
        return { key };
    } finally {
        conexao.release();
    }
}