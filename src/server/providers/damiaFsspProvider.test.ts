import { describe, expect, it } from "vitest";
import { mapDamiaFsspProceedings } from "./damiaFsspProvider";

describe("mapDamiaFsspProceedings", () => {
  it("maps DaMIA ungrouped legal entity proceedings into enforcement cases", () => {
    const result = mapDamiaFsspProceedings({
      result: [
        {
          "РегНомер": "12345/26/77001-ИП",
          "Дата": "2026-01-15",
          "Предмет": "Задолженность по договору",
          "Сумма": 150000.5,
          "Остаток": 75000,
          "Статус": "Не завершено",
        },
      ],
    });

    expect(result).toEqual([
      {
        id: "12345/26/77001-ИП",
        title: "Задолженность по договору",
        amount: 75000,
        date: "2026-01-15",
        status: "Не завершено",
      },
    ]);
  });

  it("maps DaMIA nested inn and registration-number response", () => {
    const result = mapDamiaFsspProceedings({
      "7721503606": {
        "1641869/25/77056-ИП": {
          "Дата": "19.11.2025",
          "Предмет": "Страховые взносы, включая пени",
          "Сумма": 1000,
          "Остаток": 250,
          "Статус": "Погашено",
        },
      },
    });

    expect(result).toEqual([
      {
        id: "1641869/25/77056-ИП",
        title: "Страховые взносы, включая пени",
        amount: 250,
        date: "2025-11-19",
        status: "Погашено",
      },
    ]);
  });
});
