# Real Data Integrations

## What Is Wired Now

- `DADATA_API_KEY`: enables real company lookup by INN/OGRN through DaData `findById/party`.
- `DAMIA_FSSP_API_KEY`: enables real FSSP enforcement lookup through DaMIA API-ФССП `isps`.
- PostgreSQL/Prisma stores users, password hashes, app sessions, checks, reports, monitoring companies, and monitoring events.
- `/api/cron/monitoring`: protected polling endpoint for real monitoring jobs.

## How Monitoring Works

1. A company is added to monitoring in the app.
2. A scheduler calls `POST /api/cron/monitoring` with `Authorization: Bearer $CRON_SECRET`.
3. The app re-runs the risk check through the active providers.
4. New risk events are deduplicated by fingerprint and stored in `MonitoringEvent`.

## Accesses To Request

### DaData

Use for company card data by INN/OGRN.

1. Register at `https://dadata.ru/`.
2. Confirm email.
3. Open the API section in the account.
4. Copy API token into `DADATA_API_KEY`.

### FNS EGRUL/EGRIP

The official `egrul.nalog.ru` service provides free signed PDF extracts. For JSON/API product usage, use DaData or a licensed provider unless you have a formal API access channel.

### GIR BO

FNS describes API access to accounting reports as a paid government service. For production, request API access from FNS or use a licensed provider.

### Arbitration, Enforcement, Bankruptcy

DaMIA API-ФССП is wired for enforcement proceedings. Register at `https://damia.ru/apifssp`, choose API-Старт, copy the API key into `DAMIA_FSSP_API_KEY`.

Do not scrape KAD or Fedresurs in production. Use a legal API provider or a formal data-access agreement. Add credentials as env vars and implement the existing provider interfaces:

- `CourtCasesProvider`
- `BankruptcyProvider`

## Required Production Env

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.example"
NEXTAUTH_SECRET="long-random-secret"
CRON_SECRET="long-random-secret"
DADATA_API_KEY="..."
DAMIA_FSSP_API_KEY="..."
```
