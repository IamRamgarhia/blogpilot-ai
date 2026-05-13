export type Intent = "informational" | "navigational" | "commercial" | "transactional";
export type SubIntent =
  | "how-to"
  | "listicle"
  | "comparison"
  | "review"
  | "definition"
  | "tool"
  | "service";

export interface IntentResult {
  intent: Intent;
  sub_intent: SubIntent;
  recommended_format:
    | "long-form-guide"
    | "listicle"
    | "comparison-table"
    | "tutorial"
    | "case-study";
  confidence: number;
  rationale: string;
}

const HOW_TO_RX = /\b(how to|how do|how does|tutorial|guide|step by step)\b/i;
const WHY_WHAT_RX = /\b(what is|why|when|where|who is)\b/i;
const COMMERCIAL_RX = /\b(best|top|review|reviews|vs|versus|alternative|alternatives|compare|comparison)\b/i;
const TRANSACTIONAL_RX = /\b(buy|price|cost|cheap|deal|coupon|discount|free|download|near me|shop|trial|signup|sign up)\b/i;

export function classifyIntentByRules(keyword: string): IntentResult {
  const k = keyword.toLowerCase();
  if (TRANSACTIONAL_RX.test(k)) {
    return {
      intent: "transactional",
      sub_intent: "tool",
      recommended_format: "long-form-guide",
      confidence: 0.75,
      rationale: "matches transactional keyword pattern"
    };
  }
  if (COMMERCIAL_RX.test(k)) {
    const sub: SubIntent = /\bvs|versus|compare\b/.test(k)
      ? "comparison"
      : /\bbest|top\b/.test(k)
        ? "listicle"
        : "review";
    return {
      intent: "commercial",
      sub_intent: sub,
      recommended_format: sub === "comparison" ? "comparison-table" : "listicle",
      confidence: 0.8,
      rationale: "matches commercial intent pattern"
    };
  }
  if (HOW_TO_RX.test(k)) {
    return {
      intent: "informational",
      sub_intent: "how-to",
      recommended_format: "tutorial",
      confidence: 0.85,
      rationale: "starts with how-to phrasing"
    };
  }
  if (WHY_WHAT_RX.test(k)) {
    return {
      intent: "informational",
      sub_intent: "definition",
      recommended_format: "long-form-guide",
      confidence: 0.8,
      rationale: "definitional / explanatory query"
    };
  }
  return {
    intent: "informational",
    sub_intent: "definition",
    recommended_format: "long-form-guide",
    confidence: 0.5,
    rationale: "no clear pattern; defaulting to informational"
  };
}
