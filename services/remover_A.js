import pool from "./connection.js"
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {   
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function removerAnimal(key, animalID) {
    const [id, , senha] = quebrarKey(key);
    const conexao = await pool.getConnection();

    const query = `
        DELETE animal FROM animal
        INNER JOIN cliente ON cliente.id = animal.doador
        WHERE cliente.id = ? AND cliente.senha = ? AND animal.id = ?`;

    const retorno = await executaQuery(conexao, query, [id, senha, animalID]);
    conexao.release();

    if (retorno.affectedRows === 0) {
        throw new Error("Animal não encontrado ou você não tem permissão para deletar.");
    }

    return true;
}
