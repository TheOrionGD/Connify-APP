const fs = require('fs');
const path = require('path');

const filesToCombine = [
  { file: 'discovery/1_project_analysis_report.md', title: 'Part 1: Project Overview & Analysis' },
  { file: 'README.md', title: 'Part 2: System Architecture & Tech Stack' },
  { file: 'discovery/5_user_flow.md', title: 'Part 3: User Flows & State Machines' },
  { file: 'discovery/4_navigation_map.md', title: 'Part 4: Navigation & Routing' },
  { file: 'discovery/3_screen_inventory.md', title: 'Part 5: Screen Inventory' },
  { file: 'discovery/2_asset_inventory.md', title: 'Part 6: Asset Inventory' },
  { file: 'discovery/6_folder_structure.md', title: 'Part 7: Folder Structure' },
  { file: 'discovery/7_phases_and_completion.md', title: 'Part 8: Phases & Completion Status' }
];

const outputFile = path.join(__dirname, 'Connify_Master_Documentation.md');
let combinedContent = '# Connify Master Technical Specification\n\n';

// Generate TOC
combinedContent += '## Table of Contents\n';
filesToCombine.forEach((item) => {
  const anchor = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  combinedContent += `- [${item.title}](#${anchor})\n`;
});
combinedContent += '\n---\n\n';

for (const item of filesToCombine) {
  const filePath = path.join(__dirname, item.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Optional: strip out top-level H1 tags from the original files so the TOC structure looks better
    // For example, `# 1. Project Analysis Report` becomes `## 1. Project Analysis Report` or we just remove it
    // since we add our own "Part X" header.
    const lines = content.split('\n');
    if (lines[0].startsWith('# ')) {
      lines.shift(); // remove the first H1
    }
    content = lines.join('\n').trim();

    combinedContent += `\n\n# ${item.title}\n\n`;
    combinedContent += content;
    combinedContent += `\n\n---\n`;
  } else {
    console.error(`File not found: ${filePath}`);
  }
}

fs.writeFileSync(outputFile, combinedContent, 'utf-8');
console.log(`Master document written to: ${outputFile}`);
