import pool from "./connection.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function editar(key, nome, cpf, estado, rua, cep, complemento, dt_nascimento) {
    const conexao = await pool.getConnection();
    console.log(key, nome, cpf, estado, rua, cep, complemento, dt_nascimento);

    const [id, ...rest] = key.split("=-=");
    const after = rest.join("=-=");
    const [email, ...rest2] = after.split("=-=");
    const senha = rest2.join('=-=');

    const retorno = await temComplemento(conexao, nome, cpf, estado, rua, cep, complemento, dt_nascimento, id, email, senha);

    if (retorno.affectedRows == 0) {
        throw new Error("Erro ao editar o cliente, verifique os dados e tente novamente.");
    }
    conexao.release();
    return retorno;
}

async function temComplemento(conexao, nome, cpf, estado, rua, cep, complemento, dt_nascimento, id, email, senha) {
    if (complemento == undefined) {
        const query = 'UPDATE cliente SET nome = ?, cpf = ?, estado = ?, rua = ?, cep = ?, dt_nascimento = ? WHERE (id, email, senha) = (?, ?, ?)';
        return await executaQuery(conexao, query, [nome, cpf, estado, rua, cep, dt_nascimento, id, email, senha]);
    } else {
        const query = 'UPDATE cliente SET nome = ?, cpf = ?, estado = ?, rua = ?, cep = ?, complemento = ?, dt_nascimento = ? WHERE (id, email, senha) = (?, ?, ?)';
        return await executaQuery(conexao, query, [nome, cpf, estado, rua, cep, complemento, dt_nascimento, id, email, senha]);
    }
}