import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function cancelarAdocao(key, animalID) {
    const [id, , senha] = quebrarKey(key);
    const conexao = await pool.getConnection();
    const query = `
        UPDATE animal
        SET adotador = NULL
        WHERE id = ? AND adotador = ?
    `;
    const retorno = await executaQuery(conexao, query, [animalID, id]);
    conexao.release();

    if (retorno.affectedRows === 0) {
        throw new Error("Adoção não encontrada ou você não é o adotador.");
    }

    return true;
}
