// Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
import 'dotenv/config';

// Importa a instância configurada do aplicativo Express a partir de src/app.js
import app from './src/app.js';

// Define a porta do servidor. Usa a variável de ambiente PORT ou, como fallback, a porta 9000.
const PORT = process.env.PORT || 9000;

// Inicia o servidor e o faz escutar na porta definida
app.listen(PORT, () => {
  console.log(`🚀 Servidor V2 (ESM) iniciado com sucesso e rodando na porta ${PORT}`);
  console.log(`   Acesse em http://localhost:${PORT}`);
});