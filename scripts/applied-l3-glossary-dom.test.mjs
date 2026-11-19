import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

// Real SSR markup from the same FormattedExplanation / GlossaryText components as the UI.
mkdirSync(resolve('scripts/.cache'), { recursive: true });
const outfile = resolve('scripts/.cache/applied-l3-glossary-dom.mjs');
await build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import { FormattedExplanation } from './src/components/FormattedExplanation';
      import { getLesson } from './src/data/lessons';
      export const renderInline = text => renderToStaticMarkup(React.createElement(FormattedExplanation, { text }));
      export const renderLesson = (lessonId, style) => {
        const lesson = getLesson(lessonId);
        const blocks = style === 'pro' ? lesson.professional.blocks : lesson.blocks;
        return renderToStaticMarkup(React.createElement('section', null,
          ...blocks.map(block => React.createElement('section', { key: block.heading },
            React.createElement('h3', null, block.heading),
            React.createElement(FormattedExplanation, { text: block.body })))));
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: 'applied-l3-glossary-dom-entry.tsx',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  external: ['react', 'react-dom', 'react-dom/server', 'lucide-react'],
  logLevel: 'silent',
});
const { renderLesson, renderInline } = await import(pathToFileURL(outfile).href);
const expected = {
  'l4-applied-tcp-session-flows': ['SFTP', 'PASV', 'STARTTLS', 'LDAP Bind', 'LDAP Search'],
  'l7-udp-transactions-tftp-ntp-snmp': ['GetBulk'],
};
let assertions = 0;
for (const [lessonId, terms] of Object.entries(expected)) {
  for (const style of ['plain', 'pro']) {
    const html = renderLesson(lessonId, style);
    for (const term of terms) {
      assert.ok(html.includes('data-glossary-term="' + term + '"'),
        lessonId + '/' + style + ': missing real inline hover/focus trigger ' + term);
      assertions++;
    }
    // Generic English words must not receive context-free LDAP hints.
    if (lessonId === 'l4-applied-tcp-session-flows') {
      assert.ok(!html.includes('data-glossary-term="Bind"')
        && !html.includes('data-glossary-term="Search"'),
        'LDAP operations use scoped tokens, not global English words');
    }
  }
}
// The actual interactive GlossaryText component must render ONE tooltip trigger
// for S/FTP (shielded cable), not the nested FTP file-transfer acronym.
const cableInline = renderInline('F/UTP, U/FTP, S/FTP; FTP, SFTP, TFTP.');
const inlineTerms = [...cableInline.matchAll(/data-glossary-term="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(inlineTerms, ['F/UTP', 'U/FTP', 'S/FTP', 'FTP', 'SFTP', 'TFTP'],
  'rendered glossary triggers distinguish cable shielding from file transfer');
assert.match(cableInline, /data-glossary-term="S\/FTP"/, 'exact S/FTP popup trigger');
assert.equal(renderInline('Пример X/FTP').includes('data-glossary-term="FTP"'), false,
  'unknown slash composite does not produce bogus file-transfer hints');
console.log('PASS: shared explanation DOM renders cable S/FTP tooltip separately from FTP/SFTP');
console.log('PASS: ' + assertions + ' actual DOM glossary hover/focus triggers across two L3 lessons and both styles');
