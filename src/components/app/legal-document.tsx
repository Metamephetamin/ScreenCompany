import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type LegalSection = {
  title: string;
  paragraphs: string[];
  items?: string[];
};

export function LegalDocument({
  title,
  subtitle,
  updatedAt,
  sections,
}: {
  title: string;
  subtitle: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          Редакция от {updatedAt}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{subtitle}</p>
      </div>

      <Card>
        <CardContent className="space-y-7 text-sm leading-6 text-zinc-700">
          {sections.map((section, index) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-950">
                {index + 1}. {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.items && (
                <ul className="list-disc space-y-2 pl-5">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/offer" className="font-medium text-zinc-700 hover:text-zinc-950">
          Оферта
        </Link>
        <Link href="/privacy" className="font-medium text-zinc-700 hover:text-zinc-950">
          Политика конфиденциальности
        </Link>
        <Link href="/personal-data" className="font-medium text-zinc-700 hover:text-zinc-950">
          Персональные данные
        </Link>
      </div>
    </div>
  );
}
