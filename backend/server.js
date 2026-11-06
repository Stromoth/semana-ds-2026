require('dotenv').config();

const express = require('express');
const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');

const pool = require('./src/db/connection');
const authRoutes = require('./src/routes/auth.routes');
const libraryRoutes = require("./src/routes/library.routes");

const gamesRoutes = require('./src/routes/games.routes');

if (!process.env.SESSION_SECRET) {
    throw new Error ('SESSION_SECRET não configurado.');
}

const app = express();

const PgSession = connectPgSimple(session);

const sessionStore = new PgSession({
    pool,
    tableName: 'sessoes',
    createTableIfMissing: true
});

app.use(express.json({ limit: '10kb' }));

app.use(session({
    name: 'gamebox.sid',
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use("/api/library", libraryRoutes);

app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT NOW()');

        res.status(200).json({
            status: 'OK',
            mensagem: 'Gamebox API funcionando!',
            database: 'Conectado'
        });
    
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: 'ERRO',
            mensagem: 'Falha na conexão com o banco.'
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada.'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Gamebox API: http://127.0.0.1${PORT}`);
});