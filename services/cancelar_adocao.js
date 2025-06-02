import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function cancelarAdocao(key, animalID) {
    const [id] = quebrarKey(key);
    const conexao = await pool.getConnection();

    try {
        // Verifica se existe a solicitação de adoção
        const adocao = await executaQuery(conexao,
            `SELECT * FROM adocao WHERE id_animal = ? AND id_cliente = ?`,
            [animalID, id]
        );

        if (adocao.length === 0) {
            return { cancelado: false, motivo: "Adoção não encontrada ou você não é o adotador." };
        }

        // Remove a solicitação da tabela adocao
        const [deleteResult] = await conexao.execute(
            `DELETE FROM adocao WHERE id_animal = ? AND id_cliente = ?`,
            [animalID, id]
        );

        // Limpa o campo adotador do animal, se essa adoção era a aprovada
        const [updateResult] = await conexao.execute(
            `UPDATE animal SET adotador = NULL, disponivel = 1 WHERE id = ? AND adotador = ?`,
            [animalID, id]
        );

        return {
            cancelado: deleteResult.affectedRows > 0,
            atualizouAnimal: updateResult.affectedRows > 0
        };
    } finally {
        conexao.release();
    }
}
