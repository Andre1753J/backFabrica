import pool from './connection.js';
import { quebrarKey } from './quebraKey.js';

export async function resolverAdocao(key, id_adocao, status) {
    const [id_usuario] = quebrarKey(key);
    const conexao = await pool.getConnection();
    try {
        // Verificar se a adoção pertence a um animal do usuário logado
        const [rows] = await conexao.execute(
            `
            SELECT a.id_animal, an.doador 
            FROM adocao a
            JOIN animal an ON a.id_animal = an.id
            WHERE a.id = ?
            `,
            [id_adocao]
        );
        
        if (rows.length === 0) {
            throw new Error("Solicitação de adoção não encontrada.");
        }
        
        const { id_animal, doador } = rows[0];
        
        if (Number(doador) !== Number(id_usuario)) {
            console.log("Doador:", doador, "Usuario logado:", id_usuario);
            throw new Error("Você não tem permissão para aprovar essa adoção.");
        }
        
        // Atualizar status da adoção
        await conexao.execute(
            `
            UPDATE adocao
            SET status = ?
            WHERE id = ?
            `,
            [status, id_adocao]
        );
        
        // Se aprovado, atualizar animal com o adotador
        if (status === "aprovado") {
            await conexao.execute(
                `
                UPDATE animal
                SET adotador = (
                    SELECT id_cliente FROM adocao WHERE id = ?
                    ), disponivel = 0
                    WHERE id = ?
                    `,
                    [id_adocao, id_animal]
                );
            }
        } finally {
            conexao.release();
    }
}
