const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const projectRoot = path.resolve(__dirname, '..');
const clientDir = path.join(projectRoot, 'client');
const publicDir = path.join(projectRoot, 'public');

if (!fs.existsSync(clientDir)) {
  console.log('No client directory to build. Skipping.');
  process.exit(0);
}

console.log('Building client -> copying', clientDir, 'to', publicDir);
copyRecursiveSync(clientDir, publicDir);
console.log('Client build: files copied to public/');
