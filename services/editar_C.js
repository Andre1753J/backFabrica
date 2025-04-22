import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function cadastropt2(key, nome, cpf, estado, rua, cep, complemento, dt_nascimento) {
    const conexao = await pool.getConnection();
    console.log(key, nome, cpf, estado, rua, cep, complemento, dt_nascimento);

    const keyParts = quebrarKey(key);
    const id = keyParts[0];
    const senha = keyParts[2];

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

export async function editar(key, nome, cpf, estado, rua, cep, complemento, dt_nascimento) {
    const conexao = await pool.getConnection();
    console.log(key, nome, cpf, estado, rua, cep, complemento, dt_nascimento);

    const campos = {};
    if (nome !== undefined) campos.nome = nome;
    if (cpf !== undefined) campos.cpf = cpf;
    if (estado !== undefined) campos.estado = estado;
    if (rua !== undefined) campos.rua = rua;
    if (cep !== undefined) campos.cep = cep;
    if (complemento !== undefined) campos.complemento = complemento;
    if (dt_nascimento !== undefined) campos.dt_nascimento = dt_nascimento;

    console.log(campos);

    const [id, ...rest] = key.split("=-=");
    const after = rest.join("=-=");
    const [email, ...rest2] = after.split("=-=");
    const senha = rest2.join('=-=');

    // const keyParts = quebrarKey(key);
    // const id = keyParts[0];
    // const email = keyParts[1];
    // const senha = keyParts[2];

    // Construir dinamicamente a cláusula SET
    const setClause = Object.keys(campos)
        .map((campo) => `${campo} = ?`)
        .join(', ');

    const query = `UPDATE cliente SET ${setClause} WHERE (id, email, senha) = (?, ?, ?)`;

    // Criar os valores para o parâmetro
    const valores = [...Object.values(campos), id, email, senha];

    const retorno = await executaQuery(conexao, query, valores);
    conexao.release();
    return retorno;
}