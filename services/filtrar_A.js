import pool from './connection.js';

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

/**
 * Filtro simples para animais.
 * Parâmetros opcionais: especie, sexo, disponivel
 */
export async function filtrarAnimaisSimples({ especie, sexo, porte, disponivel }) {
    const conexao = await pool.getConnection();

    let query = `
        SELECT 
            a.id, a.nome, a.sexo, e.nome AS especie, p.nome as porte, a.disponivel,
            (SELECT i.nome_imagem FROM animalImg i WHERE i.animal = a.id ORDER BY i.id LIMIT 1) AS imagem
        FROM animal a
        LEFT JOIN Especie e ON a.idEspecie = e.idEspecie
        LEFT JOIN Porte p ON a.idPorte = p.idPorte
        WHERE 1=1
    `;
    const params = [];

    if (especie) {
        query += ' AND e.nome = ?';
        params.push(especie);
    }
    if (sexo) {
        query += ' AND a.sexo = ?';
        params.push(sexo);
    }
    if (porte) {
        query += ' AND p.nome = ?';
        params.push(porte);
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
        sexo: animal.sexo === 'M' ? 'macho' : 'femea',
        imagem: animal.imagem,
        especie: animal.especie,
        porte: animal.porte,
        disponivel: !!animal.disponivel
    }));
}