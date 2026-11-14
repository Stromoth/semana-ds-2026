BEGIN;

CREATE TABLE IF NOT EXISTS curtidas_avaliacoes (
    avaliacao_id INTEGER NOT NULL REFERENCES avaliacoes (id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (avaliacao_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS atividades (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    jogo_id INTEGER NOT NULL REFERENCES jogos (id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL
        CHECK (tipo IN ('jogo_adicionado', 'jogo_removido', 'status_alterado', 'avaliacao_publicada', 'avaliacao_editada', 'avaliacao_excluida', 'avaliacao_curtida')),
    detalhes JSONB NOT NULL DEFAULT '{}'::jsonb,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE atividades
    DROP CONSTRAINT IF EXISTS atividades_tipo_check;

ALTER TABLE atividades
    ADD CONSTRAINT atividades_tipo_check
    CHECK (tipo IN (
        'jogo_adicionado',
        'jogo_removido',
        'status_alterado',
        'avaliacao_publicada',
        'avaliacao_editada',
        'avaliacao_excluida',
        'avaliacao_curtida'
    ));

CREATE INDEX IF NOT EXISTS atividades_criada_em_idx
    ON atividades (criada_em DESC, id DESC);

INSERT INTO atividades (usuario_id, jogo_id, tipo, criada_em)
SELECT a.usuario_id, a.jogo_id, 'avaliacao_publicada', a.criada_em
FROM avaliacoes a
WHERE NOT EXISTS (
    SELECT 1
    FROM atividades atv
    WHERE atv.usuario_id = a.usuario_id
      AND atv.jogo_id = a.jogo_id
      AND atv.tipo = 'avaliacao_publicada'
);

COMMIT;
