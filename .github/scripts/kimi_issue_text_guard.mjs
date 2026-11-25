/** Issue edits may change approved text literals only. Compare the complete
 * canonical AST print, preserving operator/flag fields that forEachChild omits.
 * Manual Kimi structural permissions are intentionally unchanged.
 */
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const textFields = new Set(['body', 'summary', 'title', 'label', 'explanation', 'question', 'prompt', 'hint', 'text', 'description']);
function skeleton(path) {
  const sf = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
  if (sf.parseDiagnostics.length) throw new Error('Invalid candidate TypeScript');
  const transformed = ts.transform(sf, [context => {
    function visit(node) {
      const parent = node.parent;
      if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
          parent && ts.isPropertyAssignment(parent) && parent.initializer === node &&
          textFields.has(parent.name.text)) return ts.factory.createStringLiteral('__KIMI_EDITABLE_TEXT__');
      return ts.visitEachChild(node, visit, context);
    }
    return root => ts.visitNode(root, visit);
  }]);
  try {
    return ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed }).printFile(transformed.transformed[0]);
  } finally {
    transformed.dispose();
  }
}
if (skeleton(process.argv[2]) !== skeleton(process.argv[3])) {
  console.error('Issue edit may change text literals only; executable code/structure/IDs changed');
  process.exitCode = 1;
}
