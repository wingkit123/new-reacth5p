// scripts/copy-h5p-assets.js
const fs = require('fs-extra');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const from = path.join(projectRoot, 'node_modules', 'h5p-standalone', 'dist');
const to = path.join(projectRoot, 'public', 'assets', 'h5p-player');

try {
  fs.removeSync(to);
  fs.copySync(from, to);
  console.log('✅ Copied h5p-standalone dist ->', to);
} catch (err) {
  console.error('❌ Failed to copy h5p-standalone dist:', err);
  process.exit(1);
}
