import heroImage from "@/assets/images/hero.jpg";
import event1 from "@/assets/images/events/event-1.jpg";
import event2 from "@/assets/images/events/event-2.jpg";
import event3 from "@/assets/images/events/event-3.jpg";
import event4 from "@/assets/images/events/event-4.jpg";
import event5 from "@/assets/images/events/event-5.jpg";
import event6 from "@/assets/images/events/event-6.jpg";
import music from "@/assets/images/categories/music.jpg";
import technology from "@/assets/images/categories/technology.jpg";
import business from "@/assets/images/categories/business.jpg";
import sports from "@/assets/images/categories/sports.jpg";
import artsTheatre from "@/assets/images/categories/arts-theatre.jpg";
import foodDrink from "@/assets/images/categories/food-drink.jpg";
import education from "@/assets/images/categories/education.jpg";
import comedy from "@/assets/images/categories/comedy.jpg";

export const HERO_IMAGE = heroImage;

const EVENT_IMAGES = [event1, event2, event3, event4, event5, event6];

const CATEGORY_IMAGES: Record<string, string> = {
  music,
  technology,
  business,
  sports,
  "arts-theatre": artsTheatre,
  "food-drink": foodDrink,
  education,
  comedy,
};

/** Deterministic real photo for events without an uploaded banner. */
export function eventFallbackImage(eventId: number): string {
  return EVENT_IMAGES[eventId % EVENT_IMAGES.length];
}

/** Uploaded image if present, otherwise a real photo matched by category slug. */
export function categoryImage(slug: string, uploadedUrl?: string | null): string {
  return uploadedUrl ?? CATEGORY_IMAGES[slug] ?? eventFallbackImage(slug.length);
}

function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Uploaded banner if present; otherwise a real photo matched to the event's
 * category, falling back to a deterministic generic photo by event id.
 */
export function eventImage(event: { id: number; bannerUrl: string | null; categoryName?: string }): string {
  if (event.bannerUrl) return event.bannerUrl;
  if (event.categoryName) {
    const matched = CATEGORY_IMAGES[categorySlug(event.categoryName)];
    if (matched) return matched;
  }
  return eventFallbackImage(event.id);
}
