import { Card, CardContent } from "@eventsphere/ui";
import { HOME_HIGHLIGHTS } from "../../const";

export function HowItWorks() {
  return (
    <section className="py-12">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight">How EventSphere works</h2>
        <p className="mt-1 text-sm text-muted-foreground">Three steps from discovery to the door</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {HOME_HIGHLIGHTS.map(({ icon: Icon, title, body }, index) => (
          <Card key={title} className="h-full">
            <CardContent className="flex h-full flex-col gap-3 p-6">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                <Icon className="size-5 text-primary" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Step {index + 1}</p>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
