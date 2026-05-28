import type {
  BankruptcyInfo,
  Company,
  CourtCase,
  EnforcementCase,
  FinanceYear,
  MonitoringEvent,
} from "@/lib/types";

export const sourceDates = {
  egrul: { name: "ЕГРЮЛ/ЕГРИП", updatedAt: "2026-05-24T09:00:00.000Z" },
  courts: { name: "Арбитраж", updatedAt: "2026-05-22T10:30:00.000Z" },
  finance: { name: "Финансы", updatedAt: "2026-04-30T12:00:00.000Z" },
  enforcement: { name: "ФССП", updatedAt: "2026-05-23T08:00:00.000Z" },
  bankruptcy: { name: "Федресурс", updatedAt: "2026-05-21T11:15:00.000Z" },
} as const;

export const mockCompanies: Company[] = [
  {
    id: "volga-logistics",
    name: "ООО \"Волга Логистик\"",
    shortName: "Волга Логистик",
    type: "ООО",
    inn: "7701234567",
    ogrn: "1147746123456",
    registrationDate: "2014-03-18",
    status: "ACTIVE",
    address: "125047, Москва, ул. Лесная, д. 7, офис 41",
    director: "Смирнов Алексей Павлович",
    okved: "52.29 - Деятельность вспомогательная прочая, связанная с перевозками",
    authorizedCapital: 1_500_000,
    massAddress: false,
    directorChangesLastYear: 0,
    sources: [sourceDates.egrul],
  },
  {
    id: "sever-stroy",
    name: "ООО \"Север Строй Комплект\"",
    shortName: "Север Строй",
    type: "ООО",
    inn: "7812345678",
    ogrn: "1187847123456",
    registrationDate: "2018-09-05",
    status: "ACTIVE",
    address: "190000, Санкт-Петербург, Невский пр-т, д. 88, помещ. 12-Н",
    director: "Кузнецова Марина Игоревна",
    okved: "46.73 - Торговля оптовая лесоматериалами, строительными материалами",
    authorizedCapital: 10_000,
    massAddress: true,
    directorChangesLastYear: 1,
    sources: [sourceDates.egrul],
  },
  {
    id: "delta-import",
    name: "ООО \"Дельта Импорт\"",
    shortName: "Дельта Импорт",
    type: "ООО",
    inn: "5409876543",
    ogrn: "1125476000001",
    registrationDate: "2012-01-24",
    status: "ACTIVE",
    address: "630099, Новосибирск, Красный пр-т, д. 21, офис 508",
    director: "Петров Денис Сергеевич",
    okved: "46.90 - Торговля оптовая неспециализированная",
    authorizedCapital: 10_000,
    massAddress: true,
    directorChangesLastYear: 3,
    sources: [sourceDates.egrul],
  },
  {
    id: "ural-service-liquidation",
    name: "ООО \"Урал Сервис\"",
    shortName: "Урал Сервис",
    type: "ООО",
    inn: "6658123456",
    ogrn: "1096658000002",
    registrationDate: "2009-11-11",
    status: "LIQUIDATION",
    address: "620014, Екатеринбург, ул. Малышева, д. 36, офис 9",
    director: "Ликвидатор: Орлова Анна Викторовна",
    okved: "33.12 - Ремонт машин и оборудования",
    authorizedCapital: 10_000,
    massAddress: false,
    directorChangesLastYear: 1,
    sources: [sourceDates.egrul],
  },
  {
    id: "smart-market-young",
    name: "ИП Никитин Артем Романович",
    shortName: "ИП Никитин",
    type: "ИП",
    inn: "502712345678",
    ogrn: "325502700000123",
    registrationDate: "2026-02-17",
    status: "ACTIVE",
    address: "Московская область, г. Люберцы",
    director: "Никитин Артем Романович",
    okved: "47.91 - Торговля розничная по почте или Интернету",
    authorizedCapital: null,
    massAddress: false,
    directorChangesLastYear: 0,
    sources: [sourceDates.egrul],
  },
];

