import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function editar_A(key, nome, idade, sexo, disponivel, adotador, animalID) {
    if (typeof disponivel != "boolean") {
        throw new Error("Disponivel tem que ser um boolean");
        
    }
    const conexao = await pool.getConnection();
    const campos = {};
    if (nome !== undefined) campos.nome = nome;
    if (idade !== undefined) campos.idade = idade;
    if (sexo !== undefined) campos.sexo = sexo;
    if (disponivel !== undefined) campos.disponivel = disponivel;
    if (adotador !== undefined) campos.adotador = adotador;

    const [id, , senha] = quebrarKey(key);

    const setClause = Object.keys(campos)
    .map((campo) => `${campo} = ?`)
    .join(', ');

    const query = `
    UPDATE animal
    INNER JOIN cliente ON cliente.id = animal.doador
    SET ${Object.keys(campos)
        .map((campo) => `animal.${campo} = ?`)
        .join(', ')}
    WHERE cliente.id = ? AND cliente.senha = ? AND animal.id = ?;
    `;
    const params = [...Object.values(campos), id, senha, animalID];
    const retorno = await executaQuery(conexao, query, params);
    conexao.release();
    return retorno;
}