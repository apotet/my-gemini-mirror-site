import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';

const m = await bundleEntry('scripts/in-depth-entry.ts', 'l3-batch3-http-crc.mjs');
const http = 'l7-http-framing-ranges-etag';
const crc = 'ts-wireshark-crc-diagnostics';
const ownedRoutes = [
  ['l7-new-05', http, 'http-chunked-trailers', 1, /X-Trace: ok.*(ещё один|последний) CRLF/],
  ['gap-pack3-14', http, 'http-etag-if-match-412', 1, /If-Match.*412/],
  ['tr-06', crc, 'wireshark-tcp-retransmission', 0, /tcp\.analysis\.retransmission/],
  ['tr-07', crc, 'wireshark-ip-addr-filter', 0, /ip\.addr == 10\.1\.1\.10/],
  ['ts-pack1-07', crc, 'interface-crc-delta-snapshots', 1, /счётчик.*(сброс|обнули)/i],
];
assert.equal(m.ALL_QUESTIONS.length, 862);
for (const [id, lessonId, anchor, key, body] of ownedRoutes) {
  const question = m.ALL_QUESTIONS.find(q => q.id === id);
  assert.deepEqual(question?.correct, [key], id);
  assert.equal(m.QUESTION_LEARNING_LEVELS[id]?.learningLevel, 3, id);
  assert.equal(m.getLessonForQuestion(id)?.id, lessonId, id);
  assert.deepEqual(m.LESSONS.filter(l => l.relatedQuestionIds.includes(id)).map(l => l.id), [lessonId], id);
  assert.equal(m.getLessonSectionForQuestion(lessonId, id), anchor, id);
  assert.deepEqual(m.QUESTION_SECTION_LINKS.filter(l => l.questionIds.includes(id)).map(l => l.anchorId), [anchor], id);
  const lesson = m.getLesson(lessonId);
  for (const mode of ['plain', 'professional']) {
    const sections = m.getLessonBlocksWithSections(lesson, mode).filter(b => b.anchorId === anchor);
    assert.equal(sections.length, 1, id + '/' + mode);
    assert.match(sections[0].body, body, id + '/' + mode);
  }
}
assert.equal(m.getLessonForQuestion('gap-pack2-13')?.id, 'l7-services');
assert.deepEqual(m.LESSONS.filter(l => l.relatedQuestionIds.includes('gap-pack2-13')).map(l => l.id), ['l7-services']);
assert.equal(m.GLOSSARY.ETag.lessonId, 'l7-http-status-basics');
assert.equal(m.GLOSSARY.CRC.lessonId, 'l2-ethernet');
assert.equal(m.GLOSSARY.FCS.lessonId, 'osi-pdu');
for (const term of ['Chunked', 'Trailer', 'CRLF', 'Content-Range', 'If-Match', 'Display Filter']) {
  assert.equal(m.GLOSSARY[term]?.lessonId, term === 'Display Filter' ? crc : http);
  assert.ok(m.GLOSSARY_TOOLTIPS[term]?.summary);
  assert.deepEqual(m.splitGlossaryText(term), [{ text: term, term }]);
}
const selfcheckIds = new Set();
for (const [id, picture] of [[http, 'l3-http-framing-ranges-etag.svg'], [crc, 'l3-wireshark-crc-delta.svg']]) {
  const lesson = m.getLesson(id);
  assert.equal(lesson.difficulty, 'applied');
  for (const section of [lesson, lesson.professional]) {
    const sheet = section.blocks.find(block => block.cheatsheet?.file === picture)?.cheatsheet;
    assert.ok(sheet?.title && sheet.alt && sheet.note, id);
    for (const term of section.terms) assert.ok(m.GLOSSARY[term]?.description && m.GLOSSARY_TOOLTIPS[term]?.summary, term);
    assert.ok(section.sources.every(source => source.includes('https://')), id);
  }
  const xml = readFileSync('public/lesson-images/' + picture, 'utf8');
  assert.match(xml, /viewBox="0 0 460 530"/, id);
  assert.doesNotMatch(xml, /<script|<foreignObject|href=|<image\b/i, id);
  for (const check of [lesson.knowledgeCheck, lesson.plainKnowledgeCheck]) {
    assert.equal(check.questions.length, 3);
    for (const item of check.questions) {
      assert.ok(item.prompt.trim() && item.explanation.trim());
      assert.equal(selfcheckIds.has(item.id), false, item.id);
      selfcheckIds.add(item.id);
      const choices = item.choices.map(c => c.id);
      assert.equal(choices.length, 4);
      assert.equal(new Set(choices).size, choices.length);
      assert.ok(choices.includes(item.correctChoiceId));
      assert.ok(item.choices.every(c => c.label.trim()));
    }
  }
  for (const block of [...lesson.blocks, ...lesson.professional.blocks]) {
    if (block.relatedLesson) assert.ok(m.getLesson(block.relatedLesson.id), block.relatedLesson.id);
  }
}
const range = m.getLesson(http).professional.blocks[1].body;
assert.match(range, /2999 − 2000 \+ 1 = 1000/);
assert.match(range, /3000-5999/);
assert.match(range, /If-Range.*игнорирует Range.*200/);
assert.match(m.getLesson(crc).professional.blocks[2].body, /ΔCRC.*CRC\(t2\) − CRC\(t1\).*ifCounterDiscontinuityTime/);
assert.equal(selfcheckIds.size, 12);
console.log('PASS: five exact Applied routes × two modes; existing 206/ETag/CRC/FCS ownership; six tooltips, two SVGs, twelve standalone checks');