export const mockCourtCases: Record<string, CourtCase[]> = {
  "volga-logistics": [
    {
      id: "A40-1001",
      role: "claimant",
      title: "Взыскание задолженности по перевозке",
      amount: 240_000,
      date: "2025-10-10",
      status: "Завершено",
    },
  ],
  "sever-stroy": [
    {
      id: "A56-2044",
      role: "defendant",
      title: "Спор по поставке материалов",
      amount: 780_000,
      date: "2026-03-02",
      status: "В производстве",
    },
    {
      id: "A56-9912",
      role: "defendant",
      title: "Неустойка по договору",
      amount: 160_000,
      date: "2025-08-14",
      status: "Завершено",
    },
  ],
  "delta-import": Array.from({ length: 7 }).map((_, index) => ({
    id: `A45-77${index}`,
    role: "defendant" as const,
    title: index % 2 === 0 ? "Взыскание задолженности" : "Спор о качестве товара",
    amount: 350_000 + index * 120_000,
    date: `2025-${String(index + 3).padStart(2, "0")}-12`,
    status: index < 2 ? "В производстве" : "Завершено",
  })),
  "ural-service-liquidation": [
    {
      id: "A60-5555",
      role: "defendant",
      title: "Задолженность по аренде",
      amount: 1_200_000,
      date: "2026-01-19",
      status: "В производстве",
    },
  ],
  "smart-market-young": [],
};

export const mockFinances: Record<string, FinanceYear[]> = {
  "volga-logistics": [
    { year: 2025, revenue: 182_000_000, profit: 18_400_000 },
    { year: 2024, revenue: 164_000_000, profit: 14_900_000 },
    { year: 2023, revenue: 151_000_000, profit: 12_700_000 },
  ],
  "sever-stroy": [
    { year: 2025, revenue: 61_000_000, profit: 1_100_000 },
    { year: 2024, revenue: 78_000_000, profit: -1_800_000 },
    { year: 2023, revenue: 84_000_000, profit: 2_400_000 },
  ],
  "delta-import": [
    { year: 2025, revenue: 38_000_000, profit: -8_200_000 },
    { year: 2024, revenue: 91_000_000, profit: -4_700_000 },
    { year: 2023, revenue: 96_000_000, profit: 3_000_000 },
  ],
  "ural-service-liquidation": [
    { year: 2025, revenue: 9_000_000, profit: -3_100_000 },
    { year: 2024, revenue: 31_000_000, profit: -1_900_000 },
  ],
  "smart-market-young": [
    { year: 2026, revenue: null, profit: null },
  ],
};

export const mockEnforcement: Record<string, EnforcementCase[]> = {
  "volga-logistics": [],
  "sever-stroy": [
    {
      id: "IP-7812",
      title: "Исполнительский сбор",
      amount: 45_000,
      date: "2026-02-09",
      status: "Открыто",
    },
  ],
  "delta-import": [
    {
      id: "IP-5409",
      title: "Взыскание задолженности",
      amount: 1_450_000,
      date: "2026-04-18",
      status: "Открыто",
    },
    {
      id: "IP-5410",
      title: "Налоговая задолженность",
      amount: 620_000,
      date: "2026-04-28",
      status: "Открыто",
    },
  ],
  "ural-service-liquidation": [
    {
      id: "IP-6658",
      title: "Взыскание по исполнительному листу",
      amount: 890_000,
      date: "2026-03-11",
      status: "Открыто",
    },
  ],
  "smart-market-young": [],
};

export const mockBankruptcy: Record<string, BankruptcyInfo> = {
  "volga-logistics": { hasSigns: false, events: [] },
  "sever-stroy": { hasSigns: false, events: [] },
  "delta-import": {
    hasSigns: true,
    events: ["Сообщение кредитора о намерении обратиться с заявлением о банкротстве"],
  },
  "ural-service-liquidation": { hasSigns: false, events: [] },
  "smart-market-young": { hasSigns: false, events: [] },
};

export const mockMonitoringEvents: Record<string, MonitoringEvent[]> = {
  "volga-logistics": [
    {
      id: "ev-1",
      companyId: "volga-logistics",
      title: "Обновлена бухгалтерская отчетность",
      date: "2026-05-10",
      severity: "low",
    },
  ],
  "sever-stroy": [
    {
      id: "ev-2",
      companyId: "sever-stroy",
      title: "Появилось новое дело как ответчик",
      date: "2026-05-18",
      severity: "medium",
    },
  ],
  "delta-import": [
    {
      id: "ev-3",
      companyId: "delta-import",
      title: "Появилось новое исполнительное производство",
      date: "2026-05-19",
      severity: "high",
    },
    {
      id: "ev-4",
      companyId: "delta-import",
      title: "Сменился директор",
      date: "2026-04-29",
      severity: "medium",
    },
  ],
  "ural-service-liquidation": [
    {
      id: "ev-5",
      companyId: "ural-service-liquidation",
      title: "Начата ликвидация",
      date: "2026-05-02",
      severity: "high",
    },
  ],
  "smart-market-young": [],
};
