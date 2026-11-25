/** Issue edit mode is text-only. Compare complete ASTs, including code outside
 * the lesson object, before any candidate is compiled or imported by a test.
 * Manual Kimi structural permissions are intentionally unchanged.
 */
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const textFields = new Set(['body', 'summary', 'title', 'label', 'explanation', 'question', 'prompt', 'hint', 'text', 'description']);
function skeleton(path) {
  const sf = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
  if (sf.parseDiagnostics.length) throw new Error('Invalid candidate TypeScript');
  function visit(node) {
    const parent = node.parent;
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
        parent && ts.isPropertyAssignment(parent) && parent.initializer === node &&
        textFields.has(parent.name.text)) return ['editable-text'];
    const children = [];
    ts.forEachChild(node, child => { children.push(visit(child)); });
    // Leaf token text preserves IDs, imports, expressions, operators and literals.
    return [node.kind, children.length ? children : node.getText(sf)];
  }
  return visit(sf);
}
if (JSON.stringify(skeleton(process.argv[2])) !== JSON.stringify(skeleton(process.argv[3]))) {
  console.error('Issue edit may change text literals only; executable code/structure/IDs changed');
  process.exitCode = 1;
}
