import {
  BarChart3,
  Building2,
  CalendarDays,
  CalendarPlus,
  FolderKanban,
  Heart,
  LayoutDashboard,
  ScanLine,
  Ticket,
  UserRound,
  Users,
  Wallet,
  BadgeCheck,
  Bell,
} from "lucide-react";
import type { Role } from "@eventsphere/shared";

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

/** Sidebar nav per role (docs/06 §2) — routes and nav never drift because both read this config. */
export const dashboardNav: Record<Role, NavItem[]> = {
  super_admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/approvals", label: "Event approvals", icon: BadgeCheck },
    { to: "/admin/events", label: "All events", icon: CalendarDays },
    { to: "/admin/organizers", label: "Organizers", icon: Building2 },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/categories", label: "Categories", icon: FolderKanban },
    { to: "/admin/venues", label: "Venues", icon: Building2 },
    { to: "/admin/bookings", label: "Bookings", icon: Ticket },
    { to: "/admin/payments", label: "Payments", icon: Wallet },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/profile", label: "Profile", icon: UserRound },
  ],
  organizer: [
    { to: "/organizer", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/organizer/events", label: "My events", icon: CalendarDays },
    { to: "/organizer/events/new", label: "Create event", icon: CalendarPlus },
    { to: "/organizer/check-in", label: "Check-in", icon: ScanLine },
    { to: "/organizer/reports", label: "Reports", icon: BarChart3 },
    { to: "/organizer/profile", label: "Profile", icon: UserRound },
  ],
  attendee: [
    { to: "/account", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/account/bookings", label: "My bookings", icon: Ticket },
    { to: "/account/wishlist", label: "Wishlist", icon: Heart },
    { to: "/account/notifications", label: "Notifications", icon: Bell },
    { to: "/account/profile", label: "Profile", icon: UserRound },
  ],
};
