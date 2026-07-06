import { Download } from "lucide-react";
import { Button, Card, CardContent, FormField, Input, PageHeader } from "@eventsphere/ui";
import { REPORTS } from "./const";
import { useReportsPage } from "./useReportsPage";

export function ReportsPage() {
  const { from, setFrom, to, setTo, downloading, handleDownload } = useReportsPage();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Reports" description="Export CSV reports for your records or spreadsheets" />

      <div className="mb-6 flex flex-wrap gap-3">
        <FormField label="From" htmlFor="r-from" hint="Optional">
          <Input id="r-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-44" />
        </FormField>
        <FormField label="To" htmlFor="r-to" hint="Optional">
          <Input id="r-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-44" />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {REPORTS.map(({ kind, title, description, icon: Icon }) => (
          <Card key={kind}>
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <Icon className="size-6 text-primary" />
              <div className="flex-1">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              </div>
              <Button variant="outline" size="sm" disabled={downloading !== null} onClick={() => handleDownload(kind)}>
                <Download className="size-4" /> {downloading === kind ? "Preparing…" : "Download CSV"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
