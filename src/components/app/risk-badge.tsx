import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/lib/types";
import { riskClasses, riskLabel } from "@/lib/utils";

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <Badge className={riskClasses(level)}>{riskLabel(level)}</Badge>;
}
