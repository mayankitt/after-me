#!/usr/bin/env bash
# Creates the afterme application database if it does not already exist.
# Mounted into postgres container at /docker-entrypoint-initdb.d/
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  SELECT 'CREATE DATABASE afterme'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'afterme')\gexec

  GRANT ALL PRIVILEGES ON DATABASE afterme TO keycloak;
EOSQL
