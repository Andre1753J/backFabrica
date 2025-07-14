import conexao from './connection.js';
import { quebrarKey } from './quebraKey.js';

export async function deletarCliente(key) {
    const [id, , senha] = quebrarKey(key); // extrai o ID e a senha a partir da chave

    const conn = await conexao.getConnection();
    try {
        // Verifica se o cliente existe e a senha corresponde
        const [clientes] = await conn.query('SELECT id FROM cliente WHERE id = ? AND senha = ?', [id, senha]);

        if (clientes.length === 0) {
            // Cliente não encontrado ou senha incorreta
            throw new Error("Usuário não encontrado ou chave inválida.");
        }

        // Exclui primeiro os animais associados ao doador
        await conn.query('DELETE FROM animal WHERE doador = ?', [id]);

        // Depois exclui o cliente
        const [resultado] = await conn.query('DELETE FROM cliente WHERE id = ?', [id]);

        return resultado; // { affectedRows: 1 }
    } finally {
        conn.release();
    }
}
