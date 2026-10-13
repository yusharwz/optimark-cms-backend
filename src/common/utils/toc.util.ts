import slugify from 'slugify';

export interface TocItem {
  id: string;
  level: number;
  text: string;
}

/**
 * Extracts Table of Contents from markdown or HTML content
 * Detects H1 - H4 headings
 */
export function extractTableOfContents(content: string): TocItem[] {
  if (!content) return [];

  const items: TocItem[] = [];
  const lines = content.split('\n');
  const seenIds = new Set<string>();

  const makeUniqueId = (rawText: string): string => {
    const baseSlug = slugify(rawText, { lower: true, strict: true }) || 'heading';
    let id = baseSlug;
    let counter = 1;
    while (seenIds.has(id)) {
      id = `${baseSlug}-${counter}`;
      counter++;
    }
    seenIds.add(id);
    return id;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // 1. Markdown syntax: # Heading, ## Heading, etc.
    const mdMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (mdMatch) {
      const level = mdMatch[1].length;
      const text = mdMatch[2].replace(/[*_`]/g, '').trim();
      items.push({
        id: makeUniqueId(text),
        level,
        text,
      });
      continue;
    }

    // 2. HTML syntax: <h1 id="...">Heading</h1>, <h2>Heading</h2>
    const htmlMatch = trimmed.match(/<h([1-4])[^>]*>(.*?)<\/h\1>/i);
    if (htmlMatch) {
      const level = parseInt(htmlMatch[1], 10);
      const text = htmlMatch[2].replace(/<[^>]*>/g, '').trim();
      items.push({
        id: makeUniqueId(text),
        level,
        text,
      });
    }
  }

  return items;
}

/**
 * Estimate reading time in minutes based on word count (avg 200 words/min)
 */
export function calculateReadMinutes(content: string): number {
  if (!content) return 1;
  const wordCount = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
