/**
 * Centraliza a criação da chave de autenticação do cliente.
 * A chave é uma string base64 que codifica id, email e a senha (hash).
 * atualmente é necessario para quando o cliente mudar o email ou senha.
 */
export function gerarKey(id, email, senhaHash) {
    const data = `${id}:${email}:${senhaHash}`;
    return Buffer.from(data).toString('base64');
}