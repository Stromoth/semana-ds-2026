const reviewsService = require('../services/reviews.service');
const activitiesService = require('../services/activities.service');

async function listar(req, res) {
    try {
        const atividades = await reviewsService.listarAtividades();
        return res.status(200).json(atividades);
    } catch (error) {
        console.error('Erro ao consultar atividades:', error);
        return res.status(500).json({ erro: 'Erro ao consultar atividades.' });
    }
}

async function listarDaRede(req, res) {
    try {
        const atividades = await activitiesService.listarDaRede(req.usuario.id);
        return res.status(200).json(atividades);
    } catch (error) {
        console.error('Erro ao consultar atividade da rede:', error);
        return res.status(500).json({ erro: 'Erro ao consultar atividade da rede.' });
    }
}

module.exports = { listar, listarDaRede };
