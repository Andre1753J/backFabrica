import pool from './connection.js';

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

/**
 * Filtro simples para animais.
 * Parâmetros opcionais: especie, sexo, disponivel
 */
export async function filtrarAnimaisSimples({ especie, sexo, disponivel }) {
    const conexao = await pool.getConnection();

    let query = `
        SELECT 
            a.id, a.nome, a.sexo, e.nome AS especie, a.disponivel
        FROM animal a
        JOIN Especie e ON a.idEspecie = e.idEspecie
        WHERE 1=1
    `;
    const params = [];

    if (especie) {
        query += ' AND a.idEspecie = ?';
        params.push(especie);
    }
    if (sexo) {
        query += ' AND a.sexo = ?';
        params.push(sexo);
    }
    if (typeof disponivel === "boolean") {
        query += ' AND a.disponivel = ?';
        params.push(disponivel ? 1 : 0);
    }

    const animais = await executaQuery(conexao, query, params);
    conexao.release();

    return animais.map(animal => ({
        id: animal.id,
        nome: animal.nome,
        sexo: animal.sexo,
        especie: animal.especie,
        disponivel: !!animal.disponivel
    }));
}