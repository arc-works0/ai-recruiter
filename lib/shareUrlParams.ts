/** シェアURL・OGP用クエリの長さ制限（Bad Request / URL長超過の回避） */
export const SHARE_TITLE_MAX_LEN = 72;
export const SHARE_SALARY_MAX_LEN = 48;
export const SHARE_RANK_TIER_MAX_LEN = 16;

export function truncateForShareUrl(value: string | undefined, max: number): string {
  if (!value) return "";
  const t = value.replace(/\s+/g, " ").trim();
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

/** title / feedback 等の長文は含めない（OGは /api/og の短いパラメータのみ） */
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
  if (opts.rank) p.set("rank", opts.rank.slice(0, SHARE_RANK_TIER_MAX_LEN));
  if (opts.tier) p.set("tier", opts.tier.slice(0, SHARE_RANK_TIER_MAX_LEN));
  return p;
}
