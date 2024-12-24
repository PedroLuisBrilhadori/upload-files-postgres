SELECT 'CREATE DATABASE teste'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'teste')\gexec

\c teste
CREATE EXTENSION IF NOT EXISTS unaccent;