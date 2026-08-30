const STORAGE_KEY = "nm-wedding-game";

export function loadProgress() {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveProgress(progress) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage can be unavailable in private browsing; the game still works in memory.
  }
}
