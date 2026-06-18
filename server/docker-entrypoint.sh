#!/bin/sh
set -e

echo "→ Database-migraties toepassen…"
npx prisma migrate deploy

echo "→ Standaard bord + demo-data seeden (idempotent)…"
npx tsx prisma/seed.ts || echo "Seed overgeslagen (bestaat waarschijnlijk al)."

echo "→ API starten op poort ${PORT:-4000}…"
exec npx tsx src/index.ts
