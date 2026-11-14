BEGIN;

ALTER TABLE jogos
    ALTER COLUMN rawg_id DROP NOT NULL;

ALTER TABLE jogos
    ADD COLUMN IF NOT EXISTS gamebrain_id INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS jogos_gamebrain_id_unique
    ON jogos (gamebrain_id);

COMMIT;
