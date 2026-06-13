/** Go service DTOs without json tags return PascalCase; handler request DTOs use snake_case. */

export function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && v !== '') return Number(v);
  return fallback;
}

export function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (v == null) return fallback;
  return String(v);
}

export function bool(v: unknown, fallback = false): boolean {
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return fallback;
}

export function optionalStr(v: unknown): string | null {
  if (v == null || v === '') return null;
  return String(v);
}
