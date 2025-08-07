const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// Rota para registrar um novo usuário (cliente)
// Endpoint: POST /api/auth/register
router.post('/register', authController.registerUser);

// Rota para fazer login
// Endpoint: POST /api/auth/login
router.post('/login', authController.loginUser);

module.exports = router;