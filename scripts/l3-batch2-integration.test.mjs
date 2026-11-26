import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bundleEntry } from './load-bank.mjs';

const routes = [
  ['review-prp-12', 'l2-prp-redundancy', 'prp-failover-no-wait', /отказ|восстанов/i],
  ['review-prp-13', 'l2-prp-redundancy', 'prp-rct-dedup-key', /RCT/i],
  ['l7-new-06', 'l7-tls-handshake-alpn', 'tls13-handshake-app-data', /Finished/i],
  ['l57-x18', 'l7-tls-handshake-alpn', 'tls-sni-cert-selection', /SNI/i],
  ['gap-pack3-20', 'l7-tls-handshake-alpn', 'tls-alpn-h2-preface', /h2/i],
  ['l57-x10', 'l7-smtp-delivery-queues', 'smtp-data-451-retry', /451/],
  ['gap-pack3-16', 'l7-smtp-delivery-queues', 'smtp-rcpt-per-recipient-queue', /450/],
  ['gap-pack3-04', 'l3-tunnels-gre-vxlan', 'gre-mtu-1476-calc', /1476/],
  ['gap-pack3-05', 'l3-tunnels-gre-vxlan', 'vxlan-vni-tenant-isolation', /VNI/i],
  ['gap-pack3-19', 'l7-ssh-tunneling-proxyjump', 'ssh-proxyjump-no-agent-fwd', /ProxyJump/i],
];
const assets = new Map([
  ['l2-prp-redundancy', 'l3-prp-dual-lan-rct.svg'],
  ['l7-tls-handshake-alpn', 'l3-tls13-handshake-alpn.svg'],
  ['l7-smtp-delivery-queues', 'l3-smtp-transaction-queues.svg'],
  ['l3-tunnels-gre-vxlan', 'l3-tunnels-gre-vxlan-headers.svg'],
  ['l7-ssh-tunneling-proxyjump', 'l3-ssh-forwarding-proxyjump.svg'],
]);
const glossary = {
  DANP: 'l2-prp-redundancy', RedBox: 'l2-prp-redundancy', RCT: 'l2-prp-redundancy',
  'TLS 1.3': 'l7-tls-handshake-alpn', ALPN: 'l7-tls-handshake-alpn',
  CertificateVerify: 'l7-tls-handshake-alpn',
  VXLAN: 'l3-tunnels-gre-vxlan', VTEP: 'l3-tunnels-gre-vxlan', VNI: 'l3-tunnels-gre-vxlan',
  ProxyJump: 'l7-ssh-tunneling-proxyjump', 'Agent Forwarding': 'l7-ssh-tunneling-proxyjump',
  'Local Port Forwarding': 'l7-ssh-tunneling-proxyjump',
};
const m = await bundleEntry('scripts/in-depth-entry.ts', 'l3-batch2-integration.mjs');
const owner = (id, lessonId) => {
  assert.ok(m.ALL_QUESTIONS.some(q => q.id === id), `${id}: real question`);
  assert.equal(m.getLessonForQuestion(id)?.id, lessonId, `${id}: resolver target`);
  assert.deepEqual(m.LESSONS.filter(l => l.relatedQuestionIds.includes(id)).map(l => l.id), [lessonId], `${id}: only one lesson owner`);
};
assert.equal(new Set(routes.map(([, , anchor]) => anchor)).size, 10);
for (const [id, lessonId, anchor, concept] of routes) {
  owner(id, lessonId);
  assert.equal(m.getLessonSectionForQuestion(lessonId, id), anchor, id);
  for (const mode of ['plain', 'professional']) {
    const matches = m.getLessonBlocksWithSections(m.getLesson(lessonId), mode).filter(b => b.anchorId === anchor);
    assert.equal(matches.length, 1, `${id}/${mode}: one actual anchor`);
    assert.match(matches[0].body, concept, `${id}/${mode}: relevant section body`);
  }
}
owner('l57-d01', 'tls-sni');
owner('gap-pack2-15', 'l7-services');
assert.equal(m.GLOSSARY.SAN.lessonId, 'tls-sni');
assert.doesNotMatch(JSON.stringify(m.getLesson('l2-prp-redundancy')), /\bSAN\b/);
for (const [term, lessonId] of Object.entries(glossary)) {
  assert.equal(m.GLOSSARY[term]?.lessonId, lessonId);
  assert.deepEqual(m.splitGlossaryText(term), [{ text: term, term }]);
  assert.ok(m.GLOSSARY_TOOLTIPS[term]?.summary);
}
const checkIds = new Set();
for (const [lessonId, file] of assets) {
  const lesson = m.getLesson(lessonId);
  assert.equal(lesson.difficulty, 'applied');
  assert.equal(m.LESSONS.filter(l => l.id === lessonId).length, 1);
  for (const section of [lesson, lesson.professional]) {
    const images = section.blocks.flatMap(b => [b.image?.sprite, b.cheatsheet?.file]);
    assert.ok(images.includes(file), `${lessonId}: ${file} in both styles`);
  }
  assert.match(readFileSync(`public/lesson-images/${file}`, 'utf8'), /<svg\b/);
  for (const item of [...lesson.knowledgeCheck.questions, ...lesson.plainKnowledgeCheck.questions]) {
    assert.ok(!checkIds.has(item.id), item.id);
    checkIds.add(item.id);
    const ids = item.choices.map(choice => choice.id);
    assert.equal(ids.length, 4);
    assert.equal(new Set(ids).size, 4);
    assert.ok(ids.includes(item.correctChoiceId));
    assert.ok(item.explanation.trim());
  }
}
assert.equal(checkIds.size, 35);
console.log('PASS: 10 exact routes × 2 modes, 2 preserved owners, 12 live glossary terms, 5 diagrams, 35 self-checks');
