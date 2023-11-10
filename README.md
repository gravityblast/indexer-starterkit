CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    params JSONB,
    chain_id INTEGER NOT NULL,
    address VARCHAR(42) NOT NULL,
    contract_name VARCHAR(255)
);


SELECT
    chain_id,
    address,
    COALESCE(params->>'metadata', params->>'metaPtr') AS metadata
FROM events;

