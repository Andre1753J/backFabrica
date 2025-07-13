import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    // Usar destructuring para pegar o primeiro elemento (resultados ou OkPacket)
    const [resultado] = await conexao.execute(query, params);
    return resultado;
}

export async function cadastrar_A(
    key, nome, data_nascimento, sexo, descricao,
    castrado, vacinado, vermifugado, idEspecie, idRaca, idCor, idPorte) {
    const conexao = await pool.getConnection();
    try {
        const [id, , senha] = quebrarKey(key);

        // 1. Verificar se o cliente (doador) existe e a chave é válida
        const clienteQuery = 'SELECT id FROM cliente WHERE id = ? AND senha = ?';
        const clienteResult = await executaQuery(conexao, clienteQuery, [id, senha]);

        if (!clienteResult || clienteResult.length === 0) {
            throw new Error("Usuário doador não encontrado ou chave inválida.");
        }
        
        const doadorId = clienteResult[0].id;

        // 2. Inserir o animal com uma query simples e confiável
        const insertQuery = `
            INSERT INTO animal (
                nome, dt_nascimento, sexo, disponivel, descricao,
                castrado, vacinado, vermifugado,
                doador, adotador, idEspecie, idRaca, idCor, idPorte
            ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, null, ?, ?, ?, ?)
        `;
        
        const params = [
            nome, data_nascimento, sexo, descricao, castrado, vacinado, vermifugado,
            doadorId, // doador
            idEspecie, idRaca, idCor, idPorte
        ];

        // A OkPacket de um INSERT...VALUES é confiável para retornar o insertId
        return await executaQuery(conexao, insertQuery, params);

    } finally {
        conexao.release();
    }
}