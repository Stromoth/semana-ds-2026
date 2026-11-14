BEGIN;

CREATE TABLE IF NOT EXISTS usuarios_seguindo (
    seguidor_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    seguido_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (seguidor_id, seguido_id),
    CHECK (seguidor_id <> seguido_id)
);

CREATE INDEX IF NOT EXISTS usuarios_seguindo_seguido_idx
    ON usuarios_seguindo (seguido_id, seguidor_id);

COMMIT;
