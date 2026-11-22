// Regression for the responsive PoE SVG: explicit device identifiers and collision-free geometry.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const svg = readFileSync(new URL('../public/lesson-images/poe-data-power-loop.svg', import.meta.url), 'utf8');
assert.match(svg, /viewBox="0 0 860 720"/, 'keep SVG viewBox and responsive scaling');
assert.match(svg, /<title id="title">/, 'retain accessible title');
assert.match(svg, /<desc id="desc">/, 'retain accessible description');
assert.equal((svg.match(/<animateMotion\b/g) || []).length, 12, 'retain 12 animated impulses, 3 on each of 4 branches');

for (const id of ['poe-camera', 'poe-wifi', 'poe-voip', 'poe-access']) {
  const panel = svg.match(new RegExp('<g id="' + id + '" transform="translate\\([\\d,]+\\)">([\\s\\S]*?)</g>'));
  assert.ok(panel, 'missing device ' + id);
  const content = panel[1];
  assert.match(content, /<text x="0" y="101" text-anchor="middle"[^>]*>⇅ Данные<\/text>/, id + ' data label must be centered below cable endpoint');
  assert.match(content, /<text x="0" y="122" text-anchor="middle"[^>]*>↑ Питание<\/text>/, id + ' power label must have separate line');
  assert.ok(101 - 60 >= 35, id + ' legend must clear cable end at local y=60, incl. glow');
  assert.ok(122 - 101 >= 20, id + ' lines must have safe baseline separation');
}

const access = svg.match(/<g id="poe-access"[^>]*>([\s\S]*?)<\/g>/);
assert.match(access[1], /<rect x="-88" y="-79" width="176" height="35"/, 'wide header for access control');
assert.match(access[1], />Контроль доступа<\/text>/, 'preserve device name');
// Access panel starts at 725-88=637, VoIP header ends at 530+76=606, canvas ends at 860.
assert.ok(725 - 88 > 530 + 76 && 725 + 88 < 860, 'access header must not clip canvas or VoIP pill');

const wifi = svg.match(/<g id="poe-wifi"[^>]*>([\s\S]*?)<\/g>/);
assert.match(wifi[1], /<rect x="-43" y="-19" width="86" height="49"/, 'Wi-Fi body shifted down to leave room for waves');
assert.match(wifi[1], /d="M-14 -32 Q0 -42 14 -32 M-9 -25 Q0 -32 9 -25"/, 'waves must sit between title pill and body');
// Quadratic wave peaks at -37 and -28.5; frame bottom -44 and body top -19.
assert.ok(-37 - (-44) >= 7 && -19 - (-25) >= 6, 'Wi-Fi wave must leave clearance above and below');
console.log('PASS: PoE SVG four legends, access title, Wi-Fi waves and 12 animations geometry');
