const pool = require('../db/connection');

async function criarAvaliacao(usuarioId, gamebrainId, nota, texto) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `INSERT INTO avaliacoes (usuario_id, jogo_id, nota, texto)
             SELECT $1, j.id, $3, $4
             FROM jogos j
             INNER JOIN biblioteca b ON b.jogo_id = j.id AND b.usuario_id = $1
             WHERE j.gamebrain_id = $2
             RETURNING id, jogo_id, nota, texto, criada_em, atualizada_em`,
            [usuarioId, gamebrainId, nota, texto]
        );

        if (!result.rows[0]) {
            await client.query('ROLLBACK');
            return null;
        }

        const review = result.rows[0];
        await client.query(
            `INSERT INTO atividades (usuario_id, jogo_id, tipo)
             VALUES ($1, $2, 'avaliacao_publicada')`,
            [usuarioId, review.jogo_id]
        );
        await client.query('COMMIT');
        return review;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function listarAvaliacoes(ordenacao = 'recent', usuarioId = null) {
    const orderBy = ordenacao === 'popular'
        ? 'curtidas DESC, a.criada_em DESC, a.id DESC'
        : 'a.criada_em DESC, a.id DESC';
    const result = await pool.query(
        `SELECT
            a.id,
            a.nota,
            a.texto,
            a.criada_em,
            a.atualizada_em,
            u.id AS autor_id,
            u.nome AS autor,
            j.gamebrain_id,
            j.titulo,
            j.capa_url,
            COUNT(c.usuario_id)::INTEGER AS curtidas,
            COALESCE(BOOL_OR(c.usuario_id = $1), FALSE) AS curtida_pelo_usuario
         FROM avaliacoes a
         INNER JOIN usuarios u ON u.id = a.usuario_id
         INNER JOIN jogos j ON j.id = a.jogo_id
         LEFT JOIN curtidas_avaliacoes c ON c.avaliacao_id = a.id
         GROUP BY a.id, u.id, u.nome, j.gamebrain_id, j.titulo, j.capa_url
         ORDER BY ${orderBy}
         LIMIT 100`,
        [usuarioId]
    );

    return result.rows;
}

async function listarAvaliacoesDoUsuario(usuarioId) {
    const result = await pool.query(
        `SELECT
            a.id,
            a.nota,
            a.texto,
            a.criada_em,
            a.atualizada_em,
            j.gamebrain_id,
            j.titulo,
            j.capa_url
         FROM avaliacoes a
         INNER JOIN jogos j ON j.id = a.jogo_id
         WHERE a.usuario_id = $1
         ORDER BY a.criada_em DESC, a.id DESC`,
        [usuarioId]
    );

    return result.rows;
}

async function atualizarAvaliacao(usuarioId, avaliacaoId, nota, texto) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `UPDATE avaliacoes
             SET nota = $1, texto = $2, atualizada_em = CURRENT_TIMESTAMP
             WHERE id = $3 AND usuario_id = $4
             RETURNING id, jogo_id, nota, texto, criada_em, atualizada_em`,
            [nota, texto, avaliacaoId, usuarioId]
        );
        if (!result.rows[0]) {
            await client.query('ROLLBACK');
            return null;
        }
        const review = result.rows[0];
        await client.query(
            `INSERT INTO atividades (usuario_id, jogo_id, tipo)
             VALUES ($1, $2, 'avaliacao_editada')`,
            [usuarioId, review.jogo_id]
        );
        await client.query('COMMIT');
        return review;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function removerAvaliacao(usuarioId, avaliacaoId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `DELETE FROM avaliacoes
             WHERE id = $1 AND usuario_id = $2
             RETURNING id, jogo_id`,
            [avaliacaoId, usuarioId]
        );
        if (!result.rows[0]) {
            await client.query('ROLLBACK');
            return false;
        }
        await client.query(
            `INSERT INTO atividades (usuario_id, jogo_id, tipo)
             VALUES ($1, $2, 'avaliacao_excluida')`,
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

async function listarAtividades(limite = 6) {
    const result = await pool.query(
        `SELECT
            a.id,
            a.tipo,
            a.detalhes,
            a.criada_em,
            u.id AS autor_id,
            u.nome AS autor,
            j.gamebrain_id,
            j.titulo,
            j.capa_url
         FROM atividades a
         INNER JOIN usuarios u ON u.id = a.usuario_id
         INNER JOIN jogos j ON j.id = a.jogo_id
         ORDER BY a.criada_em DESC, a.id DESC
         LIMIT $1`,
        [limite]
    );
    return result.rows;
}

async function definirCurtida(usuarioId, avaliacaoId, curtida) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const review = await client.query(
            'SELECT id, jogo_id FROM avaliacoes WHERE id = $1',
            [avaliacaoId]
        );
        if (!review.rows[0]) {
            await client.query('ROLLBACK');
            return null;
        }

        if (curtida) {
            const inserted = await client.query(
                `INSERT INTO curtidas_avaliacoes (avaliacao_id, usuario_id)
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING
                 RETURNING usuario_id`,
                [avaliacaoId, usuarioId]
            );
            if (inserted.rowCount) {
                await client.query(
                    `INSERT INTO atividades (usuario_id, jogo_id, tipo)
                     VALUES ($1, $2, 'avaliacao_curtida')`,
                    [usuarioId, review.rows[0].jogo_id]
                );
            }
        } else {
            await client.query(
                `DELETE FROM curtidas_avaliacoes
                 WHERE avaliacao_id = $1 AND usuario_id = $2`,
                [avaliacaoId, usuarioId]
            );
        }

        const count = await client.query(
            `SELECT COUNT(*)::INTEGER AS curtidas
             FROM curtidas_avaliacoes WHERE avaliacao_id = $1`,
            [avaliacaoId]
        );
        await client.query('COMMIT');
        return { curtida, curtidas: count.rows[0].curtidas };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    criarAvaliacao,
    listarAvaliacoes,
    listarAvaliacoesDoUsuario,
    atualizarAvaliacao,
    removerAvaliacao,
    listarAtividades,
    definirCurtida
};
