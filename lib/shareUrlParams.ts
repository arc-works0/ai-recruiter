/** 改行・タブ・制御文字を除去（URL は英数字中心・URLSearchParams のみでエンコード） */
export function stripControlChars(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/[\x00-\x1F\x7F]/g, "");
}

export type ShareScores = {
  technical: number;
  contribution: number;
  sustainability: number;
  market: number;
};

/** 表示用文字列（例: 5,200,000円）から推定「万円」の整数部分を算出 */
export function salaryDisplayToManYen(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  try {
    const digits = value.replace(/,/g, "").replace(/[^\d]/g, "");
    const n = parseInt(digits, 10);
    if (isNaN(n) || n <= 0) return null;
    if (value.includes("万") && n < 100000) return n;
    return Math.round(n / 10000);
  } catch {
    return null;
  }
}

export function averageScore(scores: ShareScores): number {
  return Math.round(
    (scores.technical + scores.contribution + scores.sustainability + scores.market) / 4
  );
}

/** シェアURL：英数字の最小パラメータのみ（s, sc） */
export function buildShareSearchParams(opts: {
  scores: ShareScores;
  salaryDisplay?: string;
  mode?: string;
}): URLSearchParams {
  const p = new URLSearchParams();
  const man = salaryDisplayToManYen(opts.salaryDisplay);
  if (man != null && man > 0) p.set("s", String(man));
  p.set("sc", String(averageScore(opts.scores)));
  return p;
}

/** /api/og 用：英数字のみ（s=万円の数値, sc=平均スコア, t=キャッシュバスト） */
export function buildOgImageSearchParams(opts: {
  s?: string | number;
  sc?: string | number;
  t?: string;
}): URLSearchParams {
  const p = new URLSearchParams();
  const si = typeof opts.s === "number" ? opts.s : parseInt(String(opts.s ?? ""), 10);
  if (!Number.isNaN(si) && si > 0) p.set("s", String(si));
  const sci = typeof opts.sc === "number" ? opts.sc : parseInt(String(opts.sc ?? ""), 10);
  if (!Number.isNaN(sci) && sci >= 0 && sci <= 100) p.set("sc", String(sci));
  if (opts.t) p.set("t", String(opts.t).replace(/\D/g, "").slice(0, 20));
  return p;
}
