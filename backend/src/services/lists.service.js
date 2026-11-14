const pool = require('../db/connection');

async function listarPublicas() {
    const result = await pool.query(
        `SELECT
            l.id,
            l.nome,
            l.descricao,
            l.criada_em,
            l.atualizada_em,
            u.nome AS autor,
            COUNT(lj.jogo_id)::INTEGER AS quantidade_jogos
         FROM listas l
         INNER JOIN usuarios u ON u.id = l.usuario_id
         LEFT JOIN lista_jogos lj ON lj.lista_id = l.id
         WHERE l.publica = TRUE
         GROUP BY l.id, u.nome
         ORDER BY l.atualizada_em DESC, l.id DESC`
    );
    return result.rows;
}

async function listarMinhas(usuarioId) {
    const result = await pool.query(
        `SELECT
            l.id,
            l.nome,
            l.descricao,
            l.publica,
            l.criada_em,
            l.atualizada_em,
            COUNT(lj.jogo_id)::INTEGER AS quantidade_jogos
         FROM listas l
         LEFT JOIN lista_jogos lj ON lj.lista_id = l.id
         WHERE l.usuario_id = $1
         GROUP BY l.id
         ORDER BY l.atualizada_em DESC, l.id DESC`,
        [usuarioId]
    );
    return result.rows;
}

async function buscarPorId(listaId, usuarioId = null) {
    const listResult = await pool.query(
        `SELECT l.id, l.usuario_id, l.nome, l.descricao, l.publica,
                l.criada_em, l.atualizada_em, u.nome AS autor
         FROM listas l
         INNER JOIN usuarios u ON u.id = l.usuario_id
         WHERE l.id = $1 AND (l.publica = TRUE OR l.usuario_id = $2)`,
        [listaId, usuarioId]
    );
    if (!listResult.rows[0]) {
        return null;
    }

    const list = listResult.rows[0];
    const gamesResult = await pool.query(
        `SELECT j.gamebrain_id, j.titulo, j.capa_url, j.lancamento,
                lj.adicionado_em
         FROM lista_jogos lj
         INNER JOIN jogos j ON j.id = lj.jogo_id
         WHERE lj.lista_id = $1
         ORDER BY lj.adicionado_em, j.titulo`,
        [listaId]
    );

    return {
        ...list,
        minha: usuarioId !== null && list.usuario_id === usuarioId,
        jogos: gamesResult.rows
    };
}

async function criar(usuarioId, nome, descricao, publica) {
    const result = await pool.query(
        `INSERT INTO listas (usuario_id, nome, descricao, publica)
         VALUES ($1, $2, $3, $4)
         RETURNING id, nome, descricao, publica, criada_em, atualizada_em`,
        [usuarioId, nome, descricao, publica]
    );
    return result.rows[0];
}

async function atualizar(usuarioId, listaId, nome, descricao, publica) {
    const result = await pool.query(
        `UPDATE listas
         SET nome = $1, descricao = $2, publica = $3,
             atualizada_em = CURRENT_TIMESTAMP
         WHERE id = $4 AND usuario_id = $5
         RETURNING id, nome, descricao, publica, criada_em, atualizada_em`,
        [nome, descricao, publica, listaId, usuarioId]
    );
    return result.rows[0] || null;
}

async function remover(usuarioId, listaId) {
    const result = await pool.query(
        `DELETE FROM listas
         WHERE id = $1 AND usuario_id = $2
         RETURNING id`,
        [listaId, usuarioId]
    );
    return result.rowCount > 0;
}

async function adicionarJogo(usuarioId, listaId, gamebrainId) {
    const result = await pool.query(
        `INSERT INTO lista_jogos (lista_id, jogo_id, usuario_id)
         SELECT l.id, j.id, $1
         FROM listas l
         INNER JOIN jogos j ON j.gamebrain_id = $3
         INNER JOIN biblioteca b ON b.jogo_id = j.id AND b.usuario_id = $1
         WHERE l.id = $2 AND l.usuario_id = $1
         RETURNING lista_id, jogo_id`,
        [usuarioId, listaId, gamebrainId]
    );
    return result.rows[0] || null;
}

async function removerJogo(usuarioId, listaId, gamebrainId) {
    const result = await pool.query(
        `DELETE FROM lista_jogos lj
         USING listas l, jogos j
         WHERE lj.lista_id = l.id
           AND lj.jogo_id = j.id
           AND l.id = $1
           AND l.usuario_id = $2
           AND j.gamebrain_id = $3
         RETURNING lj.lista_id`,
        [listaId, usuarioId, gamebrainId]
    );
    return result.rowCount > 0;
}

module.exports = {
    listarPublicas,
    listarMinhas,
    buscarPorId,
    criar,
    atualizar,
    remover,
    adicionarJogo,
    removerJogo
};
