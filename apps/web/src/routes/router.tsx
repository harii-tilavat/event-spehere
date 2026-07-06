import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { HomePage } from "@/features/home/pages/HomePage";
import { NotFoundPage } from "@/components/shared/NotFoundPage";

/** Route map per docs/06 §3 — public shell only in Phase 0; role layouts arrive in Phase 1. */
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
