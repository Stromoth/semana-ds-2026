const express = require('express');
const reviewsController = require('../controllers/reviews.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', reviewsController.listar);
router.get('/mine', authMiddleware, reviewsController.listarMinhas);
router.post('/', authMiddleware, reviewsController.criar);
router.patch('/:id', authMiddleware, reviewsController.atualizar);
router.delete('/:id', authMiddleware, reviewsController.remover);

module.exports = router;
