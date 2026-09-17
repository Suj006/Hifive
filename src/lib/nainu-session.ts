// Tracks whether Nainu has already auto-greeted during this browser session
// (from login until the tab is closed, or the person logs in again). A
// plain in-memory module flag is enough — it only needs to survive
// client-side navigation within the same page load (e.g. clicking between
// Dashboard and other pages), not a hard refresh or a new tab, and
// resetNainuSession() explicitly re-arms it on every successful login.
let greetedThisSession = false;

export function hasGreetedThisSession(): boolean {
  return greetedThisSession;
}

export function markGreetedThisSession(): void {
  greetedThisSession = true;
}

export function resetNainuSession(): void {
  greetedThisSession = false;
}
