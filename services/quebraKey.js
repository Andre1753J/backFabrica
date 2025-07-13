export function quebrarKey(key) {

    if (!key) {
        throw new Error("Chave de autenticação não fornecida.");
    }

    // Decodifica a string Base64 para o formato original "id:email:senhaHash"
    const decodedData = Buffer.from(key, 'base64').toString('ascii');

    // Separa os dados pelo delimitador ":"
    const [id, email, senha] = decodedData.split(':');

    // Valida se todos os componentes da chave estão presentes
    if (!id || !email || !senha) {
        throw new Error("Chave de autenticação inválida ou malformada.");
    }

    return [id, email, senha];
}