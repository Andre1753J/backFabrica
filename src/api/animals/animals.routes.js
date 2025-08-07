import express from 'express';
const router = express.Router();
import * as animalController from './animals.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/upload.middleware.js';

// --- Rotas Públicas (não precisam de login) ---

// Rota para listar e filtrar todos os animais disponíveis para adoção
// Endpoint: GET /api/animals?especie=gato&porte=pequeno
router.get('/', animalController.getAllAnimals);

// Rota para buscar os detalhes de um animal específico pelo ID
// Endpoint: GET /api/animals/123
router.get('/:id', animalController.getAnimalDetails);

// --- Rotas Protegidas (precisam de login) ---

// Rota para um usuário logado cadastrar um novo animal (com upload de imagem)
// Endpoint: POST /api/animals
router.post('/', verifyToken, upload.single('imagem_animal'), animalController.createAnimal);

// Rota para o dono do animal deletá-lo
// Endpoint: DELETE /api/animals/123
router.delete('/:id', verifyToken, animalController.deleteAnimal);

export default router;