const xl = require('excel4node');
const fs = require('fs');

// Create a new instance of a Workbook class
const wb = new xl.Workbook();

// Add Worksheets
const wsBaseline = wb.addWorksheet('Existing Algorithm Gantt');
const wsSharp = wb.addWorksheet('Custom SHARP Gantt');

// Create styles
const styleHeader = wb.createStyle({
  font: { bold: true, color: '#FFFFFF' },
  fill: { type: 'pattern', patternType: 'solid', bgColor: '#4F81BD', fgColor: '#4F81BD' },
  alignment: { horizontal: 'center' }
});

const styleData = wb.createStyle({
  alignment: { horizontal: 'center' }
});

const styleGanttBar = wb.createStyle({
  fill: { type: 'pattern', patternType: 'solid', bgColor: '#92D050', fgColor: '#92D050' }, // Green bar
});
const styleGanttBarCrit = wb.createStyle({
  fill: { type: 'pattern', patternType: 'solid', bgColor: '#FF0000', fgColor: '#FF0000' }, // Red bar for critical path
});

// Load real data
const dataRaw = fs.readFileSync('o:/PROJECTS/CONNIFY-APP/cpm_real_data_detailed.json');
const allData = JSON.parse(dataRaw);

function renderSheet(ws, tasks, scaleMultiplier) {
  // Setup headers
  const headers = ['ID', 'Task Name', 'Pred', 'Exp. Duration (ms)', 'ES (Early Start)', 'EF (Early Finish)', 'LS (Late Start)', 'LF (Late Finish)', 'Slack', 'Critical Path'];
  
  headers.forEach((h, i) => {
    ws.cell(1, i + 1).string(h).style(styleHeader);
  });

  // Gantt Chart timeline headers (columns 12 to 50)
  for(let i = 0; i <= 38; i++) {
    ws.cell(1, 12 + i).string((i * scaleMultiplier).toFixed(2) + 'ms').style(styleHeader);
    ws.column(12 + i).setWidth(6);
  }

  tasks.forEach((t, index) => {
    const row = index + 2;
    ws.cell(row, 1).number(t.id).style(styleData);
    ws.cell(row, 2).string(t.name).style(styleData);
    ws.cell(row, 3).string(t.pred).style(styleData);
    ws.cell(row, 4).number(t.E).style(styleData);
    ws.cell(row, 5).number(t.ES).style(styleData);
    ws.cell(row, 6).number(t.EF).style(styleData);
    ws.cell(row, 7).number(t.LS).style(styleData);
    ws.cell(row, 8).number(t.LF).style(styleData);
    ws.cell(row, 9).number(t.slack).style(styleData);
    ws.cell(row, 10).string(t.slack === 0 ? 'YES' : 'NO').style(styleData);

    // Draw Gantt Bar in cells
    const startCol = 12 + Math.floor(t.ES / scaleMultiplier);
    const endCol = 12 + Math.ceil(t.EF / scaleMultiplier) - 1;
    
    for (let c = startCol; c <= endCol; c++) {
      ws.cell(row, c).style(t.slack === 0 ? styleGanttBarCrit : styleGanttBar);
    }
  });
}

// 1. Process Baseline Data
const bd = allData.baselineData;
let bTasks = [
  { id: 10, name: 'Init Variables', pred: '', E: bd.init.E },
  { id: 20, name: 'Compute Deltas', pred: '10', E: bd.delta.E },
  { id: 30, name: 'Core Haversine (sin/cos)', pred: '20', E: bd.core.E },
  { id: 40, name: 'Distance Multiply', pred: '30', E: bd.dist.E },
  { id: 50, name: 'Threshold Check', pred: '40', E: bd.thresh.E }
];

// Calculate CPM for Baseline (Linear)
let esB = 0;
bTasks.forEach(t => {
  t.ES = esB;
  t.EF = esB + t.E;
  esB = t.EF;
});
let lfB = esB;
for (let i = bTasks.length - 1; i >= 0; i--) {
  let t = bTasks[i];
  t.LF = lfB;
  t.LS = lfB - t.E;
  t.slack = t.LS - t.ES;
  lfB = t.LS;
}
renderSheet(wsBaseline, bTasks, 0.0005); // Scale for Haversine (~0.01ms total)


// 2. Process SHARP Data
const sd = allData.sharpData;
let sTasks = [
  { id: 10, name: 'Quantize Grid', pred: '', E: sd.quantize.E },
  { id: 20, name: 'Bloom Filter', pred: '10', E: sd.bloomAdd.E },
  { id: 30, name: 'BCH Encode', pred: '20', E: sd.bchEncode.E },
  { id: 40, name: 'Blind Hash', pred: '10', E: sd.blind.E },
  { id: 50, name: 'BCH Decode', pred: '30', E: sd.bchDecode.E },
  { id: 60, name: 'Verification', pred: '40, 50', E: sd.match.E }
];

// Calculate CPM for SHARP
sTasks[0].ES = 0;
sTasks[0].EF = sTasks[0].E;

sTasks[1].ES = sTasks[0].EF; // Bloom depends on Quantize
sTasks[1].EF = sTasks[1].ES + sTasks[1].E;

sTasks[2].ES = sTasks[1].EF; // BCH Encode depends on Bloom
sTasks[2].EF = sTasks[2].ES + sTasks[2].E;

sTasks[3].ES = sTasks[0].EF; // Blind Hash depends on Quantize
sTasks[3].EF = sTasks[3].ES + sTasks[3].E;

sTasks[4].ES = sTasks[2].EF; // BCH Decode depends on Encode
sTasks[4].EF = sTasks[4].ES + sTasks[4].E;

sTasks[5].ES = Math.max(sTasks[3].EF, sTasks[4].EF); // Verification depends on Blind & Decode
sTasks[5].EF = sTasks[5].ES + sTasks[5].E;

// Backwards Pass
const totalE = sTasks[5].EF;
sTasks[5].LF = totalE; sTasks[5].LS = totalE - sTasks[5].E; sTasks[5].slack = 0;
sTasks[4].LF = sTasks[5].LS; sTasks[4].LS = sTasks[4].LF - sTasks[4].E; sTasks[4].slack = sTasks[4].LS - sTasks[4].ES;
sTasks[3].LF = sTasks[5].LS; sTasks[3].LS = sTasks[3].LF - sTasks[3].E; sTasks[3].slack = sTasks[3].LS - sTasks[3].ES;
sTasks[2].LF = sTasks[4].LS; sTasks[2].LS = sTasks[2].LF - sTasks[2].E; sTasks[2].slack = sTasks[2].LS - sTasks[2].ES;
sTasks[1].LF = sTasks[2].LS; sTasks[1].LS = sTasks[1].LF - sTasks[1].E; sTasks[1].slack = sTasks[1].LS - sTasks[1].ES;
sTasks[0].LF = Math.min(sTasks[1].LS, sTasks[3].LS); sTasks[0].LS = sTasks[0].LF - sTasks[0].E; sTasks[0].slack = sTasks[0].LS - sTasks[0].ES;

renderSheet(wsSharp, sTasks, 0.05); // Scale for SHARP (~1.5ms total)

wb.write('o:/PROJECTS/CONNIFY-APP/cpm_real_gantt_chart.xlsx');
console.log('Real Excel Gantt Chart generated successfully.');
