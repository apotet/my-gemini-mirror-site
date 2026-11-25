/** Source-only lesson index. Never evaluates lesson code. */
import ts from './zai-runtime/node_modules/typescript/lib/typescript.js';
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const unwrap = n => {
  while (n && (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isSatisfiesExpression(n) || ts.isTypeAssertionExpression(n))) n = n.expression;
  return n;
};
const literal = n => {
  n = unwrap(n);
  return n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : undefined;
};
export function parseLessons(source, path) {
  const sf = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  if (sf.parseDiagnostics.length) throw new Error(`Invalid TypeScript: ${path}`);
  const lessons = [];
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const props = new Map();
      for (const p of node.properties) {
        if (!ts.isPropertyAssignment(p) || ts.isComputedPropertyName(p.name)) continue;
        const key = p.name.text;
        if (props.has(key)) throw new Error(`Duplicate property ${key}: ${path}`);
        props.set(key, unwrap(p.initializer));
      }
      // A link/id-title pair is not a lesson. Require the actual content schema.
      const regular = props.has('blocks') && props.has('relatedQuestionIds');
      const expert = path === 'src/data/expertCases177.ts' && props.has('plain') && props.has('professional');
      const id = literal(props.get('id')), title = literal(props.get('title'));
      if (id && title && (regular || expert)) {
        const q = props.get('relatedQuestionIds');
        if (q && (!ts.isArrayLiteralExpression(q) || q.elements.some(e => literal(e) === undefined)))
          throw new Error(`Nonliteral question IDs: ${id}`);
        if (node.properties.some(p => ts.isSpreadAssignment(p) || (p.name && ts.isComputedPropertyName(p.name))))
          throw new Error(`Dynamic lesson properties: ${id}`);
        lessons.push({ path, id, title, questionIds: q ? q.elements.map(literal) : [], content: source.slice(node.getStart(sf), node.end) });
        return; // Never index nested blocks, knowledge checks or navigation as lessons.
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return lessons;
}
export function indexLessons() {
  const paths = readdirSync('src/data/lessons').filter(p => p.endsWith('.ts')).sort().map(p => `src/data/lessons/${p}`);
  paths.push('src/data/expertCases177.ts');
  const lessons = paths.flatMap(p => parseLessons(readFileSync(p, 'utf8'), p));
  return validateIndex(lessons);
}
export function validateIndex(lessons) {
  const ids = new Set();
  for (const lesson of lessons) {
    const key = lesson.id.toLowerCase();
    if (ids.has(key)) throw new Error(`Duplicate lesson ID: ${lesson.id}`);
    ids.add(key);
  }
  return lessons;
}
export function resolveLesson(selector, lessons = indexLessons()) {
  const matches = lessons.filter(l => l.id.toLowerCase() === selector.toLowerCase());
  if (matches.length !== 1) throw new Error(`Lesson selector must resolve exactly one definition, got ${matches.length}`);
  return matches[0];
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.stdout.write(JSON.stringify(process.argv[2] === '--index' ? indexLessons() : resolveLesson(process.argv[2]))); }
  catch (e) { console.error(e.message); process.exitCode = 1; }
}
