import conexao from './connection.js';
import { quebrarKey } from './quebraKey.js';

export async function deletarCliente(key) {
    const [id] = quebrarKey(key); // extrai o ID a partir da chave

    const conn = await conexao.getConnection();
    try {
        // Exclui primeiro os animais associados
        await conn.query('DELETE FROM animal WHERE doador = ?', [id]);

        // Depois exclui o cliente
        const [resultado] = await conn.query('DELETE FROM cliente WHERE id = ?', [id]);

        return resultado;
    } finally {
        conn.release();
    }
}
