CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- pg_stat_statements requires shared_preload_libraries.
-- Docker enables it in docker-compose.yml for the prototype.
