const pool = require('../db/connection');

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

async function register(nome, email, senha) {
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const query = `
        INSERT INTO usuarios (nome, email, senha_hash)
        VALUES ($1, $2, $3)
        RETURNING id, nome, email, criado_em
    `;

    const values = [nome, email, senhaHash];

    const result = await pool.query(query, values);

    return result.rows[0];
}

async function login(email, senha) {
    const query = `
        SELECT id, nome, email, senha_hash
        FROM usuarios
        WHERE LOWER(email) = LOWER($1)
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
        return null;
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare (
        senha,
        usuario.senha_hash
    );

    if (!senhaValida) {
        return null;
    }

    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
    };
}

module.exports = {
    register,
    login
};