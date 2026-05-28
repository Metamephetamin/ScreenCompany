# Контрагент Риск

MVP SaaS-сервиса проверки ООО/ИП по ИНН/ОГРН перед авансом, отсрочкой платежа или заключением договора.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS, shadcn-style локальные UI primitives, lucide-react
- NextAuth Credentials provider
- Prisma ORM с PostgreSQL schema, пользователями, httpOnly database sessions, историей, отчетами и мониторингом
- Provider abstraction для публичных источников данных: mock по умолчанию, DaData и DaMIA API-ФССП при наличии ключей
- Vitest для бизнес-логики скоринга

## Local Run

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`.

Демо-логин: `demo@risk.local` / `password123`.

Минимальные переменные окружения:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contragent_risk?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me"
CRON_SECRET="change-me-long-random"
DADATA_API_KEY=""
DAMIA_FSSP_API_KEY=""
```

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

## Реальные данные и мониторинг

Если `DADATA_API_KEY` задан, поиск компании по ИНН/ОГРН идет через DaData `findById/party`.
Если `DAMIA_FSSP_API_KEY` задан, исполнительные производства ЮЛ подтягиваются через DaMIA API-ФССП `isps`.
Если ключа нет, приложение использует mock provider, чтобы локальная разработка не зависела от внешних сервисов.

Мониторинг хранится в PostgreSQL. Для запуска регулярной проверки вызовите:

```bash
curl -X POST http://localhost:3000/api/cron/monitoring \
  -H "Authorization: Bearer $CRON_SECRET"
```

Этот endpoint рассчитан на Vercel Cron, GitHub Actions cron, systemd timer или любой планировщик, который умеет делать HTTP POST.

Сейчас без отдельных API-договоров остаются mock-провайдеры:

- судебные дела;
- банкротные события;
- платежи тарифов.

Авторизация, регистрация, database sessions, валидация форм, риск-скоринг, история, отчеты, PDF export, мониторинг и UI-сценарии работают локально.

## Где получить доступы

- DaData: зарегистрироваться на `dadata.ru`, подтвердить почту, взять API-ключ в личном кабинете. Для базового поиска по ИНН/ОГРН используется `DADATA_API_KEY`.
- DaMIA API-ФССП: зарегистрироваться на `damia.ru/apifssp`, выбрать API-Старт, взять ключ доступа и положить его в `DAMIA_FSSP_API_KEY`.
- ЕГРЮЛ/ЕГРИП ФНС: официальный сайт `egrul.nalog.ru` дает бесплатные PDF-выписки с ЭП; публичного JSON API для массовой интеграции у этого сервиса обычно нет, поэтому для продукта лучше использовать DaData или лицензированного агрегатора.
- ГИР БО: ФНС описывает API-доступ как госуслугу, отдельно от бесплатного скачивания отчетности. Для промышленного доступа нужно оформлять доступ к API по регламенту ФНС.
- КАД Арбитр и Федресурс: для production не скрейпить сайты. Нужен договор с легальным API-провайдером или официальный канал доступа, если он доступен для вашего юрлица.
