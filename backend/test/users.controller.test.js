const { afterEach, test } = require('node:test');
const assert = require('node:assert/strict');

const usersService = require('../src/services/users.service');
const usersController = require('../src/controllers/users.controller');
const originalService = { ...usersService };

afterEach(() => {
    Object.assign(usersService, originalService);
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

test('busca jogadores pelo nome e inclui a relação do visitante', async () => {
    let args;
    usersService.buscarUsuarios = async (...values) => {
        args = values;
        return [{ id: 9, nome: 'Jogador', seguindo: true }];
    };
    const res = response();

    await usersController.listar({
        query: { search: ' Jogador ' },
        session: { userId: 4 }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(args, ['Jogador', 4]);
    assert.equal(res.body[0].seguindo, true);
});

test('rejeita buscas longas sem consultar o serviço', async () => {
    usersService.buscarUsuarios = async () => assert.fail('Serviço não deve ser chamado.');
    const res = response();

    await usersController.listar({ query: { search: 'x'.repeat(101) } }, res);

    assert.equal(res.statusCode, 400);
});

test('retorna perfil público e identifica visitante não autenticado', async () => {
    let args;
    usersService.buscarPerfil = async (...values) => {
        args = values;
        return { id: 9, meu_perfil: false, biblioteca: [], avaliacoes: [] };
    };
    const res = response();

    await usersController.buscarPerfil({ params: { id: '9' }, session: {} }, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(args, [9, null]);
    assert.deepEqual(res.body.biblioteca, []);
});

test('não permite seguir a si mesmo e delega relações válidas', async (t) => {
    usersService.seguir = async () => ({ rowCount: 1 });
    await t.test('bloqueia autorrelação', async () => {
        const res = response();
        await usersController.seguir({
            usuario: { id: 4 },
            params: { id: '4' }
        }, res);
        assert.equal(res.statusCode, 400);
    });

    await t.test('cria relação do usuário autenticado', async () => {
        let args;
        usersService.seguir = async (...values) => {
            args = values;
            return true;
        };
        const res = response();
        await usersController.seguir({
            usuario: { id: 4 },
            params: { id: '9' }
        }, res);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(args, [4, 9]);
        assert.deepEqual(res.body, { seguindo: true });
    });
});
