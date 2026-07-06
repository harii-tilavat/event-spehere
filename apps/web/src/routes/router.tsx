import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { RequireAuth } from "@/components/shared/RequireAuth";
import { HomePage } from "@/features/home/pages/HomePage";
import { NotFoundPage } from "@/components/shared/NotFoundPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";
import { DashboardHomePage } from "@/features/dashboard/pages/DashboardHomePage";

/** Route map per docs/06 §3. */
export const router = createBrowserRouter([
  // Standalone auth screens
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },

  // Public shell
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
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
    children: [{ index: true, element: <DashboardHomePage /> }],
  },

  // Organizer dashboard
  {
    path: "/organizer",
    element: (
      <RequireAuth roles={["organizer", "super_admin"]}>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [{ index: true, element: <DashboardHomePage /> }],
  },

  // Admin dashboard
  {
    path: "/admin",
    element: (
      <RequireAuth roles={["super_admin"]}>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [{ index: true, element: <DashboardHomePage /> }],
  },
]);
