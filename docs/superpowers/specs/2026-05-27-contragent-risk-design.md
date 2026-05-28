# Контрагент Риск MVP Design

## Scope

MVP SaaS for checking Russian ООО/ИП by ИНН/ОГРН before advance payments, payment deferral, or contract signing. The first screen is the working dashboard, not a marketing page.

## Architecture

- Next.js App Router with TypeScript.
- Tailwind CSS and shadcn-style local UI primitives.
- NextAuth Credentials provider for MVP login and registration flow.
- Prisma schema targets PostgreSQL and models users, companies, checks, reports, monitoring items, events, and subscriptions.
- Runtime data uses mock provider abstractions so the UI works without real external APIs.

## Provider Layer

Providers are separate interfaces:

- `CompanyDataProvider`
- `CourtCasesProvider`
- `FinanceProvider`
- `EnforcementProvider`
- `BankruptcyProvider`

Mock implementations return five test companies and source update timestamps. The same interfaces are the replacement point for DaData, ФНС, legal arbitration providers, ГИР БО, ФССП providers, and Fedresurs.

## Risk Scoring

`riskScoring.ts` is the business core. It accepts normalized risk signals, applies weighted rules from the product brief, caps score at 100, and returns level, reasons, and recommendations.

## UX

The app uses a restrained B2B layout: sidebar navigation, dense dashboard metrics, large check input, company tabs, report actions, monitoring status, source dates, and explicit legal disclaimer. Status colors are green, amber, and red.

## Verification

Core scoring is covered by Vitest. Product scenarios are checked through local API calls and browser review after running the dev server.
