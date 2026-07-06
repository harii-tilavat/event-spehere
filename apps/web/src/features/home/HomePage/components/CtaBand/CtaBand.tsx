import { Link } from "react-router-dom";
import { Button } from "@eventsphere/ui";
import { useAuth } from "@/context/AuthContext";

export function CtaBand() {
  const { user } = useAuth();

  return (
    <section className="my-12 overflow-hidden rounded-3xl border bg-secondary/40">
      <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
        <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
          Hosting an event? Reach thousands of attendees.
        </h2>
        <p className="max-w-lg text-sm text-muted-foreground">
          Create your event, set ticket types, and start selling in minutes — with QR check-in and live revenue
          analytics built in.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {user ? (
            <Button asChild size="lg">
              <Link to={user.role === "attendee" ? "/events" : "/organizer/events/new"}>
                {user.role === "attendee" ? "Browse events" : "Create an event"}
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/register">Become an organizer</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/events">Browse events</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
