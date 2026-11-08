export type AnswerSegment =
  | { type: 'text'; value: string }
  | { type: 'citation'; n: number };

const CITATION = /\[(\d{1,2})\]/g;

export function parseCitations(answer: string, sourcesCount: number): AnswerSegment[] {
  const segments: AnswerSegment[] = [];
  let last = 0;

  for (const match of answer.matchAll(CITATION)) {
    const n = Number(match[1]);
    const start = match.index ?? 0;
    if (n < 1 || n > sourcesCount) continue; // marqueur invalide : il reste dans le texte

    if (start > last) segments.push({ type: 'text', value: answer.slice(last, start) });
    segments.push({ type: 'citation', n });
    last = start + match[0].length;
  }

  if (last < answer.length) segments.push({ type: 'text', value: answer.slice(last) });
  return segments;
}

// Nombre de sources distinctes réellement citées, pour afficher « 3 citations valides »
export function countValidCitations(answer: string, sourcesCount: number): number {
  const cited = new Set<number>();
  for (const segment of parseCitations(answer, sourcesCount)) {
    if (segment.type === 'citation') cited.add(segment.n);
  }
  return cited.size;
}