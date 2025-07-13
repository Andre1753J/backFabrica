import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

// Função para atualizar todos os campos da tabela cliente
export async function cadastropt2(
    key, nome, cpf, rg, dt_nascimento, sexo,
    cep, endereco, bairro, estado, cidade, complemento,
    telefone, telefone2
) {
    const conexao = await pool.getConnection();
    const [id, email, senha] = key.split("=-=");

    const campos = {
        nome, cpf, rg, dt_nascimento, sexo,
        cep, endereco, bairro, estado, cidade, complemento,
        telefone, telefone2
    };

    // Remove campos undefined para não sobrescrever com null
    Object.keys(campos).forEach(k => campos[k] === undefined && delete campos[k]);

    const setClause = Object.keys(campos)
        .map(campo => `${campo} = ?`)
        .join(', ');

    const valores = [...Object.values(campos), id, email, senha];

    const query = `UPDATE cliente SET ${setClause} WHERE id = ? AND email = ? AND senha = ?`;

    const retorno = await executaQuery(conexao, query, valores);

    if (retorno.affectedRows === 0) {
        throw new Error("Erro ao editar o cliente, verifique os dados e tente novamente.");
    }

    conexao.release();
    return retorno;
}

// Função para editar campos selecionados do cliente
export async function editar_c(key, updates) {
    const conexao = await pool.getConnection();
    const [id, , senha] = quebrarKey(key);

    try {
        // 1. Validar a senha atual
        if (senha !== updates.senhaAtual) {
            throw new Error("Senha atual incorreta.");
        }

        // 2. Preparar os campos para atualização, ignorando a senha
        const camposParaAtualizar = {};
        if (updates.nome !== undefined) camposParaAtualizar.nome = updates.nome;
        if (updates.email !== undefined) camposParaAtualizar.email = updates.email;
        if (updates.telefone !== undefined) camposParaAtualizar.telefone = updates.telefone;

        // Se não houver campos para atualizar (além da senha), não faz nada.
        if (Object.keys(camposParaAtualizar).length === 0) {
            return { affectedRows: 1, message: "Nenhum dado para atualizar, mas senha confirmada." };
        }

        // 3. Construir e executar a query de atualização
        const setClause = Object.keys(camposParaAtualizar)
            .map((campo) => `${campo} = ?`)
            .join(', ');

        const query = `UPDATE cliente SET ${setClause} WHERE id = ? AND senha = ?`;
        const valores = [...Object.values(camposParaAtualizar), id, senha];

        const retorno = await executaQuery(conexao, query, valores);

        if (retorno.affectedRows === 0) {
            throw new Error("Não foi possível atualizar o cliente. Chave inválida ou dados incorretos.");
        }
        return retorno;
    } finally {
        conexao.release();
    }
}