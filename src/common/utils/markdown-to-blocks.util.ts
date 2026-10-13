export type BlogBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'figure'; image: string; caption?: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'callout'; title: string; text: string };

/**
 * Converts editorial Markdown into structured BlogBlock[] format
 * required by optimark_landing.blog_post_translations.body.
 */
export function markdownToBlocks(markdown: string): BlogBlock[] {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const blocks: BlogBlock[] = [];
  let currentParagraph: string[] = [];
  let currentUl: string[] = [];
  let currentOl: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        blocks.push({ type: 'p', text });
      }
      currentParagraph = [];
    }
  };

  const flushUl = () => {
    if (currentUl.length > 0) {
      blocks.push({ type: 'ul', items: [...currentUl] });
      currentUl = [];
    }
  };

  const flushOl = () => {
    if (currentOl.length > 0) {
      blocks.push({ type: 'ol', items: [...currentOl] });
      currentOl = [];
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushUl();
    flushOl();
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushAll();
      continue;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      flushAll();
      blocks.push({ type: 'h3', text: trimmed.replace(/^###\s+/, '') });
    } else if (trimmed.startsWith('## ')) {
      flushAll();
      blocks.push({ type: 'h2', text: trimmed.replace(/^##\s+/, '') });
    } else if (trimmed.startsWith('# ')) {
      flushAll();
      blocks.push({ type: 'h2', text: trimmed.replace(/^#\s+/, '') });
    }
    // Lists
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      flushOl();
      currentUl.push(trimmed.replace(/^[-*]\s+/, ''));
    } else if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      flushUl();
      currentOl.push(trimmed.replace(/^\d+\.\s+/, ''));
    }
    // Blockquotes & Callouts
    else if (trimmed.startsWith('> ')) {
      flushAll();
      const quoteText = trimmed.replace(/^>\s+/, '');
      if (quoteText.startsWith('**') && quoteText.includes(':**')) {
        const titleMatch = quoteText.match(/^\*\*(.*?):\*\*\s*(.*)$/);
        if (titleMatch) {
          blocks.push({
            type: 'callout',
            title: titleMatch[1].trim(),
            text: titleMatch[2].trim(),
          });
          continue;
        }
      }
      blocks.push({ type: 'quote', text: quoteText });
    }
    // Images / Figures
    else if (trimmed.startsWith('![')) {
      flushAll();
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        blocks.push({
          type: 'figure',
          image: imgMatch[2].trim(),
          caption: imgMatch[1].trim() || undefined,
        });
      }
    }
    // Regular text paragraph
    else {
      flushUl();
      flushOl();
      currentParagraph.push(trimmed);
    }
  }

  flushAll();
  return blocks;
}
