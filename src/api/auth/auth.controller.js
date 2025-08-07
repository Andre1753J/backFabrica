const authService = require('./auth.service');

async function registerUser(req, res) {
  try {
    const userData = req.body;
    // Chama o serviço para registrar o usuário
    const { newUser, token } = await authService.registerUser(userData);
    // Retorna sucesso (201) com o usuário criado e o token
    res.status(201).json({ message: 'Usuário registrado com sucesso!', user: newUser, token });
  } catch (error) {
    // Se o serviço retornar um erro (ex: email já existe), envia o erro.
    res.status(400).json({ message: error.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, senha } = req.body;
    // Chama o serviço para fazer o login
    const { user, token } = await authService.loginUser(email, senha);
    // Retorna sucesso (200) com os dados do usuário e o token
    res.status(200).json({ message: 'Login bem-sucedido!', user, token });
  } catch (error) {
    // Se o serviço retornar um erro (ex: senha incorreta), envia o erro.
    res.status(401).json({ message: error.message }); // 401 = Não autorizado
  }
}

module.exports = { registerUser, loginUser };