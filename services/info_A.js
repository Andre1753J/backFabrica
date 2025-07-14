import pool from './connection.js';

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

/**
 * Busca detalhada de um animal por ID.
 */
export async function detalharAnimal(animalID) {
    const conexao = await pool.getConnection();
    const animalQuery = `
        SELECT 
            a.id, a.nome, a.dt_nascimento, a.sexo, a.doador, a.adotador, a.descricao,
            a.castrado, a.vacinado, a.vermifugado, a.disponivel,
            e.nome AS especie, r.nome AS raca, c.nome AS cor, p.nome AS porte,
            d.nome AS nome_doador
        FROM animal a
        LEFT JOIN Especie e ON a.idEspecie = e.idEspecie
        LEFT JOIN Raca r ON a.idRaca = r.idRaca
        LEFT JOIN Cor c ON a.idCor = c.idCor
        LEFT JOIN Porte p ON a.idPorte = p.idPorte
        LEFT JOIN cliente d ON a.doador = d.id
        WHERE a.id = ?
        LIMIT 1
    `;
    const animalResult = await executaQuery(conexao, animalQuery, [animalID]);

    if (!animalResult.length) {
        conexao.release();
        throw new Error("Animal não encontrado");
    }

    const animal = animalResult[0];

    const imagensQuery = `SELECT nome_imagem FROM animalImg WHERE animal = ? ORDER BY id`;
    const imagensResult = await executaQuery(conexao, imagensQuery, [animalID]);

    conexao.release();

    return {
        id: animal.id,
        nome: animal.nome,
        dt_nascimento: animal.dt_nascimento,
        sexo: animal.sexo,
        doador: animal.doador,
        adotador: animal.adotador,
        descricao: animal.descricao,
        castrado: !!animal.castrado,
        vacinado: !!animal.vacinado,
        vermifugado: !!animal.vermifugado,
        disponivel: !!animal.disponivel,
        especie: animal.especie,
        raca: animal.raca,
        cor: animal.cor,
        porte: animal.porte,
        nome_doador: animal.nome_doador,
        imagens: imagensResult.map(img => img.nome_imagem)
    };
}