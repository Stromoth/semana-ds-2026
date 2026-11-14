const express = require('express');
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', usersController.listar);
router.get('/following', authMiddleware, usersController.listarSeguindo);
router.get('/:id', usersController.buscarPerfil);
router.post('/:id/follow', authMiddleware, usersController.seguir);
router.delete('/:id/follow', authMiddleware, usersController.deixarDeSeguir);

module.exports = router;
