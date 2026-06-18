# Het dashboard draaien (voor de ontvanger)

Je hebt een pakket van het **Marketing Leads Dashboard** gekregen. Hiermee draai je de hele
applicatie (database + backend + frontend) lokaal met Docker. Je hoeft niets te installeren
behalve Docker.

## 1. Docker installeren

Installeer **Docker Desktop** en start het:
- Mac / Windows: https://www.docker.com/products/docker-desktop
- Linux: Docker Engine + Docker Compose

Controleer dat het werkt:
```bash
docker --version
```

## 2. Pakket uitpakken

Pak het ontvangen zip-bestand uit en ga in de map:
```bash
cd leads-dashboard
```

## 3. (Optioneel) API-keys instellen

Sla dit gerust over — het dashboard werkt prima zonder. Wil je AI-verrijking, e-mail- of
WhatsApp-automatiseringen gebruiken, kopieer dan het voorbeeldbestand en vul je keys in:
```bash
cp .env.example .env
```
Open daarna `.env` en vul in wat je wilt gebruiken (Exa, Anthropic, ActiveCampaign, Zapier).
Zonder keys worden die functies netjes overgeslagen.

## 4. Starten

```bash
docker compose up --build
```
De eerste keer duurt dit een paar minuten (Docker haalt images op en bouwt de app). De database
wordt automatisch klaargezet met een standaard kanban-bord en een paar demo-leads.

## 5. Openen in de browser

- **Dashboard:** http://localhost:8090
- API-check: http://localhost:4000/api/health → `{"ok":true}`

## Stoppen en opruimen

```bash
# Stoppen: druk Ctrl+C in het venster, daarna:
docker compose down

# Inclusief alle opgeslagen data wissen (schone start):
docker compose down -v
```

## Problemen?

- **Poort 8090 of 4000 al in gebruik** → stop de andere service, of vraag de afzender om een
  andere poort in te stellen.
- **Build mislukt** → `docker compose build --no-cache` en daarna `docker compose up`.
- Zorg dat Docker Desktop **draait** voordat je `docker compose` gebruikt.
