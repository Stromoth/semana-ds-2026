const express = require('express');
const activitiesController = require('../controllers/activities.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', activitiesController.listar);
router.get('/following', authMiddleware, activitiesController.listarDaRede);

module.exports = router;
