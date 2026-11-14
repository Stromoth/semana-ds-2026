require('dotenv').config();

const API_URL = 'https://api.gamebrain.co/v1';

function getApiKey() {
    const apiKey = process.env.GAMEBRAIN_API_KEY;

    if (!apiKey) {
        const error = new Error('A chave da API GameBrain não está configurada.');
        error.statusCode = 503;
        throw error;
    }

    return apiKey;
}

async function requisitarGameBrain(endpoint, parametros = {}) {
    const url = new URL(`${API_URL}${endpoint}`);
    url.search = new URLSearchParams(parametros).toString();
    const apiKey = getApiKey();

    let response;
    try {
        response = await fetch(url, {
            headers: {
                'x-api-key': apiKey
            },
            signal: AbortSignal.timeout(10000)
        });
    } catch (cause) {
        const error = new Error('Não foi possível conectar à API GameBrain.');
        error.statusCode = cause?.name === 'TimeoutError' ? 504 : 502;
        throw error;
    }

    if (!response.ok) {
        const error = new Error(
            response.status === 404
                ? 'Jogo não encontrado na GameBrain.'
                : response.status === 402
                    ? 'A cota diária da API GameBrain foi esgotada.'
                    : response.status === 401 || response.status === 403
                        ? 'A API GameBrain recusou a chave configurada.'
                        : response.status === 429
                            ? 'Limite de requisições da API GameBrain atingido.'
                            : 'Falha na comunicação com a API GameBrain.'
        );
        error.statusCode = response.status === 404
            ? 404
            : response.status === 402 || response.status === 429
                ? 503
                : 502;
        throw error;
    }

    try {
        return await response.json();
    } catch {
        const error = new Error('A API GameBrain retornou uma resposta inválida.');
        error.statusCode = 502;
        throw error;
    }
}

function mapearJogo(jogo) {
    if (!Number.isSafeInteger(jogo?.id) || jogo.id <= 0 || typeof jogo.name !== 'string') {
        const error = new Error('A API GameBrain retornou dados de jogo inválidos.');
        error.statusCode = 502;
        throw error;
    }

    const rating = Number.isFinite(jogo.rating?.mean)
        ? Math.round(jogo.rating.mean * 500) / 100
        : null;

    return {
        gamebrain_id: jogo.id,
        titulo: jogo.name,
        descricao: jogo.description || jogo.short_description || '',
        capa_url: jogo.image || null,
        lancamento: jogo.release_date || null,
        ano: Number.isSafeInteger(jogo.year)
            ? jogo.year
            : jogo.release_date
                ? Number(jogo.release_date.slice(0, 4))
                : null,
        nota: rating,
        votos: Number.isFinite(jogo.rating?.count) ? jogo.rating.count : 0,
        generos: Array.isArray(jogo.genres)
            ? jogo.genres.map((genero) => typeof genero === 'string' ? genero : genero.name).filter(Boolean)
            : typeof jogo.genre === 'string' && jogo.genre
                ? [jogo.genre]
                : [],
        plataformas: Array.isArray(jogo.platforms)
            ? jogo.platforms.map((plataforma) => typeof plataforma === 'string' ? plataforma : plataforma.name).filter(Boolean)
            : [],
        desenvolvedoras: typeof jogo.developer === 'string' && jogo.developer
            ? [jogo.developer]
            : [],
        publicadoras: [],
        link: typeof jogo.link === 'string' ? jogo.link : null,
        tags: Array.isArray(jogo.tags) ? jogo.tags : [],
        modos: Array.isArray(jogo.play_modes)
            ? jogo.play_modes.map((modo) => typeof modo === 'string' ? modo : modo.name).filter(Boolean)
            : []
    };
}

async function pesquisarJogos(termo, pagina = 1, limite = 10) {
    const offset = (pagina - 1) * limite;
    const dados = await requisitarGameBrain('/games', {
        query: termo,
        offset: String(offset),
        limit: String(limite),
        filters: '[]',
        sort: 'computed_rating',
        'sort-order': 'desc',
        'generate-filter-options': 'false'
    });

    if (!dados || !Array.isArray(dados.results) || !Number.isSafeInteger(dados.total_results)) {
        const error = new Error('A API GameBrain retornou resultados de busca inválidos.');
        error.statusCode = 502;
        throw error;
    }

    return {
        total: dados.total_results,
        pagina,
        limite,
        resultados: dados.results.map(mapearJogo)
    };
}

async function buscarJogoPorId(id) {
    const jogo = await requisitarGameBrain(`/games/${id}`);
    return mapearJogo(jogo);
}

module.exports = {
    pesquisarJogos,
    buscarJogoPorId
};
