export interface SentenceSpan {
  text: string;
  start: number;
  end: number;
}

const COMMON_ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr',
  'e.g', 'i.e', 'etc', 'al', 'vs', 'cf', 'fig', 'no', 'vol', 'dept'
]);

export function segmentSentences(text: string): SentenceSpan[] {
  if (!text.trim()) return [];

  const sentences: SentenceSpan[] = [];
  // Split on punctuation followed by whitespace or end of string, guarding abbreviations
  const regex = /([.?!]+)(\s+|$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const punctIndex = match.index + match[1].length;
    const matchEnd = match.index + match[0].length;
    const candidateSlice = text.slice(lastIndex, punctIndex).trim();

    // Check if ends with common abbreviation
    const lastWordMatch = candidateSlice.match(/([a-zA-Z.]+)\.?$/);
    const lastWord = lastWordMatch ? lastWordMatch[1].toLowerCase().replace(/\.$/, '') : '';

    if (COMMON_ABBREVIATIONS.has(lastWord)) {
      // It's likely an abbreviation like "Dr." or "e.g.", do not split sentence boundary yet
      continue;
    }

    if (candidateSlice.length > 0) {
      sentences.push({
        text: text.slice(lastIndex, matchEnd),
        start: lastIndex,
        end: matchEnd,
      });
      lastIndex = matchEnd;
    }
  }

  // Trailing remainder
  if (lastIndex < text.length) {
    const remainder = text.slice(lastIndex);
    if (remainder.trim().length > 0) {
      sentences.push({
        text: remainder,
        start: lastIndex,
        end: text.length,
      });
    }
  }

  return sentences;
}
