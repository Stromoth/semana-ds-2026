CREATE TABLE usuarios (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX usuarios_email_unique
ON usuarios (LOWER(email));

CREATE TABLE jogos (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    gamebrain_id INTEGER NOT NULL UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    capa_url TEXT,
    lancamento DATE
);

CREATE TABLE biblioteca (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    jogo_id INTEGER NOT NULL REFERENCES jogos (id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'quero_jogar'
        CHECK (status IN ('quero_jogar', 'jogando', 'pausado', 'concluido', 'abandonado')),
    adicionado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, jogo_id)
);

CREATE INDEX biblioteca_usuario_adicionado_idx
ON biblioteca (usuario_id, adicionado_em DESC);