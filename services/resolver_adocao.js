import pool from './connection.js';
import { quebrarKey } from './quebrar_key.js';

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function resolverAdocao(key, id_adocao, novoStatus) {
    const [id_doador] = quebrarKey(key);
    const conexao = await pool.getConnection();

    try {
        const resultado = await executaQuery(conexao, `
            UPDATE a.id_animal, an.doador, a.id_cliente
            FROM adocao a
            JOIN animal an ON a.id_animal = an.id
            WHERE a.id = ?
        `, [id_adocao]);

        if (resultado.affectedRows === 0) {
            throw new Error('Solicitação de adoção não encontrada');
        }

        const { id_animal, doador, id_cliente } = resultado[0];

        if (doador != id_doador) {
            throw new Error('Você não tem permissão de resolver esta adoção.');
        }


        await executaQuery(conexao, `UPDATE adocao SET status = ? WHERE id = ?`, [novoStatus, id_adocao]);


        if (novoStatus === 'aprovado') {
            await executaQuery(conexao, `UPDATE animal SET adotador = ?, disponivel = 0 WHERE id = ?`, [id_cliente, id_animal]);
        }
        return true;
    } finally {
        conexao.release();
    }
}