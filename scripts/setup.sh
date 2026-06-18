#!/usr/bin/env bash
# Setup voor (web-)sessies: dependencies installeren en Prisma-client genereren,
# zodat typecheck, tests en build direct werken.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  echo "→ npm install"
  npm install --no-audit --no-fund
fi

echo "→ prisma generate"
npx prisma generate --schema server/prisma/schema.prisma >/dev/null

echo "✓ Setup klaar. Handig: 'npm test', 'npm run lint', 'npm run dev'."
