import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-32 text-center">
      <p className="text-6xl font-bold tracking-tight">404</p>
      <p className="text-muted-foreground">This page does not exist.</p>
      <Button asChild variant="outline">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
