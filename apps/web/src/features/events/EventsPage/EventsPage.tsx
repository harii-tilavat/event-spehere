import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import {
  Button,
  Input,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@eventsphere/ui";
import { QueryError } from "@/components";
import { EventCard } from "./components";
import { useEventsPage } from "./useEventsPage";

export function EventsPage() {
  const {
    events,
    meta,
    isLoading,
    isError,
    error,
    refetch,
    categories,
    search,
    categoryId,
    city,
    allFilter,
    setPage,
    handleSearchChange,
    handleCategoryChange,
    handleCityChange,
  } = useEventsPage();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageHeader title="Browse events" description="Discover published events by category, city, and date" />

      <div className="mb-6 flex flex-wrap gap-2">
        <Input
          placeholder="Search events…"
          className="max-w-xs"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Select value={categoryId} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allFilter}>All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="City" className="w-36" value={city} onChange={(e) => handleCityChange(e.target.value)} />
      </div>

      {isError ? (
        <QueryError error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="h-72 animate-pulse rounded-2xl border bg-card" />
              ))}
            {!isLoading && events.map((event) => <EventCard key={event.id} event={event} />)}
          </div>

          {!isLoading && events.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
              <SearchX className="size-8" />
              <p>No events match your filters.</p>
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <Button variant="outline" size="icon" disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <span>
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage(meta.page + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
