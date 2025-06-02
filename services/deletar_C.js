import conexao from './connection.js';
import { quebrarKey } from './quebraKey.js';

export async function deletarCliente(key) {
    const [id] = quebrarKey(key); // extrai o ID a partir da chave

    const conn = await conexao.getConnection();
    try {
        // Verifica se o cliente existe
        const [clientes] = await conn.query('SELECT id FROM cliente WHERE id = ?', [id]);

        if (clientes.length === 0) {
            // Cliente não encontrado, retorna um objeto indicando isso
            return { affectedRows: 0 };
        }

        // Exclui primeiro os animais associados
        await conn.query('DELETE FROM animal WHERE doador = ?', [id]);

        // Depois exclui o cliente
        const [resultado] = await conn.query('DELETE FROM cliente WHERE id = ?', [id]);

        return resultado; // { affectedRows: 1 }
    } finally {
        conn.release();
    }
}
