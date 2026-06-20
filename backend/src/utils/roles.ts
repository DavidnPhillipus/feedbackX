export function parseRoles(roles: string | string[] | null | undefined): string[] {
  if (Array.isArray(roles)) return roles;
  if (!roles) return [];
  try {
    const parsed = JSON.parse(roles);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function stringifyRoles(roles: string[]): string {
  return JSON.stringify(roles);
}

export function hasRole(roles: string | string[] | null | undefined, role: string): boolean {
  return parseRoles(roles).includes(role);
}
