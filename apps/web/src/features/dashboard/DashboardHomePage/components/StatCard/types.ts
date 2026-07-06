import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}
