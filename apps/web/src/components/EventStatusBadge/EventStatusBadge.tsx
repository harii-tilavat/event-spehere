import { Badge } from "@eventsphere/ui";
import type { EventStatusBadgeProps } from "./types";

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  switch (status) {
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "pending_approval":
      return (
        <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
          Pending approval
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "published":
      return <Badge variant="success">Published</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "completed":
      return <Badge variant="secondary">Completed</Badge>;
  }
}
