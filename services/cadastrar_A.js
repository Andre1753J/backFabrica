import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

// Função auxiliar igual aos outros arquivos
async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function cadastrar_A(key, nome, data_nascimento, sexo, disponivel, imagem) {
    const conexao = await pool.getConnection();
    const [id, , senha] = quebrarKey(key);

    // Adapte o nome da tabela e campos conforme seu banco!
    const query = `
    INSERT INTO animal (nome, dt_nascimento, sexo, disponivel, doador, adotador)
    SELECT ?, ?, ?, ?, ?, null
    FROM cliente
    WHERE id = ? AND senha = ?
`;
    // Ordem dos parâmetros: nome, data_nascimento, sexo, disponivel, doador, id, senha
    const params = [nome, data_nascimento, sexo, disponivel, id, id, senha];

    const retorno = await executaQuery(conexao, query, params);
    conexao.release();
    return retorno;
}

//falta informações do animal, como raça, espécie, etc.