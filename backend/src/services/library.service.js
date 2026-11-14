const pool = require('../db/connection');
const gamebrainService = require('./gamebrain.service');

async function adicionarJogo(usuarioId, gamebrainId) {
    const jogoGameBrain = await gamebrainService.buscarJogoPorId(gamebrainId);

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const jogoResult = await client.query(
            `INSERT INTO jogos (gamebrain_id, titulo, capa_url, lancamento)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (gamebrain_id)
            DO UPDATE SET
                titulo = EXCLUDED.titulo,
                capa_url = EXCLUDED.capa_url,
                lancamento = EXCLUDED.lancamento
            RETURNING id, gamebrain_id, titulo, capa_url, lancamento`,
            [
                jogoGameBrain.gamebrain_id,
                jogoGameBrain.titulo,
                jogoGameBrain.capa_url,
                jogoGameBrain.lancamento || null
            ]
        );

        const jogo = jogoResult.rows[0];

        const bibliotecaResult = await client.query(
            `INSERT INTO biblioteca (usuario_id, jogo_id)
            VALUES ($1, $2)
            RETURNING id, usuario_id, jogo_id, status, adicionado_em`,
            [usuarioId, jogo.id]
        );

        await client.query('COMMIT');

        return {
            ...bibliotecaResult.rows[0],
            jogo
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function listarBiblioteca(usuarioId) {
    const result = await pool.query(
        `SELECT
            b.id AS biblioteca_id,
            b.status,
            b.adicionado_em,
            j.id AS jogo_id,
            j.gamebrain_id,
            j.titulo,
            j.capa_url,
            j.lancamento
         FROM biblioteca b
         INNER JOIN jogos j ON j.id = b.jogo_id
         WHERE b.usuario_id = $1
         ORDER BY b.adicionado_em DESC`,
        [usuarioId]
    );

    return result.rows;
}

async function atualizarStatus(usuarioId, bibliotecaId, status) {
    const result = await pool.query(
        `UPDATE biblioteca
        SET status = $1
        WHERE id = $2 AND usuario_id = $3
        RETURNING id, status`,
        [status, bibliotecaId, usuarioId]
    );

    return result.rows[0] || null;
}

async function removerJogo(usuarioId, bibliotecaId) {
    const result = await pool.query(
        `DELETE FROM biblioteca
        WHERE id = $1 AND usuario_id = $2
        RETURNING id`,
        [bibliotecaId, usuarioId]
    );

    return result.rowCount > 0;
}

module.exports = {
    adicionarJogo,
    listarBiblioteca,
    atualizarStatus,
    removerJogo,
};