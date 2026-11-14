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

        await client.query(
            `INSERT INTO atividades (usuario_id, jogo_id, tipo)
             VALUES ($1, $2, 'jogo_adicionado')`,
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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const current = await client.query(
            `SELECT id, jogo_id, status FROM biblioteca
             WHERE id = $1 AND usuario_id = $2
             FOR UPDATE`,
            [bibliotecaId, usuarioId]
        );
        if (!current.rows[0]) {
            await client.query('ROLLBACK');
            return null;
        }

        const previous = current.rows[0];
        const result = await client.query(
            `UPDATE biblioteca SET status = $1
             WHERE id = $2 AND usuario_id = $3
             RETURNING id, status`,
            [status, bibliotecaId, usuarioId]
        );
        if (previous.status !== status) {
            await client.query(
                `INSERT INTO atividades (usuario_id, jogo_id, tipo, detalhes)
                 VALUES ($1, $2, 'status_alterado', $3::jsonb)`,
                [usuarioId, previous.jogo_id, JSON.stringify({
                    anterior: previous.status,
                    atual: status
                })]
            );
        }
        await client.query('COMMIT');
        return result.rows[0] || null;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function removerJogo(usuarioId, bibliotecaId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `DELETE FROM biblioteca
             WHERE id = $1 AND usuario_id = $2
             RETURNING id, jogo_id`,
            [bibliotecaId, usuarioId]
        );
        if (!result.rows[0]) {
            await client.query('ROLLBACK');
            return false;
        }
        await client.query(
            `INSERT INTO atividades (usuario_id, jogo_id, tipo)
             VALUES ($1, $2, 'jogo_removido')`,
            [usuarioId, result.rows[0].jogo_id]
        );
        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    adicionarJogo,
    listarBiblioteca,
    atualizarStatus,
    removerJogo,
};