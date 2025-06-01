import pool from './connection.js';

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function listarAnimaisDisponiveis() {
    const conexao = await pool.getConnection();

    const query = 'SELECT id, nome, idade, sexo, doador FROM animal WHERE disponivel = 1';

    const animais = await executaQuery(conexao, query);
    conexao.release();

    const animaisFormatados = animais.map(animal => ({
        ...animal,
        sexo: animal.sexo === 1 ? 'M' : 'F',
        disponivel: true
    }));

    return animaisFormatados;
}