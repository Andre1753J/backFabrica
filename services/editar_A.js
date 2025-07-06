import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function editar_A(
    key, nome, dt_nascimento, sexo, disponivel,
    descricao, // Descrição ou observações gerais
    castrado, vacinado, vermifugado, adotador, idEspecie, idRaca, idCor, idPorte, 
    animalID // ID do animal a ser editado
) {
    if (disponivel !== undefined && typeof disponivel !== "boolean") {
        throw new Error("Disponivel tem que ser um boolean");
    }
    const conexao = await pool.getConnection();
    const campos = {};
    if (nome !== undefined) campos.nome = nome;
    if (dt_nascimento !== undefined) campos.dt_nascimento = dt_nascimento;
    if (sexo !== undefined) campos.sexo = sexo;
    if (disponivel !== undefined) campos.disponivel = disponivel;
    if (descricao !== undefined) campos.descricao = descricao;
    if (castrado !== undefined) campos.castrado = castrado;
    if (vacinado !== undefined) campos.vacinado = vacinado;
    if (vermifugado !== undefined) campos.vermifugado = vermifugado;
    if (adotador !== undefined) campos.adotador = adotador;
    if (idEspecie !== undefined) campos.idEspecie = idEspecie;
    if (idRaca !== undefined) campos.idRaca = idRaca;
    if (idCor !== undefined) campos.idCor = idCor;
    if (idPorte !== undefined) campos.idPorte = idPorte;

    if (Object.keys(campos).length === 0) {
        throw new Error("Nenhum campo para atualizar.");
    }

    const [id, , senha] = quebrarKey(key);

    const setClause = Object.keys(campos)
        .map((campo) => `animal.${campo} = ?`)
        .join(', ');

    const query = `
        UPDATE animal
        INNER JOIN cliente ON cliente.id = animal.doador
        SET ${setClause}
        WHERE cliente.id = ? AND cliente.senha = ? AND animal.id = ?;
    `;
    const params = [...Object.values(campos), id, senha, animalID];
    const retorno = await executaQuery(conexao, query, params);
    conexao.release();
    return retorno;
}