import { ProtectedSpan } from './types';

const PROTECTED_PATTERNS = [
  // Fenced code blocks ```...```
  { kind: 'code', regex: /```[\s\S]*?```/g },
  // Inline backtick code `...`
  { kind: 'code', regex: /`[^`\n]+`/g },
  // User locked spans [locked]...[/locked]
  { kind: 'user-locked', regex: /\[locked\][\s\S]*?\[\/locked\]/gi },
  // Proper name locked spans [proper]...[/proper]
  { kind: 'proper-name-locked', regex: /\[proper\][\s\S]*?\[\/proper\]/gi },
  // Web URLs
  { kind: 'url', regex: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi },
  // Email addresses
  { kind: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi },
  // Academic Citation Keys e.g. [@smith2024], [@smith2024:12]
  { kind: 'citation', regex: /\[@[a-zA-Z0-9_:-]+(?::\d+)?\]/g },
  // Author-date parenthetical reference e.g. (Smith, 2024), (Miller et al., 2023)
  { kind: 'reference', regex: /\([A-Z][a-zA-Z]+(?: et al\.)?,\s*\d{4}[a-z]?(?::\s*\d+)?\)/g },
  // Footnote and endnote markers e.g. [^1], [^note-1], [1], [12]
  { kind: 'footnote', regex: /\[\^[a-zA-Z0-9_-]+\]|\[\d+\]/g },
  // HTML superscripts e.g. <sup>2</sup> or unicode superscripts
  { kind: 'superscript', regex: /<sup>[\s\S]*?<\/sup>|[\u00B2\u00B3\u00B9\u2070\u2074-\u2079]+/gi },
  // TeX Math $$...$$ or $...$
  { kind: 'equation', regex: /\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g },
];

export function findProtectedSpans(text: string, skipQuotes = false): ProtectedSpan[] {
  const spans: ProtectedSpan[] = [];

  for (const { kind, regex } of PROTECTED_PATTERNS) {
    const rx = new RegExp(regex.source, regex.flags);
    let match: RegExpExecArray | null;
    while ((match = rx.exec(text)) !== null) {
      spans.push({
        start: match.index,
        end: match.index + match[0].length,
        kind,
        matchedText: match[0],
      });
    }
  }

  if (skipQuotes) {
    // Both ASCII quotes and curly typographical quotation marks
    const quoteRegex = /"([^"\\]*(\\.[^"\\]*)*)"|“([^”\\]*(\\.[^”\\]*)*)”|'([^'\\]*(\\.[^'\\]*)*)'|‘([^’\\]*(\\.[^’\\]*)*)’/g;
    let qMatch: RegExpExecArray | null;
    while ((qMatch = quoteRegex.exec(text)) !== null) {
      spans.push({
        start: qMatch.index,
        end: qMatch.index + qMatch[0].length,
        kind: 'quoted-immutable',
        matchedText: qMatch[0],
      });
    }
  }

  // Sort by start index
  return spans.sort((a, b) => a.start - b.start);
}

export function isRangeOverlappingProtected(
  start: number,
  end: number,
  protectedSpans: ProtectedSpan[]
): boolean {
  for (const span of protectedSpans) {
    if (Math.max(start, span.start) < Math.min(end, span.end)) {
      return true;
    }
  }
  return false;
}
