const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares Globais
app.use(cors()); // Essencial para conectar com o Front-end
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (imagens dos pets)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// --- Carregador de Rotas ---
// Importa as rotas de autenticação que acabamos de criar
const authRoutes = require('./api/auth/auth.routes');
// const userRoutes = require('./api/users/users.routes');
const animalRoutes = require('./api/animals/animals.routes');
const adoptionRoutes = require('./api/adoptions/adoptions.routes');

// Diz ao app para usar as rotas de autenticação no endereço /api/auth
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/adoptions', adoptionRoutes);

module.exports = app;