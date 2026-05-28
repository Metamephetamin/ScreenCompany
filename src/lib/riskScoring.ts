import type { RiskLevel, RiskReason, RiskResult } from "@/lib/types";

export type RiskSignals = {
  status: string;
  bankruptcy: boolean;
  enforcementProceedings: number;
  defendantCourtCases: number;
  ageMonths: number;
  authorizedCapital: number | null;
  negativeProfitYears: number;
  revenueDropPercent: number;
  massAddress: boolean;
  frequentDirectorChanges: boolean;
};

const levelForScore = (score: number): RiskLevel => {
  if (score <= 25) return "low";
  if (score <= 60) return "medium";
  return "high";
};

export function calculateRiskScore(signals: RiskSignals): RiskResult {
  const reasons: RiskReason[] = [];

  const add = (reason: RiskReason) => reasons.push(reason);

  if (signals.status === "LIQUIDATION") {
    add({
      code: "liquidation",
      title: "Компания в ликвидации",
      description: "В ЕГРЮЛ указан статус ликвидации. Аванс и отсрочка платежа несут высокий риск.",
      points: 40,
    });
  }

  if (signals.status === "INACTIVE") {
    add({
      code: "inactive",
      title: "Недействующий статус",
      description: "Контрагент не является действующим по данным реестра.",
      points: 40,
    });
  }

  if (signals.bankruptcy) {
    add({
      code: "bankruptcy",
      title: "Признаки банкротства",
      description: "Есть сообщения или признаки процедур, связанных с банкротством.",
      points: 35,
    });
  }

  if (signals.enforcementProceedings > 0) {
    add({
      code: "enforcement",
      title: "Исполнительные производства",
      description: `Найдено производств: ${signals.enforcementProceedings}. Это может указывать на просроченные обязательства.`,
      points: 20,
    });
  }

  if (signals.defendantCourtCases > 5) {
    add({
      code: "court_defendant",
      title: "Много судебных дел как ответчик",
      description: `Дел в роли ответчика: ${signals.defendantCourtCases}. Требуется анализ предмета споров.`,
      points: 20,
    });
  }

  if (signals.ageMonths < 12) {
    add({
      code: "young_company",
      title: "Компания моложе 1 года",
      description: "По молодой компании обычно недостаточно истории исполнения обязательств и отчетности.",
      points: 15,
    });
  }

  if (signals.authorizedCapital !== null && signals.authorizedCapital <= 10_000) {
    add({
      code: "minimal_capital",
      title: "Минимальный уставный капитал",
      description: "Уставный капитал 10 000 ₽ или ниже усиливает риск при авансе и отсрочке.",
      points: 10,
    });
  }

  if (signals.negativeProfitYears >= 2) {
    add({
      code: "negative_profit",
      title: "Убытки два года подряд",
      description: "Финансовая отчетность показывает отрицательную прибыль два года подряд.",
      points: 15,
    });
  }

  if (signals.revenueDropPercent > 50) {
    add({
      code: "revenue_drop",
      title: "Выручка упала более чем на 50%",
      description: `Падение выручки: ${signals.revenueDropPercent}%. Возможны проблемы с операционной деятельностью.`,
      points: 15,
    });
  }

  if (signals.massAddress) {
    add({
      code: "mass_address",
      title: "Массовый адрес",
      description: "Адрес используется большим количеством организаций.",
      points: 15,
    });
  }

  if (signals.frequentDirectorChanges) {
    add({
      code: "director_changes",
      title: "Частая смена руководителя",
      description: "Частая смена директора может усложнить проверку полномочий и ответственности.",
      points: 10,
    });
  }

  const score = Math.min(
    100,
    reasons.reduce((sum, reason) => sum + reason.points, 0),
  );
  const level = levelForScore(score);

  return {
    score,
    level,
    reasons,
    recommendations: buildRecommendations(level, reasons),
  };
}

function buildRecommendations(level: RiskLevel, reasons: RiskReason[]) {
  const hasCritical = reasons.some((reason) =>
    ["liquidation", "inactive", "bankruptcy"].includes(reason.code),
  );

  if (level === "low") {
    return [
      "Можно работать на стандартных условиях.",
      "Проверить полномочия подписанта перед заключением договора.",
      "Добавить базовые условия о сроках, качестве и ответственности.",
    ];
  }

  if (level === "medium") {
    return [
      "Работать только с частичной или полной предоплатой.",
      "Не давать длительную отсрочку платежа без обеспечения.",
      "Запросить дополнительные документы и свежую выписку.",
      "Добавить в договор право приостановить поставку при новых рисках.",
    ];
  }

  return [
    hasCritical ? "Рекомендуется отказаться от сделки или провести юридическую проверку." : "Работать только по 100% предоплате.",
    "Не давать отсрочку платежа.",
    "Проверить полномочия подписанта и бенефициарную структуру.",
    "Добавить жесткие условия расторжения, неустойки и обеспечения.",
  ];
}

export function monthsSince(date: string, now = new Date()) {
  const registeredAt = new Date(date);
  return (
    (now.getFullYear() - registeredAt.getFullYear()) * 12 +
    now.getMonth() -
    registeredAt.getMonth()
  );
}

export function revenueDropPercent(finances: { revenue: number | null }[]) {
  const valid = finances.filter((item) => item.revenue !== null) as { revenue: number }[];
  if (valid.length < 2) return 0;
  const [latest, previous] = valid;
  if (!previous.revenue) return 0;
  return Math.max(0, Math.round(((previous.revenue - latest.revenue) / previous.revenue) * 100));
}

export function negativeProfitYears(finances: { profit: number | null }[]) {
  return finances.filter((item) => item.profit !== null && item.profit < 0).length;
}
