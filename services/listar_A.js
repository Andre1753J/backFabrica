import pool from './connection.js';

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function listarAnimaisDisponiveis() {
    const conexao = await pool.getConnection();

    const query = `
        SELECT 
            a.id, a.nome, a.dt_nascimento, a.sexo, a.doador, a.descricao,
            a.castrado, a.vacinado, a.vermifugado, a.disponivel,
            e.nome AS especie, r.nome AS raca, c.nome AS cor, p.nome AS porte
        FROM animal a
        JOIN Especie e ON a.idEspecie = e.idEspecie
        JOIN Raca r ON a.idRaca = r.idRaca
        JOIN Cor c ON a.idCor = c.idCor
        JOIN Porte p ON a.idPorte = p.idPorte
        WHERE a.disponivel = 1
    `;

    const animais = await executaQuery(conexao, query);
    conexao.release();

    const animaisFormatados = animais.map(animal => ({
        id: animal.id,
        nome: animal.nome,
        dt_nascimento: animal.dt_nascimento,
        sexo: animal.sexo,
        doador: animal.doador,
        descricao: animal.descricao,
        castrado: !!animal.castrado,
        vacinado: !!animal.vacinado,
        vermifugado: !!animal.vermifugado,
        disponivel: !!animal.disponivel,
        especie: animal.especie,
        raca: animal.raca,
        cor: animal.cor,
        porte: animal.porte
    }));

    return animaisFormatados;
}