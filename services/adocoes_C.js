import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function minhasAdocoes(key) {
    const [id, , senha] = quebrarKey(key);
    const conexao = await pool.getConnection();
    const query = `
        SELECT id, nome, idade, sexo, disponivel
        FROM animal
        WHERE adotador = ?
    `;
    const resultado = await executaQuery(conexao, query, [id]);
    conexao.release();
    return resultado;
}