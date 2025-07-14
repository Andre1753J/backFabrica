export function quebrarKey(key) {

    if (!key) {
        throw new Error("Chave de autenticação não fornecida.");
    }

    // Decodifica a string Base64 para o formato original "id:email:senhaHash"
    const decodedData = Buffer.from(key, 'base64').toString('utf8');

    // Separa os dados pelo delimitador ":"
    const parts = decodedData.split(':');

    // Valida se a chave tem o formato mínimo (id:email:senha)
    if (parts.length < 3) {
        throw new Error("Chave de autenticação inválida ou malformada.");
    }

    const id = parts[0];
    const email = parts[1];
    // A senha é tudo o que vem depois do segundo ':', para o caso de a senha conter ':'
    const senha = parts.slice(2).join(':');

    return [id, email, senha];
}