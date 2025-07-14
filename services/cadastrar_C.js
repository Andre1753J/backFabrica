import pool from "./connection.js";
import { gerarKey } from "./gerar_key.js";

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

        // 2. Inserir o novo cliente com a senha em texto plano (sem hash)
        const insertQuery = 'INSERT INTO cliente (email, senha) VALUES (?, ?)';
        const resultadoInsert = await executaQuery(conexao, insertQuery, [email, senha]);

        // 3. Obter o ID do usuário recém-criado
        const novoId = resultadoInsert.insertId;

        if (!novoId || novoId === 0) {
            throw new Error("Falha ao criar o usuário no banco de dados.");
        }

        // 4. Criar a chave de autenticação com a senha em texto plano
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

        // Compara a senha enviada com a senha em texto plano do banco de dados
        const senhaCorreta = senha === cliente.senha;

        if (!senhaCorreta) {
            throw new Error("E-mail ou senha incorretos.");
        }
        const key = gerarKey(cliente.id, cliente.email, cliente.senha);
        return { key };
    } finally {
        conexao.release();
    }
}