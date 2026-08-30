import "server-only";

import { guests, leaderSeed, missions, seedPosts } from "@/lib/data/wedding-data";

// Temporary development adapter. Replace these functions with database queries
// when DATABASE_URL is configured. Keeping all reads/writes behind this module
// means the UI and API routes do not need to change when the database is added.
let demoPosts = [...seedPosts];

export async function searchGuests(query = "") {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return guests;
  return guests.filter((guest) => guest.name.toLowerCase().includes(normalized));
}

export async function getMissions() {
  return missions;
}

export async function getWallPosts() {
  return demoPosts;
}

export async function createWallPost(input) {
  const post = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  demoPosts = [post, ...demoPosts];
  return post;
}

export async function getLeaderboard() {
  return leaderSeed;
}
