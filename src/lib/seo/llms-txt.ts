export interface LlmsTxtResource {
  title: string;
  url: string;
  summary: string;
}

export interface LlmsTxtSection {
  heading: string;
  optional?: boolean;
  resources: LlmsTxtResource[];
}

export interface LlmsTxtInput {
  siteName: string;
  description: string;
  sections: LlmsTxtSection[];
}

function clean(s: string): string {
  return s.replace(/\r?\n+/g, " ").trim();
}

export function buildLlmsTxt(input: LlmsTxtInput): string {
  const lines: string[] = [];
  lines.push(`# ${clean(input.siteName)}`);
  lines.push("");
  lines.push(`> ${clean(input.description)}`);
  lines.push("");
  for (const sec of input.sections) {
    if (sec.resources.length === 0) continue;
    lines.push(`## ${sec.optional ? "Optional" : clean(sec.heading)}`);
    if (sec.optional && sec.heading) lines.push(`<!-- ${clean(sec.heading)} -->`);
    lines.push("");
    for (const r of sec.resources) {
      lines.push(`- [${clean(r.title)}](${r.url}): ${clean(r.summary)}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim() + "\n";
}

export function buildLlmsFullTxt(input: LlmsTxtInput, bodies: Map<string, string>): string {
  const lines: string[] = [];
  lines.push(`# ${clean(input.siteName)} — full content index`);
  lines.push("");
  lines.push(`> ${clean(input.description)}`);
  lines.push("");
  for (const sec of input.sections) {
    if (sec.resources.length === 0) continue;
    lines.push(`## ${clean(sec.heading)}`);
    lines.push("");
    for (const r of sec.resources) {
      lines.push(`### ${clean(r.title)}`);
      lines.push(`Source: ${r.url}`);
      lines.push("");
      const body = bodies.get(r.url) ?? r.summary;
      lines.push(body.trim());
      lines.push("");
      lines.push("---");
      lines.push("");
    }
  }
  return lines.join("\n").trim() + "\n";
}
