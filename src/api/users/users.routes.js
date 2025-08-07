import express from 'express';
const router = express.Router();
import * as userController from './users.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

// Middleware para proteger todas as rotas deste arquivo.
// Qualquer requisição para /api/users/* precisará de um token válido.
router.use(verifyToken);

// Rota para buscar as informações do perfil do usuário logado
// Endpoint: GET /api/users/profile
router.get('/profile', userController.getUserProfile);

// Rota para atualizar as informações do perfil do usuário logado
// Endpoint: PUT /api/users/profile
router.put('/profile', userController.updateUserProfile);

// Rota para deletar a conta do usuário logado
// Endpoint: DELETE /api/users/profile
router.delete('/profile', userController.deleteUserProfile);

export default router;