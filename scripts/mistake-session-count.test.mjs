import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/components/ExamView.tsx', import.meta.url), 'utf8');
const handler = source.match(/onReviewMistakes=\{\(\) => \{([\s\S]*?)\}\} onOpenVisualL1=/)?.[1];
assert.ok(handler, 'Mistake review handler must exist');
assert.match(handler, /const pool = getMistakeQuestions\(\)/);
assert.match(handler, /startNewQuiz\(pool,\s*5\)/, 'Mistake sessions must request exactly five questions');
assert.doesNotMatch(handler, /startNewQuiz\(pool,\s*20\)/);
assert.match(source, /requestedCount:\s*count/, 'Session should record actual requested count');
console.log('PASS: mistake review requests five questions, not the default 20');
