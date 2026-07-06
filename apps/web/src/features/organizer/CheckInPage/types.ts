import type { CheckInResultDto } from "@/api";

export interface LastCheckInFeedback {
  kind: "success" | "error";
  message: string;
  result?: CheckInResultDto;
}
