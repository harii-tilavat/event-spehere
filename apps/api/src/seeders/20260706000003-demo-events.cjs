"use strict";

const bcrypt = require("bcryptjs");

/**
 * Demo events for a meaningful catalog: 5 published (one featured) + 1 pending
 * approval, spread across categories/venues with future dates and ticket types.
 * Owned by a seeded demo organizer. Idempotent (keyed by slug).
 */
const DEMO_ORGANIZER = {
  email: "demo.organizer@eventsphere.local",
  password: "Organizer@123",
  name: "Aarav Mehta",
  organization: "Pulse Productions",
};

const DAY = 24 * 3600 * 1000;

const EVENTS = [
  {
    slug: "neon-nights-edm-festival",
    title: "Neon Nights EDM Festival",
    category: "Music",
    venue: "Marine Drive Amphitheatre",
    daysFromNow: 12,
    durationHours: 6,
    capacity: 800,
    featured: true,
    status: "published",
    description:
      "An open-air electronic music festival by the sea. Three headline DJs, immersive light shows, food trucks, and a sunset-to-midnight set list that keeps the energy high. Carry a valid ID; gates open two hours before the first act.",
    tickets: [
      { name: "Early Bird", price: 79900, qty: 300, max: 6 },
      { name: "VIP Deck", price: 249900, qty: 100, max: 4 },
    ],
  },
  {
    slug: "devconf-india-2026",
    title: "DevConf India 2026",
    category: "Technology",
    venue: "Nexus Convention Centre",
    daysFromNow: 25,
    durationHours: 9,
    capacity: 1000,
    featured: false,
    status: "published",
    description:
      "A full-day developer conference with four tracks: AI engineering, web platform, cloud-native infrastructure, and open source. Includes hands-on workshops, a hallway hiring track, lunch, and evening networking. Bring your laptop for the workshop sessions.",
    tickets: [
      { name: "Standard", price: 149900, qty: 700, max: 5 },
      { name: "Workshop Bundle", price: 299900, qty: 200, max: 2 },
    ],
  },
  {
    slug: "startup-founders-mixer",
    title: "Startup Founders Mixer",
    category: "Business",
    venue: "Phoenix Arena",
    daysFromNow: 8,
    durationHours: 3,
    capacity: 200,
    featured: false,
    status: "published",
    description:
      "An evening of structured networking for founders, operators, and angel investors. Includes two lightning-talk sessions, curated round tables by industry, and an open bar hour. Come with a one-line pitch ready.",
    tickets: [
      { name: "Founder Pass", price: 99900, qty: 150, max: 2 },
      { name: "Investor Pass", price: 0, qty: 50, max: 1 },
    ],
  },
  {
    slug: "city-marathon-halfathon",
    title: "City Marathon & Halfathon",
    category: "Sports",
    venue: "Marine Drive Amphitheatre",
    daysFromNow: 40,
    durationHours: 7,
    capacity: 800,
    featured: false,
    status: "published",
    description:
      "Flag off at dawn for the 21K halfathon or the 10K city run along the sea-facing promenade. Chip timing, hydration stations every 2 km, finisher medals, and a recovery zone with physios. Bibs are collected at the venue a day before the race.",
    tickets: [
      { name: "10K Run", price: 59900, qty: 500, max: 4 },
      { name: "21K Halfathon", price: 89900, qty: 300, max: 2 },
    ],
  },
  {
    slug: "standup-saturday-live",
    title: "Standup Saturday Live",
    category: "Comedy",
    venue: "Phoenix Arena",
    daysFromNow: 5,
    durationHours: 2,
    capacity: 400,
    featured: false,
    status: "published",
    description:
      "Four of the country's fastest-rising comics in one lineup, hosted by a surprise headliner. Doors open at 7 PM, show starts 8 PM sharp — latecomers are seated during breaks (and occasionally roasted). Age 16+.",
    tickets: [
      { name: "Silver", price: 49900, qty: 300, max: 6 },
      { name: "Front Row", price: 99900, qty: 60, max: 2 },
    ],
  },
  {
    slug: "masterclass-street-photography",
    title: "Masterclass: Street Photography",
    category: "Education",
    venue: "Nexus Convention Centre",
    daysFromNow: 18,
    durationHours: 5,
    capacity: 120,
    featured: false,
    status: "pending_approval",
    description:
      "A hands-on masterclass covering composition, light, and storytelling on the street, followed by a guided photo walk and portfolio critique. Any camera works — including your phone. Limited to a small batch for individual feedback.",
    tickets: [{ name: "Masterclass Seat", price: 199900, qty: 120, max: 2 }],
  },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const sql = queryInterface.sequelize;

    // --- demo organizer (approved + verified) ---
    let [[organizer]] = await sql.query("SELECT id FROM users WHERE email = :email", {
      replacements: { email: DEMO_ORGANIZER.email },
    });
    if (!organizer) {
      await queryInterface.bulkInsert("users", [
        {
          name: DEMO_ORGANIZER.name,
          email: DEMO_ORGANIZER.email,
          password_hash: bcrypt.hashSync(DEMO_ORGANIZER.password, 12),
          role: "organizer",
          status: "active",
          is_email_verified: true,
          created_at: now,
          updated_at: now,
        },
      ]);
      [[organizer]] = await sql.query("SELECT id FROM users WHERE email = :email", {
        replacements: { email: DEMO_ORGANIZER.email },
      });
      await queryInterface.bulkInsert("organizer_profiles", [
        {
          user_id: organizer.id,
          organization_name: DEMO_ORGANIZER.organization,
          description: "Live music, conferences, and community events across India.",
          approval_status: "approved",
          approved_at: now,
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    // --- lookups ---
    const [categories] = await sql.query("SELECT id, name FROM categories");
    const [venues] = await sql.query("SELECT id, name FROM venues");
    const categoryId = (name) => categories.find((c) => c.name === name)?.id;
    const venueId = (name) => venues.find((v) => v.name === name)?.id;

    for (const e of EVENTS) {
      const [[exists]] = await sql.query("SELECT id FROM events WHERE slug = :slug", {
        replacements: { slug: e.slug },
      });
      if (exists) continue;
      const catId = categoryId(e.category);
      const venId = venueId(e.venue);
      if (!catId || !venId) continue; // base-catalog seeder must run first

      const start = new Date(now.getTime() + e.daysFromNow * DAY);
      start.setHours(18, 0, 0, 0);
      const end = new Date(start.getTime() + e.durationHours * 3600 * 1000);
      const deadline = new Date(start.getTime() - 6 * 3600 * 1000);

      await queryInterface.bulkInsert("events", [
        {
          organizer_id: organizer.id,
          category_id: catId,
          venue_id: venId,
          title: e.title,
          slug: e.slug,
          description: e.description,
          status: e.status,
          start_time: start,
          end_time: end,
          registration_deadline: deadline,
          capacity: e.capacity,
          is_featured: e.featured,
          published_at: e.status === "published" ? now : null,
          created_at: now,
          updated_at: now,
        },
      ]);
      const [[event]] = await sql.query("SELECT id FROM events WHERE slug = :slug", {
        replacements: { slug: e.slug },
      });

      await queryInterface.bulkInsert(
        "ticket_types",
        e.tickets.map((t) => ({
          event_id: event.id,
          name: t.name,
          price_paise: t.price,
          quantity_total: t.qty,
          quantity_sold: 0,
          max_per_booking: t.max,
          is_active: true,
          created_at: now,
          updated_at: now,
        })),
      );
    }
  },

  async down(queryInterface) {
    const sql = queryInterface.sequelize;
    const slugs = EVENTS.map((e) => e.slug);
    const [events] = await sql.query("SELECT id FROM events WHERE slug IN (:slugs)", { replacements: { slugs } });
    const ids = events.map((e) => e.id);
    if (ids.length) {
      await queryInterface.bulkDelete("ticket_types", { event_id: ids });
      await queryInterface.bulkDelete("events", { id: ids });
    }
    await queryInterface.bulkDelete("organizer_profiles", { organization_name: DEMO_ORGANIZER.organization });
    await queryInterface.bulkDelete("users", { email: DEMO_ORGANIZER.email });
  },
};
