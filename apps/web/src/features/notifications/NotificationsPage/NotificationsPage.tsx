import { Bell, CheckCheck, Mail } from "lucide-react";
import { Badge, Button, Card, CardContent, PageHeader } from "@eventsphere/ui";
import { QueryError } from "@/components";
import { formatDateTime } from "@/lib/format";
import { cn } from "@eventsphere/ui";
import { useNotificationsPage } from "./useNotificationsPage";

export function NotificationsPage() {
  const {
    notifications,
    unread,
    meta,
    isLoading,
    isError,
    error,
    refetch,
    setPage,
    isMarkingAll,
    handleMarkRead,
    handleMarkAllRead,
  } = useNotificationsPage();

  if (isError) {
    return (
      <div>
        <PageHeader title="Notifications" />
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : "You're all caught up"}
        actions={
          unread > 0 ? (
            <Button variant="outline" size="sm" disabled={isMarkingAll} onClick={handleMarkAllRead}>
              <CheckCheck className="size-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl border bg-card" />
          ))}
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <Bell className="size-8" />
            <p>No notifications yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={cn("cursor-pointer transition-colors", !n.isRead && "border-primary/40 bg-secondary/40")}
            onClick={() => !n.isRead && handleMarkRead(n.id)}
          >
            <CardContent className="flex items-start gap-3 p-4">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.isRead && <Badge>New</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage(meta.page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
