import { Link } from "react-router-dom";
import { categoryImage } from "@/lib/images";
import type { CategoryStripProps } from "./types";

export function CategoryStrip({ categories, isLoading }: CategoryStripProps) {
  return (
    <section className="py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Browse by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">Jump straight to what you're into</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl border bg-card" />
          ))}
        {!isLoading &&
          categories.map((category) => (
            <Link
              key={category.id}
              to={`/events?categoryId=${category.id}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border"
            >
              <img
                src={categoryImage(category.slug, category.imageUrl)}
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
              <span className="absolute inset-x-3 bottom-3 font-semibold text-white">{category.name}</span>
            </Link>
          ))}
      </div>
    </section>
  );
}
