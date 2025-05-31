import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function deletarCliente(key) {
    const conexao = await pool.getConnection();
    const [id, email, senha] = quebrarKey(key);

    const query = `DELETE FROM cliente WHERE id = ? AND email = ? AND senha = ?`;
    const retorno = await executaQuery(conexao, query, [id, email, senha]);

    conexao.realease();

    if (retorno.affectedRows === 0) {
        throw new Error("Não foi possível deletar o cliente, Verifique os dados.");
    }

    return true;
}