const reviewsService = require('../services/reviews.service');

async function listar(req, res) {
    try {
        const atividades = await reviewsService.listarAtividades();
        return res.status(200).json(atividades);
    } catch (error) {
        console.error('Erro ao consultar atividades:', error);
        return res.status(500).json({ erro: 'Erro ao consultar atividades.' });
    }
}

module.exports = { listar };
