import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dashboardNav } from "@/layouts/dashboard-nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Shared dashboard landing (all roles) — quick links + account status.
 * Role-specific stats/charts are added by the dashboard feature (docs/09 Phase 6).
 */
export function DashboardHomePage() {
  const { user } = useAuth();
  if (!user) return null;

  const links = dashboardNav[user.role].filter((i) => !i.end);
  const pendingOrganizer = user.role === "organizer" && user.organizerProfile?.approvalStatus !== "approved";

  return (
    <div>
      <PageHeader title={`Welcome, ${user.name}`} description="Here's your EventSphere workspace" />

      {pendingOrganizer && (
        <Card className="mb-6 border-yellow-500/30">
          <CardContent className="flex flex-wrap items-center gap-2 p-4 text-sm">
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 capitalize">
              {user.organizerProfile?.approvalStatus ?? "pending"}
            </Badge>
            {user.organizerProfile?.approvalStatus === "rejected" ? (
              <span>
                Your organizer application was rejected
                {user.organizerProfile?.rejectionReason ? `: ${user.organizerProfile.rejectionReason}` : ""}.
              </span>
            ) : (
              <span>Your organizer application is awaiting admin approval — event creation unlocks once approved.</span>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ to, label, icon: Icon }) => (
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
