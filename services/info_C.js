import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function buscarCliente(key) {
    const conexao = await pool.getConnection();
    const [id, email, senha] = quebrarKey(key);

    const query = `
        SELECT id, email, nome, cpf, cep, complemento, dt_nascimento, telefone
        FROM cliente
        WHERE id = ? AND email = ? AND senha = ?`;

    const resultado = await executaQuery(conexao, query, [id, email, senha]);
    conexao.release();

    if (resultado.length === 0) {
        throw new Error("Cliente não encontrado ou chave inválida");
    }
    return resultado[0];
}