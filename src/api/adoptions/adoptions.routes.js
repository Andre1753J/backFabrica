const express = require('express');
const router = express.Router();
const adoptionController = require('./adoptions.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

// Middleware para proteger todas as rotas deste arquivo
router.use(verifyToken);

// Rota para um usuário solicitar a adoção de um animal
// Endpoint: POST /api/adoptions
router.post('/', adoptionController.requestAdoption);

// Rota para o usuário ver as solicitações de adoção que ele FEZ
// Endpoint: GET /api/adoptions/sent
router.get('/sent', adoptionController.getSentRequests);

// Rota para o usuário ver as solicitações de adoção que ele RECEBEU (para seus animais)
// Endpoint: GET /api/adoptions/received
router.get('/received', adoptionController.getReceivedRequests);

// Rota para o solicitante cancelar um pedido de adoção
// Endpoint: PATCH /api/adoptions/:id/cancel
router.patch('/:id/cancel', adoptionController.cancelAdoptionRequest);

// Rota para o dono do animal aceitar ou rejeitar um pedido de adoção
// Endpoint: PATCH /api/adoptions/:id/resolve
router.patch('/:id/resolve', adoptionController.resolveAdoptionRequest);

module.exports = router;