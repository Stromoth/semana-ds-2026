const { afterEach, test } = require('node:test');
const assert = require('node:assert/strict');

const pool = require('../src/db/connection');
const communityGamesService = require('../src/services/community-games.service');
const originalQuery = pool.query;

afterEach(() => {
    pool.query = originalQuery;
});

test('prioriza jogos presentes nas bibliotecas e retorna contagens persistidas', async () => {
    let query;
    pool.query = async (value) => {
        query = value;
        return {
            rows: [{
                gamebrain_id: 123,
                titulo: 'Jogo da comunidade',
                capa_url: 'https://img.gamebrain.co/game.jpg',
                lancamento: '2024-01-01',
                jogadores: 3,
                avaliacoes: 2,
                nota: '4.5',
                total: 1
            }]
        };
    };

    const result = await communityGamesService.listarDestaques();

    assert.match(query, /COUNT\(DISTINCT b\.usuario_id\)/);
    assert.match(query, /COUNT\(DISTINCT a\.id\)/);
    assert.match(query, /ORDER BY jogadores DESC, avaliacoes DESC/);
    assert.match(query, /LIMIT 20/);
    assert.deepEqual(result, {
        total: 1,
        resultados: [{
            gamebrain_id: 123,
            titulo: 'Jogo da comunidade',
            capa_url: 'https://img.gamebrain.co/game.jpg',
            lancamento: '2024-01-01',
            jogadores: 3,
            avaliacoes: 2,
            nota: '4.5'
        }]
    });
});

test('retorna lista vazia e total zero quando a comunidade ainda não tem jogos', async () => {
    pool.query = async () => ({ rows: [] });

    assert.deepEqual(await communityGamesService.listarDestaques(), {
        total: 0,
        resultados: []
    });
});
