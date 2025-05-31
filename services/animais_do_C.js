import pool from "./connection.js"
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {   
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function meusAnimais(key) {
    const conexao = await pool.getConnection();
    const [id, , senha] = quebrarKey(key);

    const query = `
    SELECT id, nome, idade, sexo, disponivel, adotador
    FROM animal
    WHERE doador =?`;

    const resultado = await executaQuery(conexao, query, [id]);
    conexao.release();
    return resultado;
}