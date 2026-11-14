const { afterEach, test } = require('node:test');
const assert = require('node:assert/strict');

const gamebrainService = require('../src/services/gamebrain.service');
const gamesController = require('../src/controllers/games.controller');
const originalPesquisarJogos = gamebrainService.pesquisarJogos;

afterEach(() => {
    gamebrainService.pesquisarJogos = originalPesquisarJogos;
});

function criarResponse() {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

async function pesquisar(filters) {
    const req = {
        query: {
            search: 'zelda',
            ...(filters === undefined ? {} : { filters })
        }
    };
    const res = criarResponse();
    await gamesController.pesquisar(req, res);
    return res;
}

test('encaminha filtros válidos de gênero e plataforma ao serviço', async () => {
    const filtros = [
        { key: 'genre', values: [{ value: 'action_adventure' }], connection: 'OR' },
        { key: 'platform', values: [{ value: 'nintendo_switch' }], connection: 'OR' }
    ];
    let argumentos;

    gamebrainService.pesquisarJogos = async (...args) => {
        argumentos = args;
        return { total: 0, resultados: [], filtros: [] };
    };

    const res = await pesquisar(JSON.stringify(filtros));

    assert.equal(res.statusCode, 200);
    assert.deepEqual(argumentos, ['zelda', 1, 10, filtros]);
});

test('usa lista vazia quando nenhum filtro é informado', async () => {
    let argumentos;
    gamebrainService.pesquisarJogos = async (...args) => {
        argumentos = args;
        return { total: 0, resultados: [], filtros: [] };
    };

    const res = await pesquisar();

    assert.equal(res.statusCode, 200);
    assert.deepEqual(argumentos, ['zelda', 1, 10, []]);
});

test('rejeita filtros malformados e não chama o serviço', async (t) => {
    const casosInvalidos = [
        ['JSON inválido', '{'],
        ['formato que não é lista', JSON.stringify({ key: 'genre' })],
        ['tipo de filtro desconhecido', JSON.stringify([
            { key: 'year', values: [{ value: '2024' }], connection: 'OR' }
        ])],
        ['chave de filtro repetida', JSON.stringify([
            { key: 'genre', values: [{ value: 'action' }], connection: 'OR' },
            { key: 'genre', values: [{ value: 'rpg' }], connection: 'OR' }
        ])],
        ['conexão inválida', JSON.stringify([
            { key: 'genre', values: [{ value: 'action' }], connection: 'AND' }
        ])],
        ['filtro sem valores', JSON.stringify([
            { key: 'genre', values: [], connection: 'OR' }
        ])],
        ['mais de cinco opções', JSON.stringify([
            {
                key: 'platform',
                values: ['pc', 'switch', 'xbox', 'ps5', 'linux', 'mac'].map((value) => ({ value })),
                connection: 'OR'
            }
        ])],
        ['valor com caracteres não permitidos', JSON.stringify([
            { key: 'genre', values: [{ value: 'action/adventure' }], connection: 'OR' }
        ])],
        ['mais filtros que tipos permitidos', JSON.stringify([
            { key: 'genre', values: [{ value: 'action' }], connection: 'OR' },
            { key: 'platform', values: [{ value: 'pc' }], connection: 'OR' },
            { key: 'year', values: [{ value: '2024' }], connection: 'OR' }
        ])]
    ];

    gamebrainService.pesquisarJogos = async () => {
        assert.fail('O serviço não deve ser chamado para filtros inválidos.');
    };

    for (const [nome, filtros] of casosInvalidos) {
        await t.test(nome, async () => {
            const res = await pesquisar(filtros);
            assert.equal(res.statusCode, 400);
            assert.equal(res.body.erro, 'Os filtros de gênero ou plataforma são inválidos.');
        });
    }
});
