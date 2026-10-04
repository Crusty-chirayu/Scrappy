-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Verify extensions
DO $$
BEGIN
  RAISE NOTICE 'Scrappy database initialized with pg_trgm, unaccent, and pgvector extensions';
END $$;
