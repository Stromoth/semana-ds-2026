const pool = require('../db/connection');

async function listarDestaques() {
    const result = await pool.query(
        `WITH jogos_da_comunidade AS (
            SELECT
                j.gamebrain_id,
                j.titulo,
                j.capa_url,
                j.lancamento,
                COUNT(DISTINCT b.usuario_id)::INTEGER AS jogadores,
                COUNT(DISTINCT a.id)::INTEGER AS avaliacoes,
                ROUND(AVG(a.nota)::NUMERIC, 1) AS nota
            FROM jogos j
            INNER JOIN biblioteca b ON b.jogo_id = j.id
            LEFT JOIN avaliacoes a ON a.jogo_id = j.id
            GROUP BY j.id
         )
         SELECT
            jogos_da_comunidade.*,
            COUNT(*) OVER()::INTEGER AS total
         FROM jogos_da_comunidade
         ORDER BY jogadores DESC, avaliacoes DESC, nota DESC NULLS LAST, titulo
         LIMIT 20`
    );

    return {
        total: result.rows[0]?.total || 0,
        resultados: result.rows.map(({ total, ...game }) => game)
    };
}

module.exports = { listarDestaques };
