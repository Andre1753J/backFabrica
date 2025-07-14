import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const [rows] = await conexao.execute(query, params);
    return rows;
}

export async function minhasSolicitacoes(key) {
    const [id_cliente] = quebrarKey(key);
    const conexao = await pool.getConnection();
    const query = `
        SELECT
            a.id AS id_adocao, a.status,
            an.id AS id_animal, an.nome AS nome_animal,
            (SELECT i.nome_imagem FROM animalImg i WHERE i.animal = an.id ORDER BY i.id LIMIT 1) AS imagem_animal
        FROM adocao a
        JOIN animal an ON a.id_animal = an.id
        WHERE a.id_cliente = ?`;
    const resultado = await executaQuery(conexao, query, [id_cliente]);
    conexao.release();
    return resultado;
}