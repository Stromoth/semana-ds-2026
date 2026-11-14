const { afterEach, test } = require('node:test');
const assert = require('node:assert/strict');

const listsService = require('../src/services/lists.service');
const listsController = require('../src/controllers/lists.controller');
const originalService = { ...listsService };

afterEach(() => {
    Object.assign(listsService, originalService);
});

function response() {
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

test('cria lista válida e normaliza os campos textuais', async () => {
    let args;
    listsService.criar = async (...values) => {
        args = values;
        return { id: 3, nome: 'RPGs', descricao: 'Favoritos', publica: false };
    };
    const res = response();

    await listsController.criar({
        usuario: { id: 8 },
        body: { nome: ' RPGs ', descricao: ' Favoritos ', publica: false }
    }, res);

    assert.equal(res.statusCode, 201);
    assert.deepEqual(args, [8, 'RPGs', 'Favoritos', false]);
});

test('rejeita dados inválidos da lista sem chamar o serviço', async (t) => {
    const cases = [
        ['nome curto', { nome: 'a', descricao: '', publica: true }],
        ['nome longo', { nome: 'x'.repeat(81), descricao: '', publica: true }],
        ['descrição longa', { nome: 'Jogos', descricao: 'x'.repeat(501), publica: true }],
        ['visibilidade ausente', { nome: 'Jogos', descricao: '' }],
        ['visibilidade não booleana', { nome: 'Jogos', descricao: '', publica: 'true' }]
    ];
    listsService.criar = async () => assert.fail('Serviço não deve receber dados inválidos.');

    for (const [label, body] of cases) {
        await t.test(label, async () => {
            const res = response();
            await listsController.criar({ usuario: { id: 8 }, body }, res);
            assert.equal(res.statusCode, 400);
        });
    }
});

test('lista detalhes públicos e controla acesso privado pelo serviço', async () => {
    let args;
    listsService.buscarPorId = async (...values) => {
        args = values;
        return { id: 4, minha: true, jogos: [] };
    };
    const res = response();

    await listsController.buscar({
        params: { id: '4' },
        session: { userId: 8 }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(args, [4, 8]);
});

test('adiciona jogos apenas usando identificadores válidos', async () => {
    let args;
    listsService.adicionarJogo = async (...values) => {
        args = values;
        return { lista_id: 4, jogo_id: 12 };
    };
    const res = response();

    await listsController.adicionarJogo({
        usuario: { id: 8 },
        params: { id: '4' },
        body: { gamebrain_id: 901 }
    }, res);

    assert.equal(res.statusCode, 201);
    assert.deepEqual(args, [8, 4, 901]);
});

test('recusa operações sobre itens fora da lista ou do usuário', async () => {
    listsService.adicionarJogo = async () => null;
    const res = response();

    await listsController.adicionarJogo({
        usuario: { id: 8 },
        params: { id: '4' },
        body: { gamebrain_id: 901 }
    }, res);

    assert.equal(res.statusCode, 400);
});
