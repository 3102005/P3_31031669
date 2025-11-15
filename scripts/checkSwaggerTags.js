const YAML = require('yamljs');
const fs = require('fs');
const path = './swagger.yaml';
try {
  const doc = YAML.load(path);
  const declared = (doc.tags || []).map(t => t.name);
  const used = new Set();
  const paths = doc.paths || {};
  for (const p of Object.keys(paths)) {
    const ops = paths[p];
    for (const m of Object.keys(ops)) {
      const op = ops[m];
      if (op && op.tags) {
        op.tags.forEach(t => used.add(t));
      }
    }
  }
  const usedArray = Array.from(used);
  console.log('Declared tags:', declared);
  console.log('Used tags   :', usedArray);
  const unused = declared.filter(t => !used.has(t));
  if (unused.length) {
    console.log('Unused tags  :', unused);
  } else {
    console.log('No unused tags.');
  }
} catch (err) {
  console.error('Error parsing swagger:', err.message);
  process.exit(1);
}
