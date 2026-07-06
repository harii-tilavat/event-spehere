import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button, Input } from "@eventsphere/ui";
import { HERO_IMAGE } from "@/lib/images";
import { HealthBadge } from "../HealthBadge/HealthBadge";
import { useHeroSection } from "./useHeroSection";

export function HeroSection() {
  const { search, setSearch, handleSubmit } = useHeroSection();

  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border">
      <img src={HERO_IMAGE} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative flex flex-col items-center gap-6 px-4 py-24 text-center sm:py-28"
      >
        <HealthBadge />
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Find your next unforgettable experience
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Concerts, conferences, comedy nights and more — discover events near you, book in seconds, and check in with a
          single scan.
        </p>
        <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, artists, cities…"
            className="h-11 bg-background/80 backdrop-blur"
            aria-label="Search events"
          />
          <Button type="submit" size="lg" className="shrink-0">
            <Search className="size-4" /> Search
          </Button>
        </form>
      </motion.div>
    </section>
  );
}
