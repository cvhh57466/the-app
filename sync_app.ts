import fs from 'fs';
import path from 'path';

function walkList(dirPath: string): string[] {
  let results: string[] = [];
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.next') continue;
    const fullSource = path.join(dirPath, file);
    if (fs.statSync(fullSource).isDirectory()) {
       results = results.concat(walkList(fullSource));
    } else {
       results.push(fullSource);
    }
  }
  return results;
}

console.log("Files in GitHub repo:");
console.log(walkList('./downloaded_repo').join('\n'));
