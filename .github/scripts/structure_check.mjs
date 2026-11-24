#!/usr/bin/env node
/**
 * Структурная проверка кандидата урока через AST TypeScript (привязка к объектам).
 *
 * Использование: node structure_check.mjs <original.ts> <candidate.ts> <report.txt>
 * Требует классический API typescript 5.x (в workflow ставится --no-save typescript@5.9.3,
 * т.к. репозиторий пинует typescript 7 с несовместимым native API).
 *
 * Проверяется:
 *   - синтаксическая валидность кандидата (любая parse error -> 20);
 *   - совпадение имени экспортируемой константы (-> 21);
 *   - равенство множества ключей верхнего уровня;
 *   - для каждого блока (blocks / professional), идентифицируемого по heading:
 *     совпадение мультимножества "id" в поддереве (кроме согласованно редактируемого
 *     relatedLesson) и списка иллюстраций cheatsheet.file; порядок блоков может меняться;
 *   - для каждого вопроса (knowledgeCheck.questions / plainKnowledgeCheck.questions),
 *     идентифицируемого по "id": совпадение упорядоченного списка id вариантов,
 *     correctChoiceId и иллюстраций; перестановка правильных ответов между вопросами
 *     глобальным мультимножеством не скрывается — ловится на уровне объекта;
 *   - согласованные изменения: relatedLesson, содержимое body/summary/label/explanation.
 *
 * Коды выхода: 0 ок; 20 синтаксис; 21 экспорт; 22 структурное расхождение.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';

const [origPath, candPath, reportPath] = process.argv.slice(2);
const report = [];
const say = (s) => { report.push(s); console.log(s); };

const propName = (name) =>
  ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) ? name.text : null;

function getExportObjectLiteral(path) {
  const text = readFileSync(path, 'utf8');
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ESNext, true);
  const errors = sf.parseDiagnostics ?? [];
  if (errors.length) {
    for (const e of errors.slice(0, 5)) {
      const { line, character } = sf.getLineAndCharacterOfPosition(e.start);
      say(`SYNTAX ${path}:${line + 1}:${character + 1} ${ts.flattenDiagnosticMessageText(e.messageText, ' ')}`);
    }
    process.exitCode = 20;
    return null;
  }
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    if (!stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.initializer && ts.isObjectLiteralExpression(decl.initializer)) {
        return { exportName: decl.name.text, obj: decl.initializer };
      }
    }
  }
  process.exitCode = 21;
  say(`EXPORT объектовый литерал не найден в ${path}`);
  return null;
}

function strProp(obj, key) {
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p) && propName(p.name) === key && ts.isStringLiteralLike(p.initializer)) {
      return p.initializer.text;
    }
  }
  return null;
}

function arrProp(obj, key) {
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p) && propName(p.name) === key && ts.isArrayLiteralExpression(p.initializer)) {
      return p.initializer.elements.filter((e) => ts.isObjectLiteralExpression(e));
    }
  }
  return [];
}

function objProp(obj, key) {
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p) && propName(p.name) === key && ts.isObjectLiteralExpression(p.initializer)) {
      return p.initializer;
    }
  }
  return null;
}

/** Подпись объекта: мультимножество "id" (минус relatedLesson), список "file", correctChoiceId. */
function signature(obj) {
  const ids = [];
  const files = [];
  let correct = null;
  const visit = (node) => {
    if (ts.isPropertyAssignment(node)) {
      const key = propName(node.name);
      if (key === 'relatedLesson') return; // согласованные изменения ссылок
      const init = node.initializer;
      if (ts.isStringLiteralLike(init)) {
        if (key === 'id') ids.push(init.text);
        else if (key === 'correctChoiceId') correct = init.text;
        else if (key === 'file') files.push(init.text);
      }
      if (key === 'choices' && ts.isArrayLiteralExpression(init)) {
        for (const el of init.elements) {
          if (ts.isObjectLiteralExpression(el)) {
            const cid = strProp(el, 'id');
            if (cid) ids.push(`choice:${cid}`);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(obj);
  return { ids: ids.sort(), files: files.sort(), correct };
}

function analyze(path) {
  const got = getExportObjectLiteral(path);
  if (!got) return null;
  const { exportName, obj } = got;

  const topKeys = obj.properties
    .filter((p) => ts.isPropertyAssignment(p))
    .map((p) => propName(p.name))
    .sort();

  const blocks = {};
  const addBlock = (arrKey, el, n) => {
    const heading = strProp(el, 'heading') ?? `?#${n}`;
    const base = `${arrKey}/${heading}`;
    const key = blocks[base] ? `${base}#${n}` : base;
    blocks[key] = signature(el);
  };
  let n = 0;
  for (const el of arrProp(obj, 'blocks')) addBlock('blocks', el, n++);
  // professional — объект { summary, terms, blocks: [...] }
  const prof = objProp(obj, 'professional');
  n = 0;
  if (prof) for (const el of arrProp(prof, 'blocks')) addBlock('professional', el, n++);

  const questions = {};
  for (const kcKey of ['knowledgeCheck', 'plainKnowledgeCheck']) {
    const kc = objProp(obj, kcKey);
    if (!kc) continue;
    for (const q of arrProp(kc, 'questions')) {
      const qid = strProp(q, 'id');
      if (!qid) continue;
      const sig = signature(q);
      // вытащить упорядоченные варианты отдельно
      const choices = [];
      for (const cp of q.properties) {
        if (ts.isPropertyAssignment(cp) && propName(cp.name) === 'choices' && ts.isArrayLiteralExpression(cp.initializer)) {
          for (const el of cp.initializer.elements) {
            if (ts.isObjectLiteralExpression(el)) {
              const cid = strProp(el, 'id');
              if (cid) choices.push(cid);
            }
          }
        }
      }
      questions[`${kcKey}/${qid}`] = { ...sig, choices };
    }
  }

  return { exportName, topKeys, blocks, questions };
}

function diffMap(name, origMap, candMap) {
  let ok = true;
  const keys = new Set([...Object.keys(origMap), ...Object.keys(candMap)]);
  for (const k of keys) {
    const o = JSON.stringify(origMap[k] ?? null);
    const c = JSON.stringify(candMap[k] ?? null);
    if (o !== c) {
      ok = false;
      say(`FAIL ${name}["${k}"]:`);
      say(`  orig: ${o}`);
      say(`  cand: ${c}`);
    }
  }
  if (ok) say(`PASS ${name} — ${Object.keys(origMap).length} объектов совпали`);
  return ok;
}

const orig = analyze(origPath);
if (process.exitCode === 20 || process.exitCode === 21) { writeFileSync(reportPath, report.join('\n') + '\n'); process.exit(process.exitCode); }
const cand = analyze(candPath);
if (process.exitCode === 20 || process.exitCode === 21) { writeFileSync(reportPath, report.join('\n') + '\n'); process.exit(process.exitCode); }

let failed = false;
const check = (name, ok, detail = '') => { say(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); failed ||= !ok; };

check('export_name', orig.exportName === cand.exportName && cand.exportName !== null, `orig=${orig.exportName} cand=${cand.exportName}`);
check('top_level_keys', JSON.stringify(orig.topKeys) === JSON.stringify(cand.topKeys), `orig=[${orig.topKeys}] cand=[${cand.topKeys}]`);
check('blocks_bound_to_headings', diffMap('blocks', orig.blocks, cand.blocks));
check('questions_bound_to_ids', diffMap('questions', orig.questions, cand.questions));

writeFileSync(reportPath, report.join('\n') + '\n');
if (failed) process.exit(22);
say('[structure] OK');
