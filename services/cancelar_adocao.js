import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function cancelarAdocao(key, animalID) {
    const [id, , senha] = quebrarKey(key);
    const conexao = await pool.getConnection();

    try {
        // Verifica se existe a solicitação de adoção
        const adocao = await executaQuery(conexao,
            `SELECT * FROM adocao WHERE id_animal = ? AND id_cliente = ?`,
            [animalID, id]
        );

        if (adocao.length === 0) {
            throw new Error("Adoção não encontrada ou você não é o adotador.");
        }

        // Remove a solicitação da tabela adocao
        await executaQuery(conexao,
            `DELETE FROM adocao WHERE id_animal = ? AND id_cliente = ?`,
            [animalID, id]
        );

        // Opcional: limpa o campo adotador do animal, se essa adoção era a aprovada
        await executaQuery(conexao,
            `UPDATE animal SET adotador = NULL, disponivel = 1 WHERE id = ? AND adotador = ?`,
            [animalID, id]
        );

        return true;
    } finally {
        conexao.release();
    }
}
