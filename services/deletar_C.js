import conexao from './connection.js';
import { quebrarKey } from './quebraKey.js';

export async function deletarCliente(key) {
    const conexao = await conectar();
    const query = `DELETE FROM cliente WHERE SHA2(CONCAT(id, email, senha), 256) = ?`;
    const resultado = await executaQuery(conexao, query, [key]);
    return resultado; // para acessar affectedRows no controller
}

