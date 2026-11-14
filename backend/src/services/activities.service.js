const pool = require('../db/connection');

async function listarDaRede(usuarioId, limite = 20) {
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
         INNER JOIN usuarios_seguindo s
            ON s.seguido_id = a.usuario_id AND s.seguidor_id = $1
         ORDER BY a.criada_em DESC, a.id DESC
         LIMIT $2`,
        [usuarioId, limite]
    );
    return result.rows;
}

module.exports = { listarDaRede };
