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
});
