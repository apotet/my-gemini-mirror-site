import assert from 'node:assert/strict';
import { bundleEntry } from './load-bank.mjs';

const study = await bundleEntry('scripts/in-depth-entry.ts', 'l3-known-findings.mjs');
function checkedQuestion(id, correct) {
  const question = study.ALL_QUESTIONS.find(q => q.id === id);
  assert.ok(question, id);
  assert.deepEqual(question.correct, [correct], id + ': unchanged key');
  return study.getQuestionDeepDive(question);
}
const tftp = checkedQuestion('gen-port-9', 1);
assert.match(tftp.pro, /Opcode=5.*ErrorCode=5.*Unknown transfer ID/);
assert.match(tftp.practicalTip, /RRQ.*WRQ.*ответ.*UDP/);
const tftpLesson = study.getLessonForQuestion('gen-port-9');
assert.equal(tftpLesson.id, 'l7-udp-transactions-tftp-ntp-snmp');
assert.ok(tftpLesson.professional.blocks.some(b => /Opcode=5.*кодом ошибки 5/.test(b.body)));
const dns = checkedQuestion('gen-transport-6', 2);
assert.match(dns.practicalTip, /TC=1.*QNAME\/QTYPE.*TCP\/53.*тому же резолверу/);
assert.match(dns.practicalTip, /может уже быть открыто/);
assert.match(dns.deepAnalysis, /готовое соединение или открывая новое/);
assert.match(dns.professional.deep, /handshake будет виден, только если соединение новое/);
const http = checkedQuestion('l7-new-05', 1);
assert.equal(http.hasIndividualDeep, true);
assert.match(http.plain, /нулём.*X-Trace: ok.*Пустая строка/);
assert.match(http.pro, /RFC 9112 §7\.1.*last-chunk.*trailer fields/);
assert.match(http.pro, /«0» с CRLF.*«X-Trace: ok» с CRLF.*ещё один CRLF/);
assert.doesNotMatch(http.pro, /\r/);
assert.match(http.commonTrap, /концом всего сообщения.*пустая строка/);
assert.equal(study.getLessonForQuestion('l7-new-05'), undefined, 'No invented lesson route');
console.log('PASS: existing TFTP and DNS findings resolved; distinct HTTP plain/pro and trap; all three keys unchanged');
