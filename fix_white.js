const fs = require('fs');

function replaceInFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(search, replace);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
}

// 1. BlockLibrary
replaceInFile('src/components/builder/BlockLibrary.tsx', /group-hover:text-white/g, 'group-hover:text-text-primary');

// 2. ConditionNode
replaceInFile('src/components/builder/nodes/ConditionNode.tsx', /text-white/g, 'text-text-primary');

// 3. ExecuteNode
replaceInFile('src/components/builder/nodes/ExecuteNode.tsx', /text-white/g, 'text-text-primary');

// 4. TriggerNode
replaceInFile('src/components/builder/nodes/TriggerNode.tsx', /text-white\/80/g, 'text-text-secondary');
replaceInFile('src/components/builder/nodes/TriggerNode.tsx', /text-white/g, 'text-text-primary');

// 5. builder/page.tsx
replaceInFile('src/app/builder/page.tsx', /bg-black\/40/g, 'bg-bg-elevated');

// 6. marketplace/[id]/page.tsx
replaceInFile('src/app/marketplace/[id]/page.tsx', /hover:text-white/g, 'hover:text-text-primary');

// 7. creator/[id]/page.tsx
replaceInFile('src/app/creator/[id]/page.tsx', /hover:text-white/g, 'hover:text-text-primary');

// 8. Logo.tsx
replaceInFile('src/components/ui/Logo.tsx', /text-white/g, 'text-text-primary');

// 9. HowItWorks.tsx
replaceInFile('src/components/home/HowItWorks.tsx', /text-white/g, 'text-text-primary');

// 10. Hero.tsx
replaceInFile('src/components/home/Hero.tsx', /text-white/g, 'text-text-primary');

console.log("Fixes applied.");
