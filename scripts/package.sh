#!/usr/bin/env bash
# Maakt een deelbaar broncode-pakket (zip) van het project.
# De ontvanger pakt het uit en draait `docker compose up --build`.
#
# Gebruikt `git archive`, dus alleen GECOMMITTE bestanden komen mee.
# Alles in .gitignore (node_modules/, dist/, .env, *.log, *.tsbuildinfo) wordt
# automatisch uitgesloten — zo lekken er geen secrets en blijft de zip klein.
set -euo pipefail

cd "$(dirname "$0")/.."

OUT="leads-dashboard-$(date +%Y%m%d).zip"

# Waarschuw als er ongecommitte wijzigingen zijn (die komen NIET in het pakket).
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠  Let op: je hebt ongecommitte wijzigingen — die komen NIET in het pakket."
  echo "   Commit ze eerst als je ze wilt meesturen."
  echo
fi

echo "→ Pakket maken van de huidige commit (HEAD)…"
git archive --format=zip --prefix=leads-dashboard/ -o "$OUT" HEAD

SIZE=$(du -h "$OUT" | cut -f1)
echo
echo "✓ Klaar: $OUT  ($SIZE)"
echo
echo "Stuur dit bestand naar de ontvanger. Die hoeft alleen het volgende te doen:"
echo "  1. Docker Desktop installeren en starten"
echo "  2. $OUT uitpakken"
echo "  3. cd leads-dashboard"
echo "  4. docker compose up --build"
echo "  5. Open http://localhost:8090"
echo
echo "(Zie RUN.md in het pakket voor de volledige uitleg.)"
