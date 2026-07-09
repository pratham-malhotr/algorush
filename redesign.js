const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace Tailwind hardcoded bg colors with semantic variables
  content = content.replace(/bg-\[#0A0C10\]/g, 'bg-bg-base');
  content = content.replace(/bg-\[#0F1318\]/g, 'bg-bg-surface');
  content = content.replace(/bg-\[#151B24\]/g, 'bg-bg-elevated');
  content = content.replace(/bg-\[#070A0D\]/g, 'bg-white');
  
  // Replace Tailwind border colors
  content = content.replace(/border-\[#1E2836\]/g, 'border-bg-border');

  // Replace Recharts tooltips
  content = content.replace(/backgroundColor:\s*['"]#151B24['"]/g, "backgroundColor: 'var(--color-bg-elevated)'");
  content = content.replace(/borderColor:\s*['"]#1E2836['"]/g, "borderColor: 'var(--color-bg-border)'");
  content = content.replace(/border:\s*['"]1px solid #1E2836['"]/g, "border: '1px solid var(--color-bg-border)'");
  content = content.replace(/stroke="?#1E2836"?/g, "stroke=\"var(--color-bg-border)\"");

  // ReactFlow Canvas
  content = content.replace(/color="?#1E2836"?/g, 'color="#E2E8F0"');
  content = content.replace(/backgroundColor:\s*['"]#0F1318['"]/g, "backgroundColor: 'var(--color-bg-surface)'");

  // Hero Canvas
  content = content.replace(/radial-gradient\(circle, #1E2836/g, "radial-gradient(circle, #E2E8F0");
  content = content.replace(/"#1E2836"/g, '"#E2E8F0"');

  // Any remaining stray hardcoded text colors that were light
  content = content.replace(/text-\[#F8FAFC\]/g, 'text-text-primary');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
