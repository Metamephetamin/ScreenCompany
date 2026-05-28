# Контрагент Риск

MVP SaaS-сервиса проверки ООО/ИП по ИНН/ОГРН перед авансом, отсрочкой платежа или заключением договора.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS, shadcn-style локальные UI primitives, lucide-react
- NextAuth Credentials provider
- Prisma ORM с PostgreSQL schema
- Mock provider abstraction для публичных источников данных
- Vitest для бизнес-логики скоринга

## Local Run

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`.

Демо-логин: `demo@risk.local` / `password123`.

## Prisma

Схема и SQL migration лежат в `prisma/`. Для обычного PostgreSQL укажите `DATABASE_URL` по примеру `.env.example`, затем:

```bash
npx prisma generate
npx prisma migrate dev
```

В среде без локального PostgreSQL можно поднять Prisma dev database:

```bash
npx prisma dev --name contragent-risk --detach
npx prisma db push
```

## Test INNs

- `7701234567` - низкий риск
- `7812345678` - средний риск
- `5409876543` - высокий риск
- `6658123456` - ликвидация
- `502712345678` - молодая компания без отчетности

## Что сейчас является заглушкой

В продукте уже есть provider abstraction, но реальные API-ключи не подключены. Сейчас мокируются:

- данные ЕГРЮЛ/ЕГРИП;
- судебные дела;
- финансовая отчетность;
- исполнительные производства;
- банкротные события;
- события мониторинга;
- платежи тарифов.

Авторизация, регистрация, валидация форм, риск-скоринг, история, отчеты, PDF export и UI-сценарии работают локально. Для production следующим шагом нужно подключить persistent user/session storage через Prisma/PostgreSQL и заменить mock providers на реальные легальные API.
