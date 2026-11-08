import { AnswerSegment, parseCitations } from './parse-citations';

export type Inline =
  | AnswerSegment
  | { type: 'code'; value: string }
  | { type: 'bold'; children: AnswerSegment[] };

export type AnswerBlock =
  | { type: 'paragraph'; inlines: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] };

const BOLD_OR_CODE = /(\*\*[^*\n]+\*\*|`[^`\n]+`)/g;
const BULLET = /^\s*[-*•]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;

function parseInlines(text: string, sourcesCount: number): Inline[] {
  const out: Inline[] = [];
  let last = 0;

  for (const match of text.matchAll(BOLD_OR_CODE)) {
    const start = match.index ?? 0;
    if (start > last) out.push(...parseCitations(text.slice(last, start), sourcesCount));

    const token = match[0];
    if (token.startsWith('**')) {
      out.push({ type: 'bold', children: parseCitations(token.slice(2, -2), sourcesCount) });
    } else {
      out.push({ type: 'code', value: token.slice(1, -1) });
    }
    last = start + token.length;
  }

  if (last < text.length) out.push(...parseCitations(text.slice(last), sourcesCount));
  return out;
}

export function parseAnswer(answer: string, sourcesCount: number): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

  const flushParagraph = (): void => {
    if (paragraph.length === 0) return;
    blocks.push({ type: 'paragraph', inlines: parseInlines(paragraph.join(' '), sourcesCount) });
    paragraph = [];
  };

  const flushList = (): void => {
    if (listItems.length === 0) return;
    blocks.push({
      type: 'list',
      ordered: listOrdered,
      items: listItems.map((item) => parseInlines(item, sourcesCount)),
    });
    listItems = [];
  };

  for (const raw of answer.split(/\r?\n/)) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const bullet = BULLET.exec(line);
    const ordered = ORDERED.exec(line);
    const heading = HEADING.exec(line);

    if (bullet || ordered) {
      flushParagraph();
      const isOrdered = !bullet && !!ordered;
      if (listItems.length > 0 && listOrdered !== isOrdered) flushList();
      listOrdered = isOrdered;
      listItems.push((bullet ?? ordered)![1]);
    } else if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'paragraph',
        inlines: [{ type: 'bold', children: parseCitations(heading[1], sourcesCount) }],
      });
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }

  flushParagraph();
  flushList();
  return blocks;
}