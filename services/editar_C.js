import pool from "./connection.js";
import { quebrarKey } from "./quebraKey.js";
import { gerarKey } from "./gerar_key.js";
import bcrypt from 'bcrypt';

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
    const [id, email, senha] = quebrarKey(key);

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
    try {
        const [id] = quebrarKey(key);

        // 1. Busca o usuário atual no banco para validar a senha
        const [currentUser] = await executaQuery(conexao, 'SELECT * FROM cliente WHERE id = ?', [id]);
        if (!currentUser) {
            throw new Error("Usuário não encontrado.");
        }

        // 2. Valida a senha atual fornecida pelo usuário usando bcrypt
        const senhaCorreta = await bcrypt.compare(updates.senhaAtual, currentUser.senha);
        if (!senhaCorreta) {
            throw new Error("Senha atual incorreta.");
        }

        // 3. Prepara os campos que serão realmente atualizados
        const camposParaAtualizar = {};
        if (updates.nome && updates.nome !== currentUser.nome) {
            camposParaAtualizar.nome = updates.nome;
        }
        if (updates.email && updates.email !== currentUser.email) {
            camposParaAtualizar.email = updates.email;
        }
        if (updates.telefone && updates.telefone !== currentUser.telefone) {
            camposParaAtualizar.telefone = updates.telefone;
        }

        // Se nada mudou, não faz nada no banco
        if (Object.keys(camposParaAtualizar).length === 0) {
            return { affectedRows: 0, newKey: null };
        }

        // 4. Monta e executa a query de atualização
        const setClause = Object.keys(camposParaAtualizar)
            .map((campo) => `${campo} = ?`)
            .join(', ');
        const params = [...Object.values(camposParaAtualizar), id];
        const updateQuery = `UPDATE cliente SET ${setClause} WHERE id = ?`;
        
        const resultadoUpdate = await executaQuery(conexao, updateQuery, params);

        // 5. Se a atualização foi bem-sucedida, verifica se precisa gerar nova chave
        if (resultadoUpdate.affectedRows > 0) {
            let newKey = null;
            // Gera nova chave SOMENTE se o e-mail foi alterado
            if (camposParaAtualizar.email) {
                newKey = gerarKey(id, camposParaAtualizar.email, currentUser.senha);
            }
            return { ...resultadoUpdate, newKey };
        }

        return resultadoUpdate;
    } finally {
        conexao.release();
    }
}

export async function mudar_senha(key, { senhaAtual, novaSenha, confirmarNovaSenha }) {
    const conexao = await pool.getConnection();
    try {
        // 1. Validação de entrada
        if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
            throw new Error("Todos os campos são obrigatórios.");
        }
        if (novaSenha.length < 8) {
            throw new Error("A nova senha deve ter pelo menos 8 caracteres.");
        }
        if (novaSenha !== confirmarNovaSenha) {
            throw new Error("As novas senhas não coincidem.");
        }

        const [id, email] = quebrarKey(key);

        // 2. Busca o usuário atual no banco para validar a senha
        const [currentUser] = await executaQuery(conexao, 'SELECT * FROM cliente WHERE id = ?', [id]);
        if (!currentUser) {
            throw new Error("Usuário não encontrado.");
        }

        // 3. Valida a senha atual fornecida pelo usuário
        const senhaAtualCorreta = await bcrypt.compare(senhaAtual, currentUser.senha);
        if (!senhaAtualCorreta) {
            throw new Error("Senha atual incorreta.");
        }

        // 4. Verifica se a nova senha é igual à antiga
        const mesmaSenha = await bcrypt.compare(novaSenha, currentUser.senha);
        if (mesmaSenha) {
            throw new Error("A nova senha não pode ser igual à senha atual.");
        }

        // 5. Hash da nova senha e atualização no banco
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        await executaQuery(conexao, 'UPDATE cliente SET senha = ? WHERE id = ?', [novaSenhaHash, id]);

        // 6. Gerar e retornar a nova chave de autenticação
        const newKey = gerarKey(id, email, novaSenhaHash);
        return { message: "Senha alterada com sucesso.", newKey };

    } finally {
        conexao.release();
    }
}