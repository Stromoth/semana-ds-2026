const gamebrainService = require('../services/gamebrain.service');

async function pesquisar(req, res) {
    try {
        const { search, page = '1', limit = '10' } = req.query;

        if (
            typeof search !== 'string' ||
            search.trim().length < 2 ||
            search.trim().length > 300
        ) {
            return res.status(400).json({
                erro: 'Informe um termo de pesquisa entre 2 e 300 caracteres.'
            });
        }

        const pagina = Number(page);
        const limite = Number(limit);

        if (!Number.isInteger(pagina) || pagina < 1 || !Number.isInteger(limite) || limite < 1) {
            return res.status(400).json({
                erro: 'Parâmetros de paginação inválidos.'
            });
        }

        if (limite > 10) {
            return res.status(400).json({
                erro: 'A busca aceita no máximo 10 resultados por página.'
            });
        }

        if ((pagina - 1) * limite > 1000) {
            return res.status(400).json({
                erro: 'A página solicitada excede o limite de paginação da GameBrain.'
            });
        }

        const resultado = await gamebrainService.pesquisarJogos(
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

        if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                erro: 'Identificador de jogo inválido.'
            });
        }

        const jogo = await gamebrainService.buscarJogoPorId(id);

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