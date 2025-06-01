import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function cadastropt2(
    key, nome, cpf, cep, complemento,
    dt_nascimento, telefone1, rg,
    sexo, bairro
) {
    const conexao = await pool.getConnection();
    const [id, email, senha] = key.split("=-=");

    const retorno = await atualizarCliente(
        conexao, nome, cpf, cep, complemento,
        dt_nascimento, telefone1, rg,
        sexo, bairro,
        id, email, senha
    );

    if (retorno.affectedRows === 0) {
        throw new Error("Erro ao editar o cliente, verifique os dados e tente novamente.");
    }

    conexao.release();
    return retorno;
}

async function atualizarCliente(
    conexao, nome, cpf, cep, complemento,
    dt_nascimento, telefone1, rg,
    sexo, bairro,
    id, email, senha
) {
    const campos = {
        nome, cpf, cep, dt_nascimento, telefone1,
        rg, sexo, bairro
    };

    // Adiciona "complemento" se ele for definido
    if (complemento !== undefined) {
        campos.complemento = complemento;
    }

    const setClause = Object.keys(campos)
        .map(campo => `${campo} = ?`)
        .join(', ');

    const valores = [...Object.values(campos), id, email, senha];

    const query = `UPDATE cliente SET ${setClause} WHERE (id, email, senha) = (?, ?, ?)`;

    return await executaQuery(conexao, query, valores);
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