import express from 'express';
const router = express.Router();
import * as authController from './auth.controller.js';

// Rota para registrar um novo usuário (cliente)
// Endpoint: POST /api/auth/register
router.post('/register', authController.registerUser);

// Rota para fazer login
// Endpoint: POST /api/auth/login
router.post('/login', authController.loginUser);

export default router;