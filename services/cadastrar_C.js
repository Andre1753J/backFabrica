import pool from "./connection.js"

async function executaQuery(conexao, query, params) {   
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function cadastrar(email, senha) {
    const conexao = await pool.getConnection();
    const query = 'INSERT INTO cliente (email, senha) SELECT (?), (?) WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE email = (?) )';

    const retorno = await executaQuery(conexao, query, [email, senha, email]);

    console.log(retorno);
    conexao.release();
    return [retorno, `${retorno.insertId}=-=${email}=-=${senha}`];
}

export async function login(email, senha) {
    const conexao = await pool.getConnection();
    const query = 'SELECT id FROM cliente WHERE (email, senha) = (?, ?)';
    
    const retorno = await executaQuery(conexao, query, [email, senha]);
    conexao.release();
    if (retorno.length > 0) {
        const key = `${retorno[0].id}=-=${email}=-=${senha}`;
        return key;
    } else {
        throw new Error("Email ou senha inválidos");
    }

}