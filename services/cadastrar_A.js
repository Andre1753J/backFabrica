import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function cadastrar_A(key, nome, idade, sexo, disponivel) {
    const conexao = await pool.getConnection();
    const query = 'INSERT INTO animal (nome, idade, sexo, disponivel, doador, adotador) SELECT ?, ?, ?, ?, ?, null FROM cliente WHERE id = ? AND senha = ?';

    const keyParts = quebrarKey(key);
    const id = keyParts[0];
    const senha = keyParts[2];
    console.log(keyParts);

    const retorno = await executaQuery(conexao, query, [nome, idade, sexo, disponivel, id, id, senha]);
    conexao.release();
    return retorno;
};