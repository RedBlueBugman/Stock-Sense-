# StockSense — Database Prototype

PostgreSQL database layer for the StockSense inventory-management prototype.

## Stack

- PostgreSQL 16+
- UUID primary keys
- `pgcrypto` for UUID generation
- Raw SQL migrations
- UTC timestamps (`TIMESTAMPTZ`)
- Immutable inventory ledger (`stock_moves`)
- SQL views for stock and dashboard KPIs
- Mock seed data for frontend/backend development

## Project structure

```text
stocksense-database/
├── migrations/
├── views/
├── triggers/
├── seeds/
├── backup/
├── docs/
├── docker-compose.yml
├── .env.example
├── dbdiagram.dbml
└── README.md
```

## Quick start

Requirements:
- Docker Desktop

Run:

```bash
docker compose up -d
```

Check:

```bash
docker compose ps
```

The database is initialized automatically from the numbered SQL migrations and seed file.

Connection:

```text
postgresql://stocksense:stocksense_dev@localhost:5432/stocksense
```

## Manual migration

If running PostgreSQL without Docker, execute SQL files in this order:

```text
001_extensions.sql
002_types.sql
003_users.sql
004_warehouses.sql
005_user_warehouses.sql
006_locations.sql
007_product_categories.sql
008_products.sql
009_product_lots.sql
010_partners.sql
011_stock_operations.sql
012_stock_moves.sql
013_stock_reservations.sql
014_reorder_rules.sql
015_alerts.sql
016_audit_log.sql
017_indexes.sql
```

Then:

```text
views/view_stock_quants.sql
views/view_dashboard_kpis.sql
triggers/updated_at.sql
triggers/stock_moves_immutable.sql
triggers/stock_operations_state_machine.sql
seeds/seed.sql
```

## Important inventory rule

Never store a mutable `current_stock` column on `products`.

Stock is derived from:

```text
completed incoming moves
- completed outgoing moves
- active reservations
```

The ledger is the source of truth.

`stock_moves` cannot be updated or deleted after insertion. To correct an inventory transaction, create a compensating/reversal move.

## Mock admin

```text
Email: admin@stocksense.local
Password: ChangeMe123!
Role: ADMIN
```

The password is only a prototype placeholder. Do not use it in production.

## Useful queries

Current stock:

```sql
SELECT *
FROM public.view_stock_quants
ORDER BY product_name, location_name;
```

Dashboard KPIs:

```sql
SELECT *
FROM public.view_dashboard_kpis;
```

## Backup

Daily logical backup:

```bash
./backup/backup.sh
```

Restore:

```bash
./backup/restore.sh ./backup/stocksense_YYYYMMDD_HHMMSS.dump
```

On Windows, run the same commands from Git Bash/WSL, or execute the equivalent `pg_dump` / `pg_restore` commands manually.

## Production note

This repository is intentionally suitable for a prototype. Before production deployment, add:
- managed PostgreSQL
- encrypted secrets
- real authentication/password hashing
- TLS
- restricted DB roles
- WAL archive destination
- automated backup retention
- monitoring
- connection pooling
- migration CI/CD
