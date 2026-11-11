require('dotenv').config();

const API_URL = 'https://api.rawg.io/api';

function getApiKey() {
    const apiKey = process.env.RAWG_API_KEY;

    if (!apiKey) {
        const error = new Error('A chave da API RAWG não está configurada.');
        error.statusCode = 503;
        throw error;
    }

    return apiKey;
}

async function requisitarRAWG(endpoint, parametros = {}) {
    const url = new URL(`${API_URL}${endpoint}`);

    url.search = new URLSearchParams({
        key: getApiKey(),
        ...parametros
    }).toString();

    let response;
    try {
        response = await fetch(url, {
            signal: AbortSignal.timeout(10000)
        });
    } catch (cause) {
        const error = new Error('Não foi possível conectar à API RAWG.');
        error.statusCode = cause?.name === 'TimeoutError' ? 504 : 502;
        throw error;
    }

    if (!response.ok) {
        const error = new Error(
            response.status === 404
                ? 'Jogo não encontrado na RAWG.'
                : 'Falha na comunicação com a API RAWG.'
        );
        error.statusCode = response.status === 404
            ? 404
            : response.status === 429
                ? 503
                : 502;
        throw error;
    }

    try {
        return await response.json();
    } catch {
        const error = new Error('A API RAWG retornou uma resposta inválida.');
        error.statusCode = 502;
        throw error;
    }
}

async function pesquisarJogos(termo, pagina = 1, limite = 20) {
    const dados = await requisitarRAWG('/games', {
        search: termo,
        page: String(pagina),
        page_size: String(limite)
    });

    return {
        total: dados.count,
        pagina,
        resultados: dados.results.map((jogo) => ({
            rawg_id: jogo.id,
            titulo: jogo.name,
            capa_url: jogo.background_image,
            lancamento: jogo.released,
            nota: jogo.rating,
            generos: jogo.genres?.map((genero) => genero.name) || [],
            plataformas: jogo.platforms?.map(
                (item) => item.platform.name
            ) || []
        }))
    };
}

async function buscarJogoPorId(id) {
    const jogo = await requisitarRAWG(`/games/${id}`);

    return {
        rawg_id: jogo.id,
        titulo: jogo.name,
        descricao: jogo.description_raw,
        capa_url: jogo.background_image,
        lancamento: jogo.released,
        nota: jogo.rating,
        generos: jogo.genres?.map((genero) => genero.name) || [],
        plataformas: jogo.platforms?.map(
            (item) => item.platform.name
        ) || [],
        desenvolvedoras: jogo.developers?.map(
            (empresa) => empresa.name
        ) || [],
        publicadoras: jogo.publishers?.map(
            (empresa) => empresa.name
        ) || []
    };
}

module.exports = {
    pesquisarJogos,
    buscarJogoPorId
};
