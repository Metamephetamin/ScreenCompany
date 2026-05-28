import { AlertTriangle, CheckCircle2, FileSearch, Handshake, ShieldCheck } from "lucide-react";
import { Disclaimer } from "@/components/app/disclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/server/session";

const capabilities = [
  {
    title: "Находит регистрационные данные",
    text: "Показывает название, ИНН, ОГРН, статус, дату регистрации, адрес, руководителя, ОКВЭД и уставный капитал, если данные доступны в источниках.",
  },
  {
    title: "Считает риск по понятным факторам",
    text: "Учитывает возраст компании, статус ликвидации, признаки банкротства, исполнительные производства, судебные дела, массовый адрес и финансовые сигналы.",
  },
  {
    title: "Объясняет причину оценки",
    text: "В отчете видно, какие факторы повлияли на риск-балл и почему контрагент получил низкий, средний или высокий риск.",
  },
  {
    title: "Дает рекомендации по сделке",
    text: "Помогает выбрать условия: работать стандартно, запросить документы, проверить подписанта, не давать отсрочку или работать только по предоплате.",
  },
];

const useCases = [
  "Перед авансом поставщику или подрядчику.",
  "Перед отсрочкой платежа покупателю.",
  "Перед подписанием договора с новым ООО или ИП.",
  "Перед повторной сделкой с контрагентом, по которому давно не было проверки.",
  "Для регулярного мониторинга важных компаний.",
];

export default async function AboutPage() {
  await requireCurrentUser();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">О сервисе</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-500">
          Контурагент Риск помогает быстро оценить компанию или ИП перед оплатой, отсрочкой платежа
          или заключением договора.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <FileSearch className="h-5 w-5 text-zinc-600" />
            <CardTitle>Что делает программа</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {capabilities.map((item) => (
              <div key={item.title} className="rounded-md border border-zinc-200 p-4">
                <div className="font-medium">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-zinc-600" />
            <CardTitle>Почему это полезно</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-600">
            <p>
              Проверка снижает риск работать с недействующей, проблемной или финансово нестабильной
              компанией без дополнительных условий.
            </p>
            <p>
              Отчет помогает быстрее согласовать решение внутри компании: бухгалтерии, руководителю,
              закупкам, продажам или юристу видно, какие факты требуют внимания.
            </p>
            <p>
              Рекомендации переводят риск в практические условия сделки: предоплата, отказ от отсрочки,
              запрос документов или дополнительные условия договора.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Handshake className="h-5 w-5 text-zinc-600" />
            <CardTitle>Когда использовать</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {useCases.map((item) => (
              <div key={item} className="flex gap-2 rounded-md border border-zinc-200 p-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-zinc-600" />
            <CardTitle>Что важно понимать</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-600">
            <p>
              Сервис не заменяет юридическую экспертизу договора и не гарантирует исполнение обязательств
              контрагентом.
            </p>
            <p>
              Оценка строится по открытым и подключенным источникам. Если источник временно недоступен,
              это отображается в отчете.
            </p>
            <p>
              Итоговый риск-балл нужен для принятия управленческого решения, а не для автоматического
              отказа от всех сделок с повышенным риском.
            </p>
          </CardContent>
        </Card>
      </div>

      <Disclaimer />
    </div>
  );
}
