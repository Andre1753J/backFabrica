import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Polyfill para __dirname e __filename em ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares Globais
app.use(cors()); // Essencial para conectar com o Front-end
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (imagens dos pets)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Carregador de Rotas ---
// Importa as rotas de autenticação que acabamos de criar
import authRoutes from './api/auth/auth.routes.js';
import userRoutes from './api/users/users.routes.js';
import animalRoutes from './api/animals/animals.routes.js';
import adoptionRoutes from './api/adoptions/adoptions.routes.js';

// Diz ao app para usar as rotas de autenticação no endereço /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/adoptions', adoptionRoutes);

export default app;