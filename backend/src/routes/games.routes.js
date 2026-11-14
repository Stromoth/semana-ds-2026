const express = require('express');

const gamesController = require('../controllers/games.controller');

const router = express.Router();

router.get('/community', gamesController.listarDestaques);
router.get('/', gamesController.pesquisar);

router.get('/:id', gamesController.buscarPorId);

module.exports = router;