require('dotenv').config();

const API_URL = 'https://api.rawg.io/api';

function getApiKey() {
    const apiKey = procress.env.RAWG_API_KEY;

    if (!apiKey) {
        const error = new Error('Chave da RAWG não cnofigurada');
        error.statusCode = 503;
        throw error;
    }

    return apiKey;
}

async function requisitarRAWG(endpoint, parametros = {}) {
    const url = new URL(`${API_URL}${endpoint}`);

    url.search = new URLSearchParams({
        key: obterApiKey(),
        ...parametros
    }).toString();

    const response = await fetch(url);

    if (!response.ok) {
        const error = new Error('Falha na comunicação com a RAWG.');

        error.statusCodde = response.status === 429 ? 503 : 502;

        throw error;
    }

    return response.json();
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

