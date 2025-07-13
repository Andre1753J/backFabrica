import pool from "./connection.js";
import bcrypt from 'bcrypt';
import { gerarKey } from "./gerarKey.js";

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

        // 2. Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10); // 10 é o salt rounds

        // 3. Inserir o novo cliente com a senha hasheada
        const insertQuery = 'INSERT INTO cliente (email, senha) VALUES (?, ?)';
        const resultadoInsert = await executaQuery(conexao, insertQuery, [email, senhaHash]);

        // 4. Obter o ID do usuário recém-criado
        // CORREÇÃO: O ID de uma nova inserção vem de `insertId`.
        const novoId = resultadoInsert.insertId;

        if (!novoId || novoId === 0) {
            throw new Error("Falha ao criar o usuário no banco de dados.");
        }

        // 5. Criar a chave de autenticação com o ID correto e a senha hasheada
        const key = gerarKey(novoId, email, senhaHash);

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
        const senhaCorreta = await bcrypt.compare(senha, cliente.senha);

        if (!senhaCorreta) {
            throw new Error("E-mail ou senha incorretos.");
        }
        return gerarKey(cliente.id, cliente.email, cliente.senha);
    } finally {
        conexao.release();
    }
}