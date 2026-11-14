const { afterEach, test } = require('node:test');
const assert = require('node:assert/strict');

const reviewsService = require('../src/services/reviews.service');
const reviewsController = require('../src/controllers/reviews.controller');
const originalService = { ...reviewsService };

afterEach(() => {
    Object.assign(reviewsService, originalService);
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

test('cria avaliação válida para jogo da biblioteca', async () => {
    let args;
    reviewsService.criarAvaliacao = async (...values) => {
        args = values;
        return { id: 8, nota: 5, texto: 'Excelente' };
    };
    const res = response();

    await reviewsController.criar({
        usuario: { id: 3 },
        body: { gamebrain_id: 123, nota: 5, texto: '  Excelente  ' }
    }, res);

    assert.equal(res.statusCode, 201);
    assert.deepEqual(args, [3, 123, 5, 'Excelente']);
});

test('rejeita notas inválidas e texto ausente ou acima do limite', async (t) => {
    const casos = [
        ['nota abaixo do mínimo', { gamebrain_id: 1, nota: 0, texto: 'Texto' }],
        ['nota acima do máximo', { gamebrain_id: 1, nota: 6, texto: 'Texto' }],
        ['nota não inteira', { gamebrain_id: 1, nota: 4.5, texto: 'Texto' }],
        ['texto vazio', { gamebrain_id: 1, nota: 4, texto: '   ' }],
        ['texto extenso', { gamebrain_id: 1, nota: 4, texto: 'x'.repeat(2001) }],
        ['ID inválido', { gamebrain_id: '1', nota: 4, texto: 'Texto' }]
    ];

    reviewsService.criarAvaliacao = async () => {
        assert.fail('O serviço não deve receber dados inválidos.');
    };

    for (const [nome, body] of casos) {
        await t.test(nome, async () => {
            const res = response();
            await reviewsController.criar({ usuario: { id: 3 }, body }, res);
            assert.equal(res.statusCode, 400);
        });
    }
});

test('informa quando o jogo ainda não pertence à biblioteca', async () => {
    reviewsService.criarAvaliacao = async () => null;
    const res = response();

    await reviewsController.criar({
        usuario: { id: 3 },
        body: { gamebrain_id: 123, nota: 4, texto: 'Bom jogo.' }
    }, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.erro, /biblioteca/);
});

test('atualiza e remove somente pela operação delegada ao usuário autenticado', async () => {
    let updateArgs;
    let deleteArgs;
    reviewsService.atualizarAvaliacao = async (...args) => {
        updateArgs = args;
        return { id: 9, nota: 3, texto: 'Atualizada' };
    };
    reviewsService.removerAvaliacao = async (...args) => {
        deleteArgs = args;
        return true;
    };

    const updateResponse = response();
    await reviewsController.atualizar({
        usuario: { id: 7 },
        params: { id: '9' },
        body: { nota: 3, texto: 'Atualizada' }
    }, updateResponse);

    const deleteResponse = response();
    await reviewsController.remover({
        usuario: { id: 7 },
        params: { id: '9' }
    }, deleteResponse);

    assert.equal(updateResponse.statusCode, 200);
    assert.deepEqual(updateArgs, [7, 9, 3, 'Atualizada']);
    assert.equal(deleteResponse.statusCode, 200);
    assert.deepEqual(deleteArgs, [7, 9]);
});
