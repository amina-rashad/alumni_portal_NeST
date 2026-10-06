const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src/pages');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const regex = /https:\/\/images\.unsplash\.com\/photo-[^\"\'\s\)\`]+/g;
  if (regex.test(content)) {
    content = content.replace(regex, '/placeholder.jpg');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Replaced in ' + file);
    count++;
  }
});

console.log('Done! Replaced in ' + count + ' files.');
