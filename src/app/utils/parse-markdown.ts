export type MdInline =
  | { type: 'text'; value: string }
  | { type: 'bold'; children: MdInline[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; label: string };

export type MdBlock =
  | { type: 'heading'; level: 2 | 3 | 4; inlines: MdInline[] }
  | { type: 'paragraph'; inlines: MdInline[] }
  | { type: 'list'; ordered: boolean; items: MdInline[][] }
  | { type: 'code'; lang: string; value: string }
  | { type: 'quote'; inlines: MdInline[] };

const INLINE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;
const FENCE_START = /^\s*(?:`{3}|~{3})\s*([\w+-]*)\s*$/;
const FENCE_END = /^\s*(?:`{3}|~{3})\s*$/;

export function parseInline(text: string): MdInline[] {
  const out: MdInline[] = [];
  let last = 0;

  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) out.push({ type: 'text', value: text.slice(last, start) });

    const token = match[0];
    if (token.startsWith('**')) {
      out.push({ type: 'bold', children: parseInline(token.slice(2, -2)) });
    } else if (token.startsWith('`')) {
      out.push({ type: 'code', value: token.slice(1, -1) });
    } else {
      const link = LINK.exec(token);
      // Seuls http et https sont acceptés : jamais de lien « javascript: »
      if (link && /^https?:\/\//i.test(link[2])) {
        out.push({ type: 'link', label: link[1], href: link[2] });
      } else {
        out.push({ type: 'text', value: link ? link[1] : token });
      }
    }
    last = start + token.length;
  }

  if (last < text.length) out.push({ type: 'text', value: text.slice(last) });
  return out;
}

export function parseMarkdown(markdown: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  const lines = markdown.split(/\r?\n/);

  let paragraph: string[] = [];
  let quote: string[] = [];
  // Objet plutôt que `let` : TypeScript ne suit pas les modifications faites dans les fonctions
  const state: { list: { ordered: boolean; items: string[] } | null } = { list: null };

  const flushParagraph = (): void => {
    if (paragraph.length) blocks.push({ type: 'paragraph', inlines: parseInline(paragraph.join(' ')) });
    paragraph = [];
  };
  const flushQuote = (): void => {
    if (quote.length) blocks.push({ type: 'quote', inlines: parseInline(quote.join(' ')) });
    quote = [];
  };
  const flushList = (): void => {
    if (state.list) {
      blocks.push({
        type: 'list',
        ordered: state.list.ordered,
        items: state.list.items.map((item) => parseInline(item)),
      });
    }
    state.list = null;
  };
  const flushAll = (): void => {
    flushParagraph();
    flushQuote();
    flushList();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();

    const fence = FENCE_START.exec(line);
    if (fence) {
      flushAll();
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE_END.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', lang: fence[1] ?? '', value: code.join('\n') });
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flushAll();
      // Le titre de l'ADR est déjà un h2 : un « # » du contenu est affiché en h2 aussi
      const level = Math.min(Math.max(heading[1].length, 2), 4) as 2 | 3 | 4;
      blocks.push({ type: 'heading', level, inlines: parseInline(heading[2]) });
      continue;
    }

    const q = QUOTE.exec(line);
    if (q) {
      flushParagraph();
      flushList();
      quote.push(q[1]);
      continue;
    }

    const bullet = BULLET.exec(line);
    const ordered = ORDERED.exec(line);
    if (bullet || ordered) {
      flushParagraph();
      flushQuote();
      const isOrdered = !bullet;
      if (state.list && state.list.ordered !== isOrdered) flushList();
      state.list ??= { ordered: isOrdered, items: [] };
      state.list.items.push((bullet ?? ordered)![1]);
      continue;
    }

    // Ligne indentée : suite de l'élément de liste précédent
    if (state.list && /^\s{2,}\S/.test(lines[i])) {
      state.list.items[state.list.items.length - 1] += ' ' + line.trim();
      continue;
    }

    flushQuote();
    flushList();
    paragraph.push(line.trim());
  }

  flushAll();
  return blocks;
}