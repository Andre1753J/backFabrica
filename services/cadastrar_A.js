import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function cadastrar_A(
    key, nome, data_nascimento, sexo, descricao,
    castrado, vacinado, vermifugado, idEspecie, idRaca, idCor, idPorte) {
    const conexao = await pool.getConnection();
    const [id, , senha] = quebrarKey(key);

    const query = `
        INSERT INTO animal (
            nome, dt_nascimento, sexo, disponivel, descricao,
            castrado, vacinado, vermifugado,
            doador, adotador, idEspecie, idRaca, idCor, idPorte
        )
        SELECT ?, ?, ?, 1, ?, ?, ?, ?, ?, null, ?, ?, ?, ?
        FROM cliente
        WHERE id = ? AND senha = ?
    `;
    // Ordem dos parâmetros conforme o insert acima
    const params = [
        nome, data_nascimento, sexo, descricao, castrado, vacinado, vermifugado,
        id, // doador
        idEspecie, idRaca, idCor, idPorte,
        id, senha // para validação do cliente
    ];

    const retorno = await executaQuery(conexao, query, params);
    conexao.release();
    return retorno;
}