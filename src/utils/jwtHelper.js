import jwt from 'jsonwebtoken';

export function generateToken(user) {
  // O payload do token deve conter informações essenciais e não sensíveis.
  const payload = {
    id_cliente: user.id_cliente,
    email: user.email,
    nome: user.nome,
  };

  // Gera o token com o segredo do .env e define uma expiração.
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d', // Expira em 1 dia
  });
}