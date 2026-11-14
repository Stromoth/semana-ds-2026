const pool = require('../db/connection');

async function criarAvaliacao(usuarioId, gamebrainId, nota, texto) {
    const result = await pool.query(
        `INSERT INTO avaliacoes (usuario_id, jogo_id, nota, texto)
         SELECT $1, j.id, $3, $4
         FROM jogos j
         INNER JOIN biblioteca b ON b.jogo_id = j.id AND b.usuario_id = $1
         WHERE j.gamebrain_id = $2
         RETURNING id, jogo_id, nota, texto, criada_em, atualizada_em`,
        [usuarioId, gamebrainId, nota, texto]
    );

    return result.rows[0] || null;
}

async function listarAvaliacoes() {
    const result = await pool.query(
        `SELECT
            a.id,
            a.nota,
            a.texto,
            a.criada_em,
            a.atualizada_em,
            u.nome AS autor,
            j.gamebrain_id,
            j.titulo,
            j.capa_url
         FROM avaliacoes a
         INNER JOIN usuarios u ON u.id = a.usuario_id
         INNER JOIN jogos j ON j.id = a.jogo_id
         ORDER BY a.criada_em DESC, a.id DESC
         LIMIT 100`
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
    const result = await pool.query(
        `UPDATE avaliacoes
         SET nota = $1, texto = $2, atualizada_em = CURRENT_TIMESTAMP
         WHERE id = $3 AND usuario_id = $4
         RETURNING id, nota, texto, criada_em, atualizada_em`,
        [nota, texto, avaliacaoId, usuarioId]
    );

    return result.rows[0] || null;
}

async function removerAvaliacao(usuarioId, avaliacaoId) {
    const result = await pool.query(
        `DELETE FROM avaliacoes
         WHERE id = $1 AND usuario_id = $2
         RETURNING id`,
        [avaliacaoId, usuarioId]
    );

    return result.rowCount > 0;
}

module.exports = {
    criarAvaliacao,
    listarAvaliacoes,
    listarAvaliacoesDoUsuario,
    atualizarAvaliacao,
    removerAvaliacao
};
