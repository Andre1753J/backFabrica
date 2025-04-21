export function quebrarKey(key) {
    const [id, ...rest] = key.split("=-=");
    const after = rest.join("=-=");
    const [email, ...rest2] = after.split("=-=");
    const senha = rest2.join('=-=');

    return [ id, email, senha ];
}