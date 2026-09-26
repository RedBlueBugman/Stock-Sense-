# Backup and Restore Procedure

## Prototype backup

1. Ensure PostgreSQL is running.
2. Set PostgreSQL connection environment variables if needed.
3. Run:

```bash
./backup/backup.sh
```

The output is a timestamped custom-format dump.

## Restore

Restore into a disposable/test database first.

```bash
createdb stocksense_restore_test
pg_restore --dbname=stocksense_restore_test --clean --if-exists ./backup/stocksense_YYYYMMDD_HHMMSS.dump
```

Verify:

```sql
SELECT COUNT(*) FROM public.products;
SELECT COUNT(*) FROM public.stock_moves;
SELECT * FROM public.view_stock_quants;
```

For production, use managed PostgreSQL backups plus WAL archiving/PITR. This prototype repository does not configure a cloud WAL destination because credentials and infrastructure are environment-specific.
