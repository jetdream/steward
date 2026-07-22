-- Enable pgvector on the default database (POSTGRES_DB=main)
-- Runs automatically on first start when pgdata volume is empty.
CREATE EXTENSION IF NOT EXISTS vector;
