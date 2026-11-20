import { GLOSSARY_TOOLTIPS } from '../data/glossary';

const terms = Object.keys(GLOSSARY_TOOLTIPS).sort((a, b) => b.length - a.length);
const canonical = new Map(terms.map(term => [term.toLowerCase(), term]));
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Keep existing slash-separated terms such as Wi-Fi k/v/r unchanged; only
// suppress a standalone FTP tooltip when it is a suffix of a slash code.
const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])(${terms.map(escape).join('|')})(?![\\p{L}\\p{N}_])`, 'giu');
// A–A / A–B (T568 wiring) are pair labels, not DNS A records.
// Also accept ASCII hyphen, em dash and optional spacing; preserve standalone DNS A.
const wiringPairs = /(?<![\\p{L}\\p{N}_])[AB]\\s*[-–—]\\s*[AB](?![\\p{L}\\p{N}_])/gu;


export function splitGlossaryText(text: string): { text: string; term?: string }[] {
  const parts: { text: string; term?: string }[] = [];
  let offset = 0;
  const wiringRanges = [...text.matchAll(wiringPairs)].map(match => [match.index, match.index + match[0].length] as const);
  for (const match of text.matchAll(pattern)) {
    if (match[0] === 'A' && wiringRanges.some(([start, end]) => match.index >= start && match.index < end)) continue;
    // An unregistered X/FTP is cabling notation, not file-transfer FTP.
    // Registered S/FTP and U/FTP match as whole terms via longest-first ordering.
    if (match[0].toUpperCase() === 'FTP' && match.index > 0 && text[match.index - 1] === '/') continue;
    if (match.index > offset) parts.push({ text: text.slice(offset, match.index) });
    parts.push({ text: match[0], term: canonical.get(match[0].toLowerCase()) });
    offset = match.index + match[0].length;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset) });
  return parts;
}
