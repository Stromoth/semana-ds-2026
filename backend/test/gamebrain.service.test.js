const { afterEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.GAMEBRAIN_API_KEY = 'test-key';

const gamebrainService = require('../src/services/gamebrain.service');
const originalFetch = global.fetch;

afterEach(() => {
    global.fetch = originalFetch;
});

test('preserva a relevância da busca e normaliza jogos e filtros GameBrain', async () => {
    let requestUrl;
    let requestOptions;
    global.fetch = async (url, options) => {
        requestUrl = new URL(url);
        requestOptions = options;
        return {
            ok: true,
            json: async () => ({
                total_results: 21,
                filter_options: [
                    {
                        name: 'Platform',
                        key: 'platform',
                        values: [{ name: 'PC', key: 'pc', count: 15 }]
                    },
                    {
                        name: 'Release Date',
                        key: 'release_date',
                        values: [{ name: 'Last Year', key: 'last_year', count: 2 }]
                    }
                ],
                results: [{
                    id: 64591,
                    name: 'Medieval II: Total War',
                    year: 2006,
                    genre: 'Tactical Turn-based Strategy',
                    image: 'https://img.gamebrain.co/game.jpg',
                    rating: { mean: 0.9, count: 100 },
                    platforms: [{ name: 'PC' }]
                }]
            })
        };
    };

    const result = await gamebrainService.pesquisarJogos('medieval strategy', 2, 4, [
        { key: 'platform', values: [{ value: 'pc' }], connection: 'OR' }
    ]);

    assert.equal(requestUrl.origin, 'https://api.gamebrain.co');
    assert.equal(requestUrl.pathname, '/v1/games');
    assert.equal(requestUrl.searchParams.get('query'), 'medieval strategy');
    assert.equal(requestUrl.searchParams.get('offset'), '4');
    assert.equal(requestUrl.searchParams.get('limit'), '4');
    assert.deepEqual(JSON.parse(requestUrl.searchParams.get('filters')), [
        { key: 'platform', values: [{ value: 'pc' }], connection: 'OR' }
    ]);
    assert.equal(requestUrl.searchParams.get('generate-filter-options'), 'true');
    assert.equal(requestUrl.searchParams.has('sort'), false);
    assert.equal(requestUrl.searchParams.has('sort-order'), false);
    assert.equal(requestOptions.headers['x-api-key'], 'test-key');
    assert.deepEqual(result, {
        total: 21,
        pagina: 2,
        limite: 4,
        filtros: [{
            chave: 'platform',
            nome: 'Platform',
            opcoes: [{ chave: 'pc', nome: 'PC', total: 15 }]
        }],
        resultados: [{
            gamebrain_id: 64591,
            titulo: 'Medieval II: Total War',
            descricao: '',
            capa_url: 'https://img.gamebrain.co/game.jpg',
            lancamento: null,
            ano: 2006,
            nota: 4.5,
            votos: 100,
            generos: ['Tactical Turn-based Strategy'],
            plataformas: ['PC'],
            desenvolvedoras: [],
            publicadoras: [],
            link: null,
            tags: [],
            modos: []
        }]
    });
});

test('consulta detalhes e normaliza gêneros, descrição e data', async () => {
    global.fetch = async (url, options) => {
        assert.equal(new URL(url).pathname, '/v1/games/1273796');
        assert.equal(options.headers['x-api-key'], 'test-key');
        return {
            ok: true,
            json: async () => ({
                id: 1273796,
                name: 'Kingdom Come Deliverance II',
                description: 'Descrição do jogo',
                release_date: '2025-02-04',
                genres: [{ name: 'Role Playing' }],
                play_modes: [{ name: 'Single-player' }],
                developer: 'Warhorse Studios'
            })
        };
    };

    const result = await gamebrainService.buscarJogoPorId(1273796);

    assert.equal(result.gamebrain_id, 1273796);
    assert.equal(result.descricao, 'Descrição do jogo');
    assert.equal(result.lancamento, '2025-02-04');
    assert.equal(result.ano, 2025);
    assert.deepEqual(result.generos, ['Role Playing']);
    assert.deepEqual(result.modos, ['Single-player']);
    assert.deepEqual(result.desenvolvedoras, ['Warhorse Studios']);
});

test('mapeia cota esgotada para indisponibilidade sem expor conteúdo upstream', async () => {
    global.fetch = async () => ({
        ok: false,
        status: 402
    });

    await assert.rejects(
        gamebrainService.buscarJogoPorId(1),
        (error) => error.statusCode === 503 && /cota diária/.test(error.message)
    );
});

test('retorna erro de configuração explícito quando a chave está ausente', async () => {
    const apiKey = process.env.GAMEBRAIN_API_KEY;
    delete process.env.GAMEBRAIN_API_KEY;

    try {
        await assert.rejects(
            gamebrainService.pesquisarJogos('zelda'),
            (error) => error.statusCode === 503 && /não está configurada/.test(error.message)
        );
    } finally {
        process.env.GAMEBRAIN_API_KEY = apiKey;
    }
});
