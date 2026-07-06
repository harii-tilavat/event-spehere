"use strict";

/** Base catalog for a fresh install: categories + venues. Idempotent. */
const CATEGORIES = [
  { name: "Music", description: "Concerts, gigs, and live music experiences" },
  { name: "Technology", description: "Conferences, meetups, and hackathons" },
  { name: "Business", description: "Summits, networking, and pitch events" },
  { name: "Sports", description: "Matches, marathons, and fitness events" },
  { name: "Arts & Theatre", description: "Plays, exhibitions, and performances" },
  { name: "Food & Drink", description: "Festivals, tastings, and pop-ups" },
  { name: "Education", description: "Workshops, seminars, and training" },
  { name: "Comedy", description: "Stand-up shows and improv nights" },
];

const VENUES = [
  {
    name: "Phoenix Arena",
    address_line: "142 MG Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    capacity: 500,
    facilities: JSON.stringify(["Parking", "WiFi", "Food court", "Wheelchair access"]),
  },
  {
    name: "Nexus Convention Centre",
    address_line: "Plot 7, HITEC City",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500081",
    capacity: 1200,
    facilities: JSON.stringify(["Parking", "WiFi", "AV equipment", "Catering"]),
  },
  {
    name: "Marine Drive Amphitheatre",
    address_line: "Netaji Subhash Chandra Bose Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400020",
    capacity: 800,
    facilities: JSON.stringify(["Open air", "Food stalls", "Wheelchair access"]),
  },
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/[\s_-]+/g, "-");
}

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [existingCategories] = await queryInterface.sequelize.query("SELECT name FROM categories");
    const existingNames = new Set(existingCategories.map((c) => c.name));
    const newCategories = CATEGORIES.filter((c) => !existingNames.has(c.name)).map((c) => ({
      name: c.name,
      slug: slugify(c.name),
      description: c.description,
      is_active: true,
      created_at: now,
      updated_at: now,
    }));
    if (newCategories.length) await queryInterface.bulkInsert("categories", newCategories);

    const [existingVenues] = await queryInterface.sequelize.query("SELECT name FROM venues");
    const existingVenueNames = new Set(existingVenues.map((v) => v.name));
    const newVenues = VENUES.filter((v) => !existingVenueNames.has(v.name)).map((v) => ({
      ...v,
      created_at: now,
      updated_at: now,
    }));
    if (newVenues.length) await queryInterface.bulkInsert("venues", newVenues);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("categories", { name: CATEGORIES.map((c) => c.name) });
    await queryInterface.bulkDelete("venues", { name: VENUES.map((v) => v.name) });
  },
};
