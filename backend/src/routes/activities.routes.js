const express = require('express');
const activitiesController = require('../controllers/activities.controller');

const router = express.Router();

router.get('/', activitiesController.listar);

module.exports = router;
