import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function editar_A(key, nome, idade, sexo, disponivel, adotador) {
    const conexao = await pool.getConnection();
    console.log(key, nome, idade, sexo, disponivel, adotador);

    const campos = {};
    if (nome !== undefined) campos.nome = nome;
    if (idade !== undefined) campos.idade = idade;
    if (sexo !== undefined) campos.sexo = sexo;
    if (disponivel !== undefined) campos.disponivel = disponivel;
    if (adotador !== undefined) campos.adotador = adotador;

    console.log(campos);

    const keyParts = quebrarKey(key);
    const id = keyParts[0];
    const senha = keyParts[2];

    // Construir dinamicamente a cláusula SET
    const setClause = Object.keys(campos)
        .map((campo) => `${campo} = ?`)
        .join(', ');

    const query = `UPDATE animal SET ${setClause} FROM cliente WHERE (id, senha) = (?, ?)`;
    const params = [...Object.values(campos), id, senha];

    const retorno = await executaQuery(conexao, query, params);
    conexao.release();
    return retorno;
}