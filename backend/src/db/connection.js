const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('error', (error) => {
    console.error('Erro inesperado no PostgreSQL:', error);
});

module.exports = pool;