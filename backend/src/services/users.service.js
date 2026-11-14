const pool = require('../db/connection');

async function buscarUsuarios(termo, usuarioId) {
    const result = await pool.query(
        `SELECT
            u.id,
            u.nome,
            (SELECT COUNT(*)::INTEGER
             FROM usuarios_seguindo s WHERE s.seguido_id = u.id) AS seguidores,
            EXISTS (
                SELECT 1 FROM usuarios_seguindo s
                WHERE s.seguidor_id = $2 AND s.seguido_id = u.id
            ) AS seguindo
         FROM usuarios u
         WHERE ($1 = '' OR u.nome ILIKE '%' || $1 || '%')
           AND ($2::INTEGER IS NULL OR u.id <> $2)
         ORDER BY u.nome, u.id
         LIMIT 50`,
        [termo, usuarioId]
    );
    return result.rows;
}

async function listarSeguindo(usuarioId) {
    const result = await pool.query(
        `SELECT
            u.id,
            u.nome,
            (SELECT COUNT(*)::INTEGER
             FROM usuarios_seguindo s WHERE s.seguido_id = u.id) AS seguidores,
            TRUE AS seguindo
         FROM usuarios_seguindo rel
         INNER JOIN usuarios u ON u.id = rel.seguido_id
         WHERE rel.seguidor_id = $1
         ORDER BY u.nome, u.id`,
        [usuarioId]
    );
    return result.rows;
}

async function buscarPerfil(perfilId, visitanteId) {
    const profileResult = await pool.query(
        `SELECT
            u.id,
            u.nome,
            u.criado_em,
            (SELECT COUNT(*)::INTEGER
             FROM usuarios_seguindo s WHERE s.seguido_id = u.id) AS seguidores,
            (SELECT COUNT(*)::INTEGER
             FROM usuarios_seguindo s WHERE s.seguidor_id = u.id) AS seguindo,
            EXISTS (
                SELECT 1 FROM usuarios_seguindo s
                WHERE s.seguidor_id = $2 AND s.seguido_id = u.id
            ) AS seguido_pelo_visitante
         FROM usuarios u
         WHERE u.id = $1`,
        [perfilId, visitanteId]
    );
    if (!profileResult.rows[0]) {
        return null;
    }

    const [libraryResult, reviewsResult] = await Promise.all([
        pool.query(
            `SELECT
                j.gamebrain_id,
                j.titulo,
                j.capa_url,
                j.lancamento,
                b.status,
                b.adicionado_em
             FROM biblioteca b
             INNER JOIN jogos j ON j.id = b.jogo_id
             WHERE b.usuario_id = $1
             ORDER BY b.adicionado_em DESC, b.id DESC`,
            [perfilId]
        ),
        pool.query(
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
            [perfilId]
        )
    ]);

    return {
        ...profileResult.rows[0],
        meu_perfil: perfilId === visitanteId,
        biblioteca: libraryResult.rows,
        avaliacoes: reviewsResult.rows
    };
}

async function seguir(seguidorId, seguidoId) {
    const result = await pool.query(
        `INSERT INTO usuarios_seguindo (seguidor_id, seguido_id)
         SELECT $1, id FROM usuarios WHERE id = $2
         ON CONFLICT (seguidor_id, seguido_id) DO NOTHING
         RETURNING seguido_id`,
        [seguidorId, seguidoId]
    );
    return result.rowCount > 0;
}

async function deixarDeSeguir(seguidorId, seguidoId) {
    const result = await pool.query(
        `DELETE FROM usuarios_seguindo
         WHERE seguidor_id = $1 AND seguido_id = $2
         RETURNING seguido_id`,
        [seguidorId, seguidoId]
    );
    return result.rowCount > 0;
}

module.exports = {
    buscarUsuarios,
    listarSeguindo,
    buscarPerfil,
    seguir,
    deixarDeSeguir
};
