import { GLOSSARY_TOOLTIPS } from '../data/glossary';

// Explicit expansions verified against the existing dictionary. Do not treat every
// English tooltip title, generic word or phrase fragment as an automatic alias.
const ALIASES: Readonly<Record<string, string>> = {
  'Passive Power over Ethernet': 'passive PoE',
  'Power over Ethernet Plus (IEEE 802.3at)': 'PoE+',
  'Power over Ethernet Plus': 'PoE+',
  'Power over Ethernet': 'PoE',
  'Power Sourcing Equipment': 'PSE',
  'Powered Device': 'PD',
  'PoE Tester': 'PoE-тестер',
  'PoE-tester': 'PoE-тестер',
  'Longest Prefix Match': 'LPM',
  'Protocol Data Unit': 'PDU',
  'Internet Control Message Protocol': 'ICMP',
  'Internet Protocol Version 4': 'IPv4',
  'Internet Protocol Version 6': 'IPv6',
  'Internet Protocol': 'IP',
  'ICMP Time Exceeded': 'Time Exceeded',
  'ICMP Echo Request': 'Echo Request',
  'Router Advertisement': 'RA',
  'Neighbor Advertisement': 'NA',
  'Remote Desktop Protocol': 'RDP',
  'High-availability Seamless Redundancy': 'HSR',
  'Parallel Redundancy Protocol': 'PRP',
  'Insulation Displacement Contact': 'IDC',
  'Low Smoke Halogen Free': 'LSHF',
  'Visual Fault Locator': 'VFL',
  'Optical Power Meter': 'оптический измеритель мощности',
  'Fusion splicer': 'сварочный аппарат',
  'Solid conductor': 'solid',
  'Stranded conductor': 'stranded',
  'Patch cord': 'патч-корд',
  'Twisted pair': 'витая пара',
  'Link Layer Discovery Protocol': 'LLDP',
  'Link Layer': 'Link',
  'Internet Layer': 'Internet',
  'Transport Layer': 'Transport',
  'Application Layer': 'Application',
  'Transport Layer Security': 'TLS',
  'Retransmission Timeout': 'RTO',
};
const normalize = (value: string) => value.replace(/\s+/gu, ' ').toLowerCase();
const canonical = new Map(Object.keys(GLOSSARY_TOOLTIPS).map(term => [normalize(term), term]));
const byAlias = new Map(Object.entries(ALIASES).map(([alias, term]) => [normalize(alias), term]));
// Generic English fields (Used, Class, Type...) mean something else in non-PoE lessons.
// Render their PoE-specific tooltips only when an explicit PoE lesson scope is set.
const POE_ONLY_TERMS = new Set(["Requested Class","Received Class","Unloaded Voltage","TruePower","TruePower Power","TruePower Voltage","PSE Type 1/2","Positive","Negative","DC/DC","Available","Used","Remaining","Allocated","Utilized","Measured","Class","LLDP Power-via-MDI","Alt A/B","Переключение A/B","A/B","detection","classification","link up","полярность","ток пуска","read-only","Type"]);
const POE_FORMULA_ONLY_TERMS = new Set(["ΔU", "I", "R", "I²", "Pпотерь"]);
const IPV6_ONLY_TERMS = new Set(["A=1", "A=0", "L=1", "L=0", "A/L", "A flag"]);

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Allow horizontal spacing and a single soft line break inside full phrases,
// but do not join separate paragraphs. Leave the displayed spelling untouched.
const gap = String.raw`(?:[\p{Zs}\t]+|[\p{Zs}\t]*(?:\r\n?|\n)[\p{Zs}\t]*)`;
const whole = String.raw`[\p{L}\p{M}\p{N}_]`;
const recognized = [...new Set([...canonical.keys(), ...byAlias.keys()])]
  .sort((a, b) => b.length - a.length)
  .map(key => {
    const pattern = key.split(' ').map(escape).join(gap);
    // Full English aliases must not start/end partway through a hyphenated token.
    return byAlias.has(key) ? String.raw`(?<![a-z0-9][-‐‑])${pattern}(?![-‐‑][a-z0-9])` : pattern;
  });
const pattern = new RegExp(`(?<!${whole})(${recognized.join('|')})(?!${whole})`, 'giu');

// A–A / A–B are wiring labels (and can use any ordinary dash), not DNS A.
const wiringPairs = /(?<![\p{L}\p{N}_])[AB]\s*[-–—]\s*[AB](?![\p{L}\p{N}_])/giu;
const rrType = String.raw`(?<![\p{L}\p{N}_])(?:AAAA|CNAME|MX|PTR|TXT|NS|SOA|SRV|CAA)(?![\p{L}\p{N}_])`;
const rrJoin = String.raw`(?:\s*[,/]\s*|\s+(?:или|и|с)\s+)`;
const dnsBefore = new RegExp(
  String.raw`(?:(?:\bDNS(?:(?:[-‐‑ ]запис[ьи](?:\s+типа)?)|\s+(?:record\s+type|record|query|type))?|\bQTYPE\s*=|\bRRset|\bglue)\s*|${rrType}${rrJoin})[«"'\x60]?\s*$`, 'iu');
const dnsAfter = new RegExp(
  String.raw`^\s*[»"'\x60]?(?:[-‐‑](?:запис(?:ь|и|ей|ью|ям|ями|ях)|(?:запрос|ответ)(?:а|у|ом|е|ы|ов|ам|ами|ах)?)(?!\p{L})|\s+(?:RRset|в\s+Additional)\b|${rrJoin}${rrType})`, 'iu');
const dnsName = String.raw`(?:@|(?:[\p{L}\p{N}_-]+\.)+[\p{L}][\p{L}\p{N}-]*\.?)`;
const rrOwner = new RegExp(String.raw`(?:^|[^\p{L}\p{M}\p{N}_.-])${dnsName}\s+(?:\d+\s+(?:IN\s+)?|IN\s+(?:\d+\s+)?)?$`, 'iu');
const digOwner = new RegExp(String.raw`\bdig\s+${dnsName}\s+$`, 'iu');
const questionOwner = new RegExp(String.raw`(?:^|[^\p{L}\p{M}\p{N}_.-])${dnsName}\s*,\s*$`, 'iu');
const rrIpv4Value = /^\s+(?:(?:указан(?:о|а)?|возвращает)\s+)?(\d{1,3}(?:\.\d{1,3}){3})(?![\p{L}\p{N}_]|\.\d)/iu;
const explicitRecordDescription = /^\s+(?:содержит|задаёт|для|с|указывает\s+на)\s+IPv4[-‐‑ ]адрес(?:а|у|е|ом)?(?!\p{L})/iu;
const physicalLabelBefore = /(?<!\p{L})(?:колонк\p{L}*|схем\p{L}*|контакт\p{L}*|порт\p{L}*|пар[аеыу]|сеть|сети|LAN|PC|ПК|вариант\p{L}*|режим\p{L}*|метк\p{L}*|выход\p{L}*|вход\p{L}*|(?:Cat\d\w*)\s+без|case|type|mode)\s*[«"'\x60]?\s*$/iu;
const transferNames = new Set(['FTP', 'SFTP', 'TFTP', 'FTPS']);

const dnsTypeMarker = new RegExp(rrType, 'iu');

function explicitDnsA(textBefore: string, left: string, right: string) {
  if (dnsBefore.test(left) || dnsAfter.test(right) || explicitRecordDescription.test(right) || digOwner.test(textBefore)) return true;
  if (/запис[ьи]\s*$/iu.test(left) && dnsTypeMarker.test(left + ' ' + right)) return true;
  if (/^\s*,\s*IN(?![\p{L}\p{N}_])/iu.test(right) && questionOwner.test(textBefore)) return true;
  const ipValue = rrIpv4Value.exec(right)?.[1];
  return Boolean(ipValue?.split('.').every(octet => Number(octet) <= 255) && rrOwner.test(textBefore));
}

function unrelatedA(textBefore: string, left: string, right: string, label: string) {
  if (label !== 'A' || physicalLabelBefore.test(left) || /\d\s+$/u.test(left) ||
      /(?:^|[^\p{L}\p{N}_])[SFXU]\/(?:FTP|UTP)\/$/iu.test(left)) return true;
  const ipValue = rrIpv4Value.exec(right)?.[1];
  if (ipValue && (rrOwner.test(textBefore) || /(?:TXT|AAAA|MX|CNAME)\s+$/u.test(left))) return true;
  if (/[\p{L}\p{N}][-‐‑]$/u.test(left) || /^[‐‑–—-][a-z0-9]/iu.test(right)) return true;
  if (/^(?:[↔→]|\s*(?:\/|,|и|или)\s*[BCDF](?![\p{L}\p{N}_]))/u.test(right) ||
      /(?:[↔→]|\b[BCDF]\s*(?:\/|,|и|или)\s*)$/u.test(left)) return true;
  if (/^\s+содержит\s+адрес\s+интерфейса\s*[,;]\s*B\s+содержит(?!\p{L})/u.test(right)) return true;
  // A paragraph/sentence-initial English article, not the DNS RR.
  if (/(?:^|[.!?]\s+|\n\n)[\s«"'\x60]*$/u.test(textBefore) && /^\s+[a-z][a-z-]*(?:\s|[.,;:!?]|$)/u.test(right)) return true;
  // A table/log label, not a record type. Explicit RR evidence is evaluated first.
  return /запис[ьи]\s*$/iu.test(left) && /^\s+в\s+(?:журнал\p{L}*|таблиц\p{L}*|VLAN)(?!\p{L})/iu.test(right);
}

export function splitGlossaryText(text: string, scope?: "poe" | "poe-formula" | "ipv6" | "http"): { text: string; term?: string }[] {
  const parts: { text: string; term?: string }[] = [];
  let offset = 0;
  const wiringRanges = [...text.matchAll(wiringPairs)].map(match => [match.index, match.index + match[0].length] as const);
  for (const match of text.matchAll(pattern)) {
    const key = normalize(match[0]);
    const alias = byAlias.get(key);
    let term = alias ?? canonical.get(key);
    if (!term) continue;
    const left = text.slice(Math.max(0, match.index - 48), match.index);
    const right = text.slice(match.index + match[0].length, match.index + match[0].length + 48);
    const poe = scope === 'poe' || scope === 'poe-formula';

    // The dictionary has both labels. The PoE field must not shadow the
    // generic electrical/link-state meaning everywhere else.
    if (key === 'link up') term = poe ? 'link up' : 'Link Up';
    // A bare English 'link' in cabling prose is not the TCP/IP Link Layer.
    if (term === 'Link' && !alias && (match[0] !== 'Link' || /\bPermanent\s*$/iu.test(left))) continue;

    // HTTP prose must not borrow generic meanings from DNS, DHCP or BGP.
    if (scope === 'http' && ['a', 'update', 'request', 'trusted', 'keepalive'].includes(term.toLowerCase())) continue;
    if (poe && (term.toLowerCase() === 'порт' || term.toLowerCase() === 'port')) continue;
    if (IPV6_ONLY_TERMS.has(term) && scope !== 'ipv6') continue;
    if (POE_ONLY_TERMS.has(term) && !poe) continue;
    if (POE_FORMULA_ONLY_TERMS.has(term) && scope !== 'poe-formula') continue;
    if ((term === 'PoE' || term === 'PoE+') && (right.startsWith('+') || /^[-‐‑](?:тестер|tester)/iu.test(right))) continue;

    // A without context is often an article, variant label, or current unit.
    // Preserve explicit DNS records and the actual SLAAC Autonomous flag.
    if (term === 'A') {
      if (wiringRanges.some(([start, end]) => match.index >= start && match.index < end)) continue;
      const before = text.slice(0, match.index);
      if (!explicitDnsA(before, left, right)) {
        if (unrelatedA(before, left, right, match[0])) continue;
        // Ambiguous surviving uses keep the previous behavior, especially
        // shorthand DNS prose and the standalone IPv6 autonomous flag.
        if (scope === 'ipv6') term = 'A flag';
      }
    }
    // An unregistered one-letter X/FTP or X/SFTP-style code is not a
    // file-transfer protocol. Keep lists of actual protocols (FTP/SFTP) usable.
    if (transferNames.has(term) && /(?:^|[^\p{L}\p{N}_])[a-z]\/$/iu.test(left)) continue;
    if (match.index > offset) parts.push({ text: text.slice(offset, match.index) });
    parts.push({ text: match[0], term });
    offset = match.index + match[0].length;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset) });
  return parts;
}
