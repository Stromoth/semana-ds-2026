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

CREATE TABLE avaliacoes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    jogo_id INTEGER NOT NULL REFERENCES jogos (id) ON DELETE CASCADE,
    nota SMALLINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    texto VARCHAR(2000) NOT NULL CHECK (LENGTH(BTRIM(texto)) BETWEEN 1 AND 2000),
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, jogo_id)
);

CREATE INDEX avaliacoes_criada_em_idx
ON avaliacoes (criada_em DESC);

CREATE TABLE curtidas_avaliacoes (
    avaliacao_id INTEGER NOT NULL REFERENCES avaliacoes (id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (avaliacao_id, usuario_id)
);

CREATE TABLE atividades (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    jogo_id INTEGER NOT NULL REFERENCES jogos (id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL
        CHECK (tipo IN ('jogo_adicionado', 'jogo_removido', 'status_alterado', 'avaliacao_publicada', 'avaliacao_editada', 'avaliacao_excluida', 'avaliacao_curtida')),
    detalhes JSONB NOT NULL DEFAULT '{}'::jsonb,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX atividades_criada_em_idx
ON atividades (criada_em DESC, id DESC);