const pool = require('../db/connection');

async function authMiddleware(req, res, next) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                erro: 'Você precisa estar autenticado.'
            });
        }

        const query = `
        SELECT id, nome, email
        FROM usuarios
        WHERE id = $1
        `;

        const result = await pool.query(query, [
            req.session.userId
        ]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                erro: 'Usuário não encontrado.'
            });
        }

        req.usuario = result.rows[0];

        next();
    
    } catch (error) {
        console.error('Erro na autenticação:', error);

        return res.status(500).json({
            erro: 'Erro ao verificar autenticação.'
        });
    }
}

module.exports = authMiddleware;