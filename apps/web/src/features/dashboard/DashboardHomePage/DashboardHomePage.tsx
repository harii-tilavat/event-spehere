import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge, Card, CardContent, PageHeader } from "@eventsphere/ui";
import { useDashboardHomePage } from "./useDashboardHomePage";

export function DashboardHomePage() {
  const { user, quickLinks, isPendingOrganizer, organizerStatus, rejectionReason } = useDashboardHomePage();
  if (!user) return null;

  return (
    <div>
      <PageHeader title={`Welcome, ${user.name}`} description="Here's your EventSphere workspace" />

      {isPendingOrganizer && (
        <Card className="mb-6 border-yellow-500/30">
          <CardContent className="flex flex-wrap items-center gap-2 p-4 text-sm">
            <Badge variant="outline" className="border-yellow-500/50 capitalize text-yellow-500">
              {organizerStatus ?? "pending"}
            </Badge>
            {organizerStatus === "rejected" ? (
              <span>Your organizer application was rejected{rejectionReason ? `: ${rejectionReason}` : ""}.</span>
            ) : (
              <span>Your organizer application is awaiting admin approval — event creation unlocks once approved.</span>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-colors group-hover:border-ring">
              <CardContent className="flex items-center justify-between p-5">
                <span className="flex items-center gap-3 text-sm font-medium">
                  <Icon className="size-5 text-primary" /> {label}
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
