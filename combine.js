const fs = require('fs');
const path = require('path');

const filesToCombine = [
  'discovery/1_project_analysis_report.md',
  'discovery/2_asset_inventory.md',
  'discovery/3_screen_inventory.md',
  'discovery/4_navigation_map.md',
  'discovery/5_user_flow.md',
  'discovery/6_folder_structure.md',
  'discovery/7_phases_and_completion.md',
  'discovery/Connify_System_Architecture.md',
  'discovery/ui_analysis_result.json',
  'README.md'
];

const outputFile = path.join(__dirname, 'combined_documentation.txt');
let combinedContent = '';

for (const file of filesToCombine) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    combinedContent += `\n\n================================================================================\n`;
    combinedContent += `=== FILE: ${file} ===\n`;
    combinedContent += `================================================================================\n\n`;
    combinedContent += content;
  } else {
    console.error(`File not found: ${filePath}`);
  }
}

fs.writeFileSync(outputFile, combinedContent, 'utf-8');
console.log(`Combined content written to: ${outputFile}`);
