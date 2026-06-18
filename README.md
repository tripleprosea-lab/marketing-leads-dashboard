# Marketing Leads Dashboard

Een kanban-dashboard voor leadbeheer met WordPress-intake, AI-verrijking en automatiseringen
(e-mail/WhatsApp) per fase.

## Functionaliteit

- **Kanban-pijplijn** met drag & drop tussen fases.
- **Zelf in te richten fases**: toevoegen, hernoemen, kleur, win-kans, "Gewonnen" (groen) markeren.
- **Lead-intake via WordPress** (`POST /api/webhooks/wordpress`).
- **Bronlabel** per lead (SEO / SEA / Social / Direct), automatisch afgeleid uit UTM/referrer.
- **AI-verrijking** van contact- en bedrijfsgegevens via Exa-websearch + Claude.
- **Automatiseringen per fase** (e-mail via ActiveCampaign, WhatsApp via Zapier) bij binnenkomst.
- **Verwachte omzet** = dealwaarde × win-kans, vanaf de fase "Gekwalificeerd"; totalen in de header.

## Tech-stack

- **Frontend**: React + Vite + TypeScript + Tailwind + @dnd-kit + TanStack Query (`/client`)
- **Backend**: Node + Express + TypeScript + Prisma (`/server`)
- **Database**: PostgreSQL

## Snel starten met Docker (aanbevolen)

De hele stack (database + backend + frontend) draait met één commando. Je hebt alleen
**Docker Desktop** (of Docker Engine + Compose) nodig.

```bash
# 1. (optioneel) externe koppelingen instellen
cp .env.example .env          # vul alleen de keys in die je wilt; alles is optioneel

# 2. Bouwen en starten
docker compose up --build
```

- **Dashboard**: http://localhost:8090
- **API**: http://localhost:4000/api/health

De backend voert bij het opstarten automatisch de database-migraties uit en seedt het
standaard bord met 7 fases + demo-leads. Stoppen: `Ctrl+C`, daarna `docker compose down`
(voeg `-v` toe om ook de databasegegevens te wissen).

## Lokaal draaien zonder Docker (ontwikkelmodus)

```bash
# 1. Dependencies
npm install

# 2. Database (Postgres via Docker)
docker compose up -d db

# 3. Env instellen
cp .env.example server/.env   # vul keys aan waar gewenst (alles is optioneel)

# 4. Schema + seed (standaard bord met 7 fases + demo-leads)
npm run db:migrate
npm run db:seed

# 5. Start client + server
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000/api/health

### Tests

```bash
npm test   # unit-tests voor bronlabel- en omzetlogica
```

### Web-sessies / snelle setup

`bash scripts/setup.sh` installeert dependencies en genereert de Prisma-client, zodat
typecheck, tests en build meteen werken. Wil je dit automatisch laten draaien bij elke
Claude Code-websessie? Koppel het script aan een `SessionStart`-hook in `.claude/settings.json`.

## Configuratie (`server/.env`)

Alle externe koppelingen zijn optioneel. Zonder keys werken kanban + intake + handmatige
acties; verrijking en automatiseringen loggen netjes "skipped".

| Variabele | Doel |
|---|---|
| `DATABASE_URL` | Postgres-connectie |
| `WORDPRESS_WEBHOOK_SECRET` | Beveiligt de intake-webhook (header `X-Webhook-Secret`) |
| `EXA_API_KEY`, `ANTHROPIC_API_KEY` | AI-verrijking |
| `ACTIVECAMPAIGN_API_URL`, `ACTIVECAMPAIGN_API_KEY` | E-mailautomatisering |
| `ZAPIER_WHATSAPP_WEBHOOK_URL` | WhatsApp-automatisering |

## WordPress-koppeling

Zie [`docs/wordpress-integration.md`](docs/wordpress-integration.md) voor een kant-en-klare
snippet en voorbeeldpayloads.

## Architectuur

```
/server   REST API, webhooks, verrijking, automatiseringen
  /prisma   schema + seed
  /src
    /lib         prisma, env, bronlabel, omzetberekening, serialisatie
    /routes      boards, stages, leads, automations, webhooks
    /services    enrichment + automations (email, whatsapp)
/client   React kanban-UI
  /src/components  KanbanBoard, KanbanColumn, LeadCard, LeadDetailDrawer, BoardSettings
```
