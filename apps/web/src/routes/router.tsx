import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout/PublicLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout/DashboardLayout";
import { NotFound, RequireAuth, RouteError } from "@/components";
import { HomePage } from "@/features/home/HomePage/HomePage";
import { LoginPage } from "@/features/auth/pages/LoginPage/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage/ResetPasswordPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage/VerifyEmailPage";
import { DashboardHomePage } from "@/features/dashboard/DashboardHomePage/DashboardHomePage";
import { CategoriesPage } from "@/features/admin/CategoriesPage/CategoriesPage";
import { VenuesPage } from "@/features/admin/VenuesPage/VenuesPage";
import { UsersPage } from "@/features/admin/UsersPage/UsersPage";
import { OrganizersPage } from "@/features/admin/OrganizersPage/OrganizersPage";
import { AdminEventsPage } from "@/features/admin/AdminEventsPage/AdminEventsPage";
import { EventsPage } from "@/features/events/EventsPage/EventsPage";
import { EventDetailPage } from "@/features/events/EventDetailPage/EventDetailPage";
import { OrganizerEventsPage } from "@/features/organizer/OrganizerEventsPage/OrganizerEventsPage";
import { EventEditorPage } from "@/features/organizer/EventEditorPage/EventEditorPage";
import { BookingCheckoutPage } from "@/features/bookings/BookingCheckoutPage/BookingCheckoutPage";
import { CheckInPage } from "@/features/organizer/CheckInPage/CheckInPage";
import { ReportsPage } from "@/features/reports/ReportsPage/ReportsPage";
import { AdminBookingsPage } from "@/features/admin/AdminBookingsPage/AdminBookingsPage";
import { AdminPaymentsPage } from "@/features/admin/AdminPaymentsPage/AdminPaymentsPage";
import { MyBookingsPage } from "@/features/bookings/MyBookingsPage/MyBookingsPage";
import { BookingDetailPage } from "@/features/bookings/BookingDetailPage/BookingDetailPage";

/** Route map per docs/06 §3. */
export const router = createBrowserRouter([
  // Standalone auth screens
  { path: "/login", element: <LoginPage />, errorElement: <RouteError /> },
  { path: "/register", element: <RegisterPage />, errorElement: <RouteError /> },
  { path: "/forgot-password", element: <ForgotPasswordPage />, errorElement: <RouteError /> },
  { path: "/reset-password", element: <ResetPasswordPage />, errorElement: <RouteError /> },
  { path: "/verify-email", element: <VerifyEmailPage />, errorElement: <RouteError /> },

  // Public shell
  {
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "events", element: <EventsPage /> },
      { path: "events/:slug", element: <EventDetailPage /> },
      {
        path: "events/:slug/book",
        element: (
          <RequireAuth roles={["attendee"]}>
            <BookingCheckoutPage />
          </RequireAuth>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },

  // Attendee dashboard
  {
    path: "/account",
    element: (
      <RequireAuth roles={["attendee"]}>
        <DashboardLayout />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: "bookings", element: <MyBookingsPage /> },
      { path: "bookings/:id", element: <BookingDetailPage /> },
    ],
  },

  // Organizer dashboard
  {
    path: "/organizer",
    element: (
      <RequireAuth roles={["organizer", "super_admin"]}>
        <DashboardLayout />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: "events", element: <OrganizerEventsPage /> },
      { path: "events/new", element: <EventEditorPage /> },
      { path: "events/:slug/edit", element: <EventEditorPage /> },
      { path: "check-in", element: <CheckInPage /> },
      { path: "reports", element: <ReportsPage /> },
    ],
  },

  // Admin dashboard
  {
    path: "/admin",
    element: (
      <RequireAuth roles={["super_admin"]}>
        <DashboardLayout />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "venues", element: <VenuesPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "organizers", element: <OrganizersPage /> },
      { path: "approvals", element: <AdminEventsPage mode="approvals" /> },
      { path: "events", element: <AdminEventsPage mode="all" /> },
      { path: "bookings", element: <AdminBookingsPage /> },
      { path: "payments", element: <AdminPaymentsPage /> },
      { path: "reports", element: <ReportsPage /> },
    ],
  },
]);
