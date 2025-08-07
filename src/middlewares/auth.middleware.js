import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    // O token deve estar na segunda posição (ex: "Bearer <token>")
    const bearerToken = bearer[1];

    if (!bearerToken) {
      return res.status(401).json({ message: 'Acesso negado. Token mal formatado.' });
    }

    req.token = bearerToken;

    jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
      if (err) {
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
      }
      // O payload do token tem id_cliente, conforme auth.service.js
      req.user = { id: authData.id_cliente, email: authData.email };
      next();
    });
  } else {
    res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }
}