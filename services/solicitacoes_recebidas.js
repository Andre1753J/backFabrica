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
        SELECT 
            adocao.id AS id_adocao,
            adocao.status,
            animal.id AS id_animal,
            animal.nome AS nome_animal,
            cliente.id AS id_cliente,
            cliente.nome AS nome_solicitante,
            cliente.email AS email_solicitante
        FROM adocao
        JOIN animal ON adocao.id_animal = animal.id
        JOIN cliente ON adocao.id_cliente = cliente.id
        WHERE animal.doador = ?
    `;

    const resultado = await executaQuery(conexao, query, [id]);
    conexao.release();
    return resultado;
}
