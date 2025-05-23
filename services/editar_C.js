import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function cadastropt2(key, nome, cpf, cep, complemento, dt_nascimento, telefone) {
    const conexao = await pool.getConnection();

    const keyParts = quebrarKey(key);
    const [id, email, senha] = keyParts;
    console.log(id, email, senha, nome, cpf, cep, complemento, dt_nascimento, telefone)
    const retorno = await temComplemento(conexao, nome, cpf, cep, complemento, dt_nascimento, telefone, id, email, senha);

    if (retorno.affectedRows == 0) {
        throw new Error("Erro ao editar o cliente, verifique os dados e tente novamente.");
    }
    conexao.release();
    return retorno;
}

async function temComplemento(conexao, nome, cpf, cep, complemento, dt_nascimento, telefone, id, email, senha) {
    if (typeof complemento == "undefined") {
        const query = 'UPDATE cliente SET nome = ?, cpf = ?, cep = ?, dt_nascimento = ?, telefone = ? WHERE (id, email, senha) = (?, ?, ?)';
        return await executaQuery(conexao, query, [nome, cpf, cep, dt_nascimento, telefone, id, email, senha]);
    } else {
        const query = 'UPDATE cliente SET nome = ?, cpf = ?, cep = ?, complemento = ?, dt_nascimento = ?, telefone = ? WHERE (id, email, senha) = (?, ?, ?)';
        return await executaQuery(conexao, query, [nome, cpf, cep, complemento, dt_nascimento, telefone, id, email, senha]);
    }
}

export async function editar_c(key, nome, cpf, cep, complemento, dt_nascimento, telefone) {
    const conexao = await pool.getConnection();

    const campos = {};
    if (nome !== undefined) campos.nome = nome;
    if (cpf !== undefined) campos.cpf = cpf;
    if (cep !== undefined) campos.cep = cep;
    if (complemento !== undefined) campos.complemento = complemento;
    if (dt_nascimento !== undefined) campos.dt_nascimento = dt_nascimento;
    if (telefone !== undefined) campos.telefone = telefone;

    const [id, email, senha] = quebrarKey(key);

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