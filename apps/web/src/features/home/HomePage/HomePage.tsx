import { motion } from "framer-motion";
import { Card, CardContent } from "@eventsphere/ui";
import { HOME_HIGHLIGHTS } from "./const";
import { HealthBadge } from "./components";

export function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <section className="flex flex-col items-center gap-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-6"
        >
          <HealthBadge />
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Every event, from creation to check-in
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            EventSphere is a full-stack event booking and management platform for organizers,
            attendees, and administrators.
          </p>
        </motion.div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-3">
        {HOME_HIGHLIGHTS.map(({ icon: Icon, title, body }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 * (index + 1) }}
          >
            <Card className="h-full">
              <CardContent className="flex h-full flex-col gap-3 p-6">
                <Icon className="size-6 text-primary" />
                <h2 className="font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
