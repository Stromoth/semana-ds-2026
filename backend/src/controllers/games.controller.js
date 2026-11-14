const gamebrainService = require('../services/gamebrain.service');

const FILTROS_PERMITIDOS = new Set(['genre', 'platform']);

function lerFiltros(valor) {
    if (valor === undefined) {
        return [];
    }

    if (typeof valor !== 'string') {
        return null;
    }

    let filtros;
    try {
        filtros = JSON.parse(valor);
    } catch {
        return null;
    }

    if (!Array.isArray(filtros) || filtros.length > FILTROS_PERMITIDOS.size) {
        return null;
    }

    const chavesUsadas = new Set();
    for (const filtro of filtros) {
        if (
            !filtro ||
            !FILTROS_PERMITIDOS.has(filtro.key) ||
            chavesUsadas.has(filtro.key) ||
            filtro.connection !== 'OR' ||
            !Array.isArray(filtro.values) ||
            filtro.values.length < 1 ||
            filtro.values.length > 5 ||
            filtro.values.some((item) =>
                !item ||
                typeof item.value !== 'string' ||
                !/^[a-z0-9_]+$/.test(item.value)
            )
        ) {
            return null;
        }

        chavesUsadas.add(filtro.key);
    }

    return filtros;
}

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

        const filtros = lerFiltros(req.query.filters);
        if (!filtros) {
            return res.status(400).json({
                erro: 'Os filtros de gênero ou plataforma são inválidos.'
            });
        }

        const resultado = await gamebrainService.pesquisarJogos(
            search.trim(),
            pagina,
            limite,
            filtros
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