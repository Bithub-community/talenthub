export type Scope =
  | "register-invite"
  | "view-invite"
  | "user-list"
  | "applications:write"
  | "applications:read";

export function hasScope(scopes: string[] | undefined, needed: Scope) {
  if (!scopes) {
    return false;
  }
  return scopes.includes(needed);
}

export function scopeIntersects(
  tokenFilters: string[] | undefined,
  requestedFilters: string[]
) {
  if (!tokenFilters || tokenFilters.length === 0) {
    return true;
  }
  return requestedFilters.some((filter) => tokenFilters.includes(filter));
}
