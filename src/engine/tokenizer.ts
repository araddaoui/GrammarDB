import { Token } from './types';

export function tokenize(sentenceText: string, offsetBase = 0): Token[] {
  const tokens: Token[] = [];
  // Match word tokens, punctuation tokens, contractions
  const regex = /[A-Za-z0-9]+(?:'[A-Za-z]+)?|[^\sA-Za-z0-9]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(sentenceText)) !== null) {
    const raw = match[0];
    const start = offsetBase + match.index;
    const end = start + raw.length;
    tokens.push({
      text: raw,
      start,
      end,
      lower: raw.toLowerCase(),
      lemma: raw.toLowerCase(),
    });
  }

  return tokens;
}
