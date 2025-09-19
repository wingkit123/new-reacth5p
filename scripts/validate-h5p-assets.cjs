const fs = require('fs');
const path = require('path');
const glob = require('glob');

const root = path.resolve(__dirname, '..');
const h5pRoot = path.join(root, 'public', 'h5p');

function exists(p) {
  try { fs.accessSync(p, fs.constants.R_OK); return true; } catch { return false; }
}

function main() {
  const libs = glob.sync(path.join(h5pRoot, '**', 'library.json'));
  let missing = [];
  libs.forEach(libPath => {
    const dir = path.dirname(libPath);
    try {
      const json = JSON.parse(fs.readFileSync(libPath, 'utf8'));
      const items = [];
      (json.preloadedCss || []).forEach(i => items.push(i.path));
      (json.preloadedJs || []).forEach(i => items.push(i.path));
      items.forEach(rel => {
        const abs = path.join(dir, rel);
        if (!exists(abs)) {
          missing.push({ lib: libPath.replace(root + path.sep, ''), file: rel });
        }
      });
    } catch (e) {
      console.error('Failed to parse', libPath, e.message);
    }
  });

  if (missing.length) {
    console.error('Missing H5P asset files referenced in library.json:');
    missing.forEach(m => console.error(` - ${m.lib} -> ${m.file}`));
    process.exit(2);
  } else {
    console.log('All referenced H5P assets exist.');
  }
}

main();
