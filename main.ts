import { mkdirSync, writeFileSync } from "node:fs";

// Fallback used when the news feed is unreachable (sandbox may be offline).
const FALLBACK =
  "Ukraine war talks stall as Russian strikes hit Kyiv again, while Gaza ceasefire holds shakily and US tariff threats rattle markets";

async function topHeadline(): Promise<string | null> {
  try {
    const r = await fetch("https://feeds.bbci.co.uk/news/world/rss.xml", {
      signal: AbortSignal.timeout(10000),
    });
    const xml = await r.text();
    const item = xml.split("<item>")[1] ?? "";
    const m = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
    const t = m?.[1]
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .trim();
    return t && t.length >= 20 && t.length <= 200 ? t : null;
  } catch {
    return null;
  }
}

const text = (await topHeadline()) ?? FALLBACK;
const out = process.env.OUT_DIR ?? "/output";
mkdirSync(out, { recursive: true });
writeFileSync(`${out}/entry.txt`, text.slice(0, 200));
