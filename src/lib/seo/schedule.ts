// Deterministic publish scheduling — no AI required.

export interface ScheduleInput {
  niche?: string;
  posts: Array<{
    id: string;
    title: string;
    isPillar?: boolean;
    cluster?: string;
    priority?: number;
  }>;
  startDate?: Date;
  cadencePerWeek?: number;
}

interface NichePattern {
  primaryDay: number;     // 0=Sun, 1=Mon, ..., 6=Sat
  secondaryDay: number;
  hour: number;
  allowWeekend: boolean;
}

const PATTERNS: Record<string, NichePattern> = {
  saas: { primaryDay: 2, secondaryDay: 4, hour: 9, allowWeekend: false },
  marketing: { primaryDay: 2, secondaryDay: 4, hour: 9, allowWeekend: false },
  b2b: { primaryDay: 2, secondaryDay: 4, hour: 9, allowWeekend: false },
  finance: { primaryDay: 1, secondaryDay: 0, hour: 7, allowWeekend: true },
  food: { primaryDay: 5, secondaryDay: 0, hour: 11, allowWeekend: true },
  recipe: { primaryDay: 5, secondaryDay: 0, hour: 11, allowWeekend: true },
  travel: { primaryDay: 3, secondaryDay: 0, hour: 18, allowWeekend: true },
  tech: { primaryDay: 2, secondaryDay: 4, hour: 10, allowWeekend: false },
  dev: { primaryDay: 2, secondaryDay: 4, hour: 10, allowWeekend: false },
  health: { primaryDay: 1, secondaryDay: 3, hour: 7, allowWeekend: true },
  fitness: { primaryDay: 1, secondaryDay: 3, hour: 7, allowWeekend: true },
  lifestyle: { primaryDay: 3, secondaryDay: 6, hour: 12, allowWeekend: true },
  fashion: { primaryDay: 3, secondaryDay: 6, hour: 12, allowWeekend: true },
  news: { primaryDay: 2, secondaryDay: 3, hour: 7, allowWeekend: false },
  default: { primaryDay: 2, secondaryDay: 4, hour: 9, allowWeekend: false }
};

function nicheKey(niche: string | undefined): string {
  if (!niche) return "default";
  const lower = niche.toLowerCase();
  for (const k of Object.keys(PATTERNS)) {
    if (lower.includes(k)) return k;
  }
  return "default";
}

function nextSlot(from: Date, pattern: NichePattern, used: Set<string>): Date {
  const d = new Date(from);
  d.setUTCHours(pattern.hour, 0, 0, 0);
  for (let i = 0; i < 60; i++) {
    const day = d.getUTCDay();
    const isWeekend = day === 0 || day === 6;
    const okDay = day === pattern.primaryDay || day === pattern.secondaryDay;
    const okWeekend = pattern.allowWeekend || !isWeekend;
    const key = d.toISOString().slice(0, 10);
    if (okDay && okWeekend && !used.has(key)) {
      used.add(key);
      return new Date(d);
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return new Date(d);
}

export interface ScheduledItem {
  postId: string;
  publishDateISO: string;
  rationale: string;
}

export function buildSchedule(input: ScheduleInput): ScheduledItem[] {
  const pattern = PATTERNS[nicheKey(input.niche)];
  const start = input.startDate ?? new Date();
  // Always start at least 2 days out.
  start.setUTCDate(start.getUTCDate() + 2);
  start.setUTCHours(0, 0, 0, 0);

  // Pillars first, then by priority, then stable original order.
  const sorted = [...input.posts].sort((a, b) => {
    const pa = a.isPillar ? 0 : 1;
    const pb = b.isPillar ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return (a.priority ?? 99) - (b.priority ?? 99);
  });

  const used = new Set<string>();
  const result: ScheduledItem[] = [];
  let cursor = new Date(start);

  for (const post of sorted) {
    const slot = nextSlot(cursor, pattern, used);
    result.push({
      postId: post.id,
      publishDateISO: slot.toISOString(),
      rationale: `${post.isPillar ? "pillar · " : ""}niche=${nicheKey(input.niche)} · best day for niche`
    });
    cursor = new Date(slot);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
}
