/**
 * LLM cost estimation (PIPE-5 COGS). A small per-model price table + a token
 * estimator. Exact provider usage (when a keyed adapter surfaces it) overrides
 * the estimate; until then cost is estimated from text length so the per-org
 * COGS metric is populated on the tested (dev-stub) path. Pure + deterministic.
 */

/** USD per 1M tokens, {in, out}, by model id. Dev/stub models are free. */
const PRICE_PER_MTOK: Record<string, { in: number; out: number }> = {
  "gemini-2.5-flash": { in: 0.3, out: 2.5 },
  "gemini-2.5-pro": { in: 1.25, out: 10 },
  "gemini-embedding-2": { in: 0.15, out: 0 },
};

/** ~4 chars per token — a rough, deterministic estimate (no tokenizer dep). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Cost in USD for a call; unknown/dev models (e.g. "dev-stub") price at 0. */
export function costUsd(model: string, tokensIn: number, tokensOut: number): number {
  const p = PRICE_PER_MTOK[model];
  if (!p) return 0;
  return (tokensIn / 1_000_000) * p.in + (tokensOut / 1_000_000) * p.out;
}
