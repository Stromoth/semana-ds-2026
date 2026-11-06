const rawgService = require('../services/rawg.service');

async function pesquisar(req, res) {
    try {
        const { search, page = '1', limit = '20' } = req.query;

        if (typeof search !== 'string' || search.trim().length < 2) {
            return res.status(400).json({
                erro: 'Informe um termo de pesquisa com pelo menos 2 caracteres.0'
            });
        }

        const pagina = Number(page);
        const limite = Number(limit);

        if (
            !Number.isInteger(pagina) ||
            pagina < 1 ||
            !Number.isInteger(limite) ||
            limite < 1 ||
            limite > 40
        ) {
            return res.status(400).json({
                erro: 'Parâmetros de paginação inválidos.'
            });
        }

        const resultado = await rawgService.pesquisarJogos(
            search.trim(),
            pagina,
            limite
        );

        return res.status(200).json(resultado);

    } catch (error) {
        console.error('Erro ao pesquisar jogos:', error);

        return res.status(error.statusCode || 500).json({
            erro: error.message || 'Erro ao pesquisar jogos.'
        });
    }
}

async function buscarPorId(req, res) {
    try {
        const id = req.params.id;

        if (!/^\d+$/.test(id) || Number(id) <= 0) {
            return res.status(400).json({
                erro: 'Identificador de jogo inválido.'
            });
        }

        const jogo = await rawgService.buscarJogoPorId(id);

        return res.status(200).json(jogo);

    } catch (error) {
        console.error('Erro ao consultar jogo:', error);

        return res.status(error.statusCode || 500).json({
            erro: error.message || 'Erro ao consultar jogo.'
        });
    }
}

module.exports = {
    pesquisar,
    buscarPorId
};