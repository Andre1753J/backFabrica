import pool from "./connection.js"

async function executaQuery(conexao, query, params) {   
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function cadastrar(email, senha) {
    const conexao = await pool.getConnection();
    const query = 'INSERT INTO cliente (email, senha) SELECT (?), (?) WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE email = (?) )';

    const retorno = await executaQuery(conexao, query, [email, senha, email]);

    return retorno;
}