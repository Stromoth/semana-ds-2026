BEGIN;

CREATE TABLE IF NOT EXISTS listas (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    nome VARCHAR(80) NOT NULL,
    descricao VARCHAR(500) NOT NULL DEFAULT '',
    publica BOOLEAN NOT NULL DEFAULT TRUE,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, nome)
);

CREATE INDEX IF NOT EXISTS listas_publicas_atualizada_idx
    ON listas (atualizada_em DESC)
    WHERE publica = TRUE;

CREATE TABLE IF NOT EXISTS lista_jogos (
    lista_id INTEGER NOT NULL REFERENCES listas (id) ON DELETE CASCADE,
    jogo_id INTEGER NOT NULL REFERENCES jogos (id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    adicionado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lista_id, jogo_id)
);

CREATE INDEX IF NOT EXISTS lista_jogos_lista_adicionado_idx
    ON lista_jogos (lista_id, adicionado_em, jogo_id);

COMMIT;
