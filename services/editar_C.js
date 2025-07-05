import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

// Função para atualizar todos os campos da tabela cliente
export async function cadastropt2(
    key, nome, cpf, rg, dt_nascimento, sexo,
    cep, endereco, bairro, estado, cidade, complemento,
    telefone, telefone2
) {
    const conexao = await pool.getConnection();
    const [id, email, senha] = key.split("=-=");

    const campos = {
        nome, cpf, rg, dt_nascimento, sexo,
        cep, endereco, bairro, estado, cidade, complemento,
        telefone, telefone2
    };

    // Remove campos undefined para não sobrescrever com null
    Object.keys(campos).forEach(k => campos[k] === undefined && delete campos[k]);

    const setClause = Object.keys(campos)
        .map(campo => `${campo} = ?`)
        .join(', ');

    const valores = [...Object.values(campos), id, email, senha];

    const query = `UPDATE cliente SET ${setClause} WHERE id = ? AND email = ? AND senha = ?`;

    const retorno = await executaQuery(conexao, query, valores);

    if (retorno.affectedRows === 0) {
        throw new Error("Erro ao editar o cliente, verifique os dados e tente novamente.");
    }

    conexao.release();
    return retorno;
}

// Função para editar campos selecionados do cliente
export async function editar_c(
    key, nome, cpf, rg, dt_nascimento, sexo,
    cep, endereco, bairro, estado, cidade, complemento,
    telefone, telefone2
) {
    const conexao = await pool.getConnection();

    const campos = {};
    if (nome !== undefined) campos.nome = nome;
    if (cpf !== undefined) campos.cpf = cpf;
    if (rg !== undefined) campos.rg = rg;
    if (dt_nascimento !== undefined) campos.dt_nascimento = dt_nascimento;
    if (sexo !== undefined) campos.sexo = sexo;
    if (cep !== undefined) campos.cep = cep;
    if (endereco !== undefined) campos.endereco = endereco;
    if (bairro !== undefined) campos.bairro = bairro;
    if (estado !== undefined) campos.estado = estado;
    if (cidade !== undefined) campos.cidade = cidade;
    if (complemento !== undefined) campos.complemento = complemento;
    if (telefone !== undefined) campos.telefone = telefone;
    if (telefone2 !== undefined) campos.telefone2 = telefone2;

    const [id, email, senha] = quebrarKey(key);

    const setClause = Object.keys(campos)
        .map((campo) => `${campo} = ?`)
        .join(', ');

    const query = `UPDATE cliente SET ${setClause} WHERE id = ? AND email = ? AND senha = ?`;

    const valores = [...Object.values(campos), id, email, senha];

    const retorno = await executaQuery(conexao, query, valores);
    conexao.release();
    return retorno;
}