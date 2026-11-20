import assert from 'node:assert/strict';
import { build } from 'esbuild';
await build({ stdin: { contents: "export * from './src/data/glossary'; export * from './src/utils/glossaryText';", resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'esm', outfile: 'scripts/.cache/glossary-hover.mjs', logLevel: 'silent' });
const { GLOSSARY, GLOSSARY_TOOLTIPS, GLOSSARY_ABBREVIATIONS, splitGlossaryText } = await import('./.cache/glossary-hover.mjs');
for (const [term, entry] of Object.entries(GLOSSARY_TOOLTIPS)) {
  assert.ok(GLOSSARY[term]?.description.trim(), term);
  for (const field of ['english', 'russian', 'summary']) assert.ok(entry[field].trim(), `${term}: ${field}`);
  assert.ok(entry.summary.length < 300, `${term}: summary too long`);
}
for (const term of ['TC', 'DNS', 'UDP', 'TCP', 'DHCP', 'SNI', 'HSTS', 'SAN', 'ACK', 'TTL', 'MAC', 'VLAN', 'ARP', 'NAT', 'OSPF', 'STP', 'OTDR', 'OLTS', 'VFL']) assert.ok(GLOSSARY_ABBREVIATIONS.includes(term), term);
const source = 'TCP/IP, DNSSEC, dns, Source MAC, OTDR. XDNSX неизвестно';
const parts = splitGlossaryText(source);
assert.equal(parts.map(part => part.text).join(''), source);
assert.deepEqual(parts.filter(part => part.term).map(part => part.term), ['TCP/IP', 'DNSSEC', 'DNS', 'Source MAC', 'OTDR']);
const flags = 'TC=1, (TC=0); TC/UDP; tc=1. XTCX TC0 ATC TC_flag';
const flagParts = splitGlossaryText(flags);
assert.equal(flagParts.map(part => part.text).join(''), flags);
assert.deepEqual(flagParts.filter(part => part.term).map(part => part.term), ['TC', 'TC', 'TC', 'UDP', 'TC']);
const compounds = ['PHY-to-PHY', 'store-and-forward', 'cut-through', 'half-duplex', 'full-duplex', 'media converter', 'repeater'];
for (const term of compounds) assert.ok(GLOSSARY_TOOLTIPS[term], term);
const compoundText = '(PHY-to-PHY), STORE-AND-FORWARD; cut-through/half-duplex; full-duplex, media converter, repeater.';
const compoundParts = splitGlossaryText(compoundText);
assert.equal(compoundParts.map(part => part.text).join(''), compoundText);
assert.deepEqual(compoundParts.filter(part => part.term).map(part => part.term), compounds);
assert.ok(!splitGlossaryText('XPHY-to-PHYY store-and-forwarding').some(part => compounds.includes(part.term)));
assert.deepEqual(splitGlossaryText('неизвестно'), [{ text: 'неизвестно' }]);
// Regression: every PoE standard named in the budget lesson is hoverable.
const poeLine = 'IEEE 802.3af — 15,4 Вт; 802.3at — 30 Вт; 802.3bt — 60/90 Вт.';
const poeParts = splitGlossaryText(poeLine);
assert.equal(poeParts.map(part => part.text).join(''), poeLine);
assert.deepEqual(
  poeParts.filter(part => part.term && part.term.startsWith('802.3')).map(part => part.term),
  ['802.3af', '802.3at', '802.3bt'],
  'each standard must be a recognized tooltip trigger',
);
for (const term of ['802.3af', '802.3at', '802.3bt']) {
  assert.ok(GLOSSARY[term], 'missing glossary term: ' + term);
  assert.ok(GLOSSARY_TOOLTIPS[term]?.summary, 'missing live hover popup: ' + term);
}
assert.match(GLOSSARY_TOOLTIPS['802.3bt'].summary, /Type 3.*60.*Type 4.*90/s, 'Type 3 vs Type 4 explained in tooltip');
assert.ok(!splitGlossaryText('802.3btX').some(part => part.term === '802.3bt'), 'no partial match inside longer tokens');

// Regression: the exact highlighted terms from the PoE budget lesson open full term tooltips.
const poeDiagnosticText = 'Совместимым PoE-тестером проверь класс. Не путай «порт up» с «питание есть».';
const poeDiagnosticParts = splitGlossaryText(poeDiagnosticText);
assert.equal(poeDiagnosticParts.map(part => part.text).join(''), poeDiagnosticText);
assert.deepEqual(
  poeDiagnosticParts.filter(part => part.term).map(part => part.term),
  ['PoE-тестером', 'порт up'],
  'PoE diagnostic phrases must be recognized as full tokens rather than the nested PoE word',
);
for (const term of ['PoE-тестер', 'PoE-тестером', 'порт up']) {
  assert.ok(GLOSSARY[term]?.description, 'missing glossary entry: ' + term);
  assert.ok(GLOSSARY_TOOLTIPS[term]?.summary, 'missing hover tooltip: ' + term);
}
assert.match(GLOSSARY_TOOLTIPS['порт up'].summary, /физическое соединение.*не доказывает достаточность PoE-питания/u);
assert.match(GLOSSARY_TOOLTIPS['PoE-тестером'].summary, /под нагрузкой.*ток и мощность/u);
assert.ok(!splitGlossaryText('PoE-тестеромX').some(part => part.term === 'PoE-тестером'), 'do not match inside a longer token');

console.log(`PASS: ${GLOSSARY_ABBREVIATIONS.length} abbreviations, ${Object.keys(GLOSSARY_TOOLTIPS).length} complete tooltips; boundaries and longest matches`);
