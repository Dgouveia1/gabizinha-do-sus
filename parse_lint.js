const fs = require('fs');

try {
  let raw = fs.readFileSync('lint_plain.json', 'utf8');
  // npm might add `> gabizinha-do-sus@0.0.0 lint` and `> eslint . --format json`
  const lines = raw.split('\n');
  const jsonLines = lines.filter(l => !l.startsWith('>'));
  const jsonStr = jsonLines.join('\n');
  
  const parsed = JSON.parse(jsonStr);
  parsed.forEach(file => {
    if(file.messages.length > 0) {
      console.log(`File: ${file.filePath.split('\\gabizinha-do-sus\\')[1] || file.filePath}`);
      file.messages.forEach(m => {
        console.log(`  Line ${m.line}: ${m.message} (${m.ruleId}) [${m.severity === 2 ? 'Error' : 'Warning'}]`);
      });
      console.log('');
    }
  });
} catch (e) {
  console.error(e);
}
