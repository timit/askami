CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE distributions (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4 (),
    observation_date date NOT NULL DEFAULT CURRENT_DATE,
    key character varying(255) NOT NULL,
    bundled_server boolean NOT NULL DEFAULT FALSE,
    bundled_cloud boolean NOT NULL DEFAULT FALSE,
    total_downloads bigint NOT NULL DEFAULT 0,
    total_installs bigint NOT NULL DEFAULT 0,
    total_users bigint NOT NULL DEFAULT 0
);

ALTER TABLE distributions ADD CONSTRAINT observation UNIQUE (observation_date,key);
