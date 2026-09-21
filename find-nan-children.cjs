const fs = require('fs');
const path = require('path');

const tsxFiles = fs.readdirSync('.').filter(f => f.endsWith('.tsx'));

tsxFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check for patterns like >{...}< or >...{...}...< or td/div/span containing calculations or variables
    // Especially looking for division / or .toFixed or parseInt or Number() or expressions without fallback
    const matches = line.match(/\{([^}]+)\}/g);
    if (matches) {
      matches.forEach(m => {
        const expr = m.slice(1, -1).trim();
        // If expr contains division or Math. or toFixed or parseInt or parseFloat
        if (expr.includes('/') || expr.includes('toFixed') || expr.includes('Math.') || expr.includes('parseInt') || expr.includes('parseFloat')) {
          // Check if this line is in JSX (has < or > or appears inside return)
          console.log(`${file}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  });
});
