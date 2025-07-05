import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";
import { calcularIdade } from "./calcularIdade.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function buscarCliente(key) {
    const conexao = await pool.getConnection();
    const [id, email, senha] = quebrarKey(key);

    const query = `
        SELECT id, nome, cpf, rg, dt_nascimento, sexo, email, cep, endereco, bairro, estado, cidade, complemento, telefone, telefone2
        FROM cliente
        WHERE id = ? AND email = ? AND senha = ?`;

    const resultado = await executaQuery(conexao, query, [id, email, senha]);
    conexao.release();

    if (resultado.length === 0) {
        throw new Error("Cliente não encontrado ou chave inválida");
    }
    const cliente = resultado[0];
    return {
        ...cliente,
        idade: calcularIdade(cliente.dt_nascimento)
    };
}