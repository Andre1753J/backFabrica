import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function solicitacoesRecebidas(key) {
    const [id, , senha] = quebrarKey(key);
    const conexao = await pool.getConnection();
    const query = `
        SELECT animal.id, animal.nome, cliente.email as solicitante_email
        FROM animal
        JOIN cliente ON cliente.id = animal.adotador
        WHERE animal.doador = ? AND animal.adotador IS NOT NULL
    `;
    const resultado = await executaQuery(conexao, query, [id]);
    conexao.release();
    return resultado;
}

