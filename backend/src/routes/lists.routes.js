const express = require('express');
const listsController = require('../controllers/lists.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/public', listsController.listarPublicas);
router.get('/mine', authMiddleware, listsController.listarMinhas);
router.post('/', authMiddleware, listsController.criar);
router.get('/:id', listsController.buscar);
router.patch('/:id', authMiddleware, listsController.atualizar);
router.delete('/:id', authMiddleware, listsController.remover);
router.post('/:id/games', authMiddleware, listsController.adicionarJogo);
router.delete('/:id/games/:gamebrainId', authMiddleware, listsController.removerJogo);

module.exports = router;
