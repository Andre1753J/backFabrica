import pool from './connection.js';
import { quebrarKey } from './quebraKey.js';

async function executaQuery(conexao, query, params) {
    const resposta_query = await conexao.execute(query, params);
    return resposta_query[0];
}

export async function solicitarAdocao(key, id_animal) {
    const conexao = await pool.getConnection();

    const keyParts = quebrarKey(key);
    const [id_cliente, email, senha] = keyParts;

    try {
        const verificador = await executaQuery(conexao, 'SELECT disponivel FROM animal WHERE id = ?', [id_animal]);

        if (verificador.length === 0){
            throw new Error("Animal não encontrado");
        } if (verificador[0].disponivel === 0) {
            throw new Error("Animal não disponível para adoção");
        }

        const jaSolicitado = await executaQuery(conexao, 'SELECT * FROM adocao WHERE id_animal = ? AND id_cliente = ?', [id_animal, id_cliente]);
        if (jaSolicitado.length > 0) {
            throw new Error("Você já solicitou a adoção deste animal");
        }

        const query = 'INSERT INTO adocao (id_animal, id_cliente) VALUES (?, ?)';
        const resultado = await executaQuery(conexao, query, [id_animal, id_cliente]);

        return resultado;
    } finally{
        conexao.release();
    }
}