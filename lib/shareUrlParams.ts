/** 改行・タブ・制御文字を除去（二重エンコードはしない。URLSearchParams がエンコード担当） */
export function stripControlChars(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/[\x00-\x1F\x7F]/g, "");
}

/** シェアURL用の長さ制限 */
export const SHARE_TITLE_MAX_LEN = 72;
export const SHARE_SALARY_MAX_LEN = 48;
export const SHARE_RANK_TIER_MAX_LEN = 16;

export function truncateForShareUrl(value: string | undefined, max: number): string {
  const stripped = stripControlChars(value);
  const t = stripped.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

export type ShareScores = {
  technical: number;
  contribution: number;
  sustainability: number;
  market: number;
};

/**
 * 鑑定結果ページ用のクエリ（scores は画面表示に必要）
 * encodeURIComponent は使わず URLSearchParams のみ（二重エンコード防止）
 */
export function buildShareSearchParams(opts: {
  scores: ShareScores;
  jobTitle?: string;
  salaryDisplay?: string;
  rank?: string;
  tier?: string;
  mode: string;
}): URLSearchParams {
  const p = new URLSearchParams();
  p.set(
    "scores",
    `${opts.scores.technical},${opts.scores.contribution},${opts.scores.sustainability},${opts.scores.market}`
  );
  p.set("mode", opts.mode);
  p.set("v", "final");
  const title = truncateForShareUrl(opts.jobTitle, SHARE_TITLE_MAX_LEN);
  if (title) p.set("title", title);
  const salary = truncateForShareUrl(opts.salaryDisplay, SHARE_SALARY_MAX_LEN);
  if (salary) p.set("salary", salary);
  if (opts.rank) p.set("rank", stripControlChars(opts.rank).slice(0, SHARE_RANK_TIER_MAX_LEN));
  if (opts.tier) p.set("tier", stripControlChars(opts.tier).slice(0, SHARE_RANK_TIER_MAX_LEN));
  return p;
}

/**
 * /api/og 専用の最小クエリ（OGP画像に不要な scores / mode / v は含めない）
 */
export function buildOgImageSearchParams(opts: {
  salary?: string;
  title?: string;
  rank?: string;
  tier?: string;
  t?: string;
}): URLSearchParams {
  const p = new URLSearchParams();
  const salary = truncateForShareUrl(stripControlChars(opts.salary), SHARE_SALARY_MAX_LEN);
  const title = truncateForShareUrl(stripControlChars(opts.title), SHARE_TITLE_MAX_LEN);
  if (salary) p.set("salary", salary);
  if (title) p.set("title", title);
  const r = stripControlChars(opts.rank).slice(0, SHARE_RANK_TIER_MAX_LEN);
  const ti = stripControlChars(opts.tier).slice(0, SHARE_RANK_TIER_MAX_LEN);
  if (r) p.set("rank", r);
  else if (ti) p.set("tier", ti);
  if (opts.t) p.set("t", String(opts.t).replace(/[^\d]/g, "").slice(0, 20));
  return p;
}
