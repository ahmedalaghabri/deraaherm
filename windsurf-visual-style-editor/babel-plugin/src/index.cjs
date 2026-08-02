const path = require('node:path');
const crypto = require('node:crypto');

module.exports = function visualStyleEditorBabelPlugin({ types: t }) {
  return {
    name: 'visual-style-editor-source-ids',
    visitor: {
      JSXOpeningElement(nodePath, state) {
        const node = nodePath.node;
        if (!t.isJSXIdentifier(node.name) || !/^[a-z]/.test(node.name.name)) return;
        if (node.attributes.some(a => t.isJSXAttribute(a) && a.name.name === 'data-vse-id')) return;
        const filename = state.file.opts.filename || 'unknown';
        const root = state.opts.root || process.cwd();
        const relative = path.relative(root, filename).replace(/\\/g, '/');
        const line = node.loc?.start.line || 0;
        const column = node.loc?.start.column || 0;
        const id = crypto.createHash('sha1').update(`${relative}:${line}:${column}`).digest('hex').slice(0, 12);
        node.attributes.push(t.jsxAttribute(t.jsxIdentifier('data-vse-id'), t.stringLiteral(id)));
        node.attributes.push(t.jsxAttribute(t.jsxIdentifier('data-vse-file'), t.stringLiteral(relative)));
        node.attributes.push(t.jsxAttribute(t.jsxIdentifier('data-vse-line'), t.stringLiteral(String(line))));
      }
    }
  };
};
