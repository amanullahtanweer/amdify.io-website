const POST = async ({ request }) => {
  try {
    const { content, mode } = await request.json();
    if (!content) {
      return new Response(JSON.stringify({ error: "No content" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const markdown = mode === "html" ? htmlToMarkdown(content) : smartSplitText(content);
    const title = extractTitle(markdown);
    const excerpt = extractExcerpt(markdown);
    const slug = slugify(title);
    return new Response(JSON.stringify({
      title,
      excerpt,
      slug,
      category: detectCategory(markdown),
      seoTitle: title.slice(0, 65),
      seoDescription: excerpt.slice(0, 160),
      content: markdown
    }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
function smartSplitText(raw) {
  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const newlineRatio = (text.match(/\n/g) || []).length / text.length;
  if (newlineRatio < 0.02) {
    text = splitConcatenatedText(text);
  }
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const out = [];
  let tableBuffer = [];
  let inTable = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1] || "";
    const prev = lines[i - 1] || "";
    if (/^[•\-\*]\s/.test(line)) {
      if (inTable) {
        flushTable(tableBuffer, out);
        tableBuffer = [];
        inTable = false;
      }
      out.push("- " + line.replace(/^[•\-\*]\s*/, "").trim());
      continue;
    }
    const cols = splitTableRow(line);
    if (cols.length >= 2 && cols.every((c) => c.length < 35)) {
      const prevCols = splitTableRow(prev);
      if (prevCols.length >= 2 || inTable) {
        if (!inTable) {
          tableBuffer.push("| " + cols.join(" | ") + " |");
          tableBuffer.push("| " + cols.map(() => "---").join(" | ") + " |");
        } else {
          tableBuffer.push("| " + cols.join(" | ") + " |");
        }
        inTable = true;
        continue;
      }
    } else if (inTable) {
      flushTable(tableBuffer, out);
      tableBuffer = [];
      inTable = false;
    }
    const heading = detectHeadingLevel(line, next);
    if (heading) {
      out.push("");
      out.push(heading);
      out.push("");
      continue;
    }
    out.push(line);
  }
  if (inTable) flushTable(tableBuffer, out);
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
function splitConcatenatedText(text) {
  const headingPatterns = [
    // Questions (often section headings)
    /([.!])\s+([A-Z][A-Za-z\s]{5,60}\?)/g,
    // "What Is...", "How To...", "Why...", "The...", title-case phrase after period
    /([.!?])\s+((?:What|How|Why|When|Where|The|Key|AI|Top|Best|Understanding|Building|Getting|Final|Business|Challenges?|Benefits?|Future|Impact|Tools?|Types?|Features?|Advantages?|Introduction|Overview|Summary|Conclusion)[A-Za-z\s]{3,60})(?=\s+[A-Z][a-z])/g,
    // Any title-case phrase (2-8 words) after sentence end
    /([.!?•])\s+([A-Z][a-z]+(?:\s+(?:of|in|the|for|and|with|at|to|a|an|is|are|by|on|from|vs|or)|[A-Z][a-z]+){1,7})(?=\s+[A-Z][a-z])/g
  ];
  let result = text;
  headingPatterns.forEach((pattern) => {
    result = result.replace(pattern, (match, punct, heading) => {
      const wordCount = heading.trim().split(/\s+/).length;
      if (wordCount >= 2 && wordCount <= 10 && !heading.endsWith(",")) {
        return `${punct}

${heading.trim()}

`;
      }
      return match;
    });
  });
  result = result.replace(/\s*•\s*/g, "\n• ");
  return result;
}
function detectHeadingLevel(line, next) {
  const trimmed = line.trim();
  if (trimmed.length > 100) return null;
  if (/^[a-z]/.test(trimmed)) return null;
  if (/[,;]$/.test(trimmed)) return null;
  if (/^[•\-\*\d\.]/.test(trimmed)) return null;
  const words = trimmed.split(/\s+/);
  const wordCount = words.length;
  if (wordCount < 2 || wordCount > 12) return null;
  const capitalWords = words.filter((w) => /^[A-Z]/.test(w)).length;
  if (capitalWords / wordCount < 0.5) return null;
  const noEndPunct = !/[.!?,;]$/.test(trimmed);
  const nextIsBody = next.length > trimmed.length;
  const isQuestion = trimmed.endsWith("?");
  if (isQuestion || noEndPunct && (nextIsBody || words.length <= 5)) {
    return wordCount <= 5 ? `## ${trimmed}` : `## ${trimmed}`;
  }
  return null;
}
function splitTableRow(line) {
  return line.split(/\s{2,}|\t/).map((c) => c.trim()).filter((c) => c.length > 0);
}
function flushTable(buffer, out) {
  if (buffer.length > 0) {
    out.push("");
    out.push(...buffer);
    out.push("");
  }
}
function htmlToMarkdown(html) {
  const tables = [];
  let processed = html.replace(/<table[\s\S]*?<\/table>/gi, (tbl) => {
    const rows = [...tbl.matchAll(/<tr[\s\S]*?<\/tr>/gi)];
    if (!rows.length) return "";
    let md = "";
    rows.forEach((row, i) => {
      const cells = [...row[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => c[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim());
      md += "| " + cells.join(" | ") + " |\n";
      if (i === 0) md += "| " + cells.map(() => "---").join(" | ") + " |\n";
    });
    const placeholder = `__TABLE_${tables.length}__`;
    tables.push(md);
    return placeholder;
  });
  processed = processed.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n## $1\n\n").replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n").replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n").replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n").replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, "**$2**").replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, "*$2*").replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1").replace(/<br\s*\/?>/gi, "\n").replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n").replace(/<hr\s*\/?>/gi, "\n\n---\n\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
  tables.forEach((t, i) => {
    processed = processed.replace(`__TABLE_${i}__`, "\n\n" + t + "\n\n");
  });
  return processed.replace(/\n{3,}/g, "\n\n").trim();
}
function extractTitle(md) {
  const h2 = md.match(/^##\s+(.+)$/m);
  if (h2) return h2[1].trim();
  return md.split("\n").find((l) => l.trim().length > 10)?.trim().slice(0, 100) || "Untitled";
}
function extractExcerpt(md) {
  const lines = md.split("\n");
  for (const line of lines) {
    const c = line.replace(/^#+\s/, "").replace(/\*\*/g, "").trim();
    if (c.length > 80 && !c.startsWith("|") && !c.startsWith("-")) {
      return c.slice(0, 160);
    }
  }
  return md.replace(/^#+\s.+$/gm, "").replace(/\*\*/g, "").trim().slice(0, 160);
}
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}
function detectCategory(md) {
  const lower = md.toLowerCase();
  if (/guide|how to|step|setup|install|tutorial/.test(lower)) return "Guides";
  if (/industry|market|trend|business|enterprise|center|centre/.test(lower)) return "Industry";
  return "Technology";
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
