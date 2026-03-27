export const MIN_SALARY_JPY = 3_000_000;
export const MAX_SALARY_JPY = 30_000_000;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function parseSalaryJpy(value: string): number | null {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return Number.isNaN(n) ? null : n;
}

export function normalizeSalaryJpy(value: string): number {
  const parsed = parseSalaryJpy(value);
  if (parsed === null) return MIN_SALARY_JPY;
  return clamp(parsed, MIN_SALARY_JPY, MAX_SALARY_JPY);
}

export function formatSalaryJpy(value: number): string {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

export function normalizeSalaryDisplay(value: string): string {
  return formatSalaryJpy(normalizeSalaryJpy(value));
}
