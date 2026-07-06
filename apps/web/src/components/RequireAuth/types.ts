import type { ReactNode } from "react";
import type { Role } from "@eventsphere/shared";

export interface RequireAuthProps {
  roles?: Role[];
  children: ReactNode;
}
