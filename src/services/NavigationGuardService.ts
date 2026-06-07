// Prevents double-tap navigation. Locks for 500ms after any navigation action.
let locked = false;

export function guardNavigation(action: () => void): void {
  if (locked) return;
  locked = true;
  action();
  setTimeout(() => { locked = false; }, 500);
}

export function isNavigationLocked(): boolean {
  return locked;
}
