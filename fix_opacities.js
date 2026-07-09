const fs = require('fs');

function replaceInFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(search, replace);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
}

// BlockLibrary
replaceInFile('src/components/builder/BlockLibrary.tsx', /hover:bg-white\/5/g, 'hover:bg-black/5');
replaceInFile('src/components/builder/BlockLibrary.tsx', /bg-white\/50/g, 'bg-black/5');

// ConditionNode
replaceInFile('src/components/builder/nodes/ConditionNode.tsx', /bg-white\/60/g, 'bg-black/5');

// leaderboard
replaceInFile('src/app/leaderboard/page.tsx', /hover:bg-white\/\[0\.02\]/g, 'hover:bg-black/[0.02]');

// builder/page.tsx
replaceInFile('src/app/builder/page.tsx', /hover:bg-white\/5 focus:bg-white\/5/g, 'hover:bg-black/5 focus:bg-black/5');

// FeeTransparency
replaceInFile('src/components/home/FeeTransparency.tsx', /hover:bg-white\/\[0\.02\]/g, 'hover:bg-black/[0.02]');

// FeaturesGrid
replaceInFile('src/components/home/FeaturesGrid.tsx', /bg-white\/50/g, 'bg-black/5');

// button.tsx
replaceInFile('src/components/ui/button.tsx', /hover:bg-white\/5/g, 'hover:bg-black/5');

console.log("Fixes applied.");
