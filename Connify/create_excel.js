const XLSX = require('xlsx');

// 1. SHARP Protocol Data
const sharpData = [
  { ID: 10, 'Task Name': 'Quantize Grid', Predecessors: '', 'O (min)': 0.0000, 'M (most likely)': 0.0002, 'P (max)': 0.0508, 'Duration (exp.time)': 0.0086, 'ES (Early Start)': 0.0000, 'EF (Early Finish)': 0.0086, 'LS (Late Start)': 0.0000, 'LF (Late Finish)': 0.0086, Slack: 0.0000, 'Critical Path': 'YES' },
  { ID: 20, 'Task Name': 'Bloom Filter', Predecessors: '10', 'O (min)': 0.0169, 'M (most likely)': 0.0271, 'P (max)': 0.7304, 'Duration (exp.time)': 0.1426, 'ES (Early Start)': 0.0086, 'EF (Early Finish)': 0.1512, 'LS (Late Start)': 0.0086, 'LF (Late Finish)': 0.1512, Slack: 0.0000, 'Critical Path': 'YES' },
  { ID: 30, 'Task Name': 'BCH Encode', Predecessors: '20', 'O (min)': 0.0071, 'M (most likely)': 0.0151, 'P (max)': 0.6422, 'Duration (exp.time)': 0.1183, 'ES (Early Start)': 0.1512, 'EF (Early Finish)': 0.2695, 'LS (Late Start)': 0.1512, 'LF (Late Finish)': 0.2695, Slack: 0.0000, 'Critical Path': 'YES' },
  { ID: 40, 'Task Name': 'Blind Hash', Predecessors: '10', 'O (min)': 0.0342, 'M (most likely)': 0.0526, 'P (max)': 1.1431, 'Duration (exp.time)': 0.2313, 'ES (Early Start)': 0.0086, 'EF (Early Finish)': 0.2399, 'LS (Late Start)': 0.3144, 'LF (Late Finish)': 0.5457, Slack: 0.3058, 'Critical Path': 'NO' },
  { ID: 50, 'Task Name': 'BCH Decode', Predecessors: '30', 'O (min)': 0.0303, 'M (most likely)': 0.0490, 'P (max)': 1.4310, 'Duration (exp.time)': 0.2762, 'ES (Early Start)': 0.2695, 'EF (Early Finish)': 0.5457, 'LS (Late Start)': 0.2695, 'LF (Late Finish)': 0.5457, Slack: 0.0000, 'Critical Path': 'YES' },
  { ID: 60, 'Task Name': 'Verification', Predecessors: '40, 50', 'O (min)': 0.0391, 'M (most likely)': 0.0616, 'P (max)': 1.3856, 'Duration (exp.time)': 0.2785, 'ES (Early Start)': 0.5457, 'EF (Early Finish)': 0.8242, 'LS (Late Start)': 0.5457, 'LF (Late Finish)': 0.8242, Slack: 0.0000, 'Critical Path': 'YES' }
];

// 2. Baseline Algorithm Data
const baselineData = [
  { ID: 10, 'Task Name': 'Haversine GPS', Predecessors: '', 'O (min)': 0.0001, 'M (most likely)': 0.0009, 'P (max)': 0.0640, 'Duration (exp.time)': 0.0113, 'ES (Early Start)': 0.0000, 'EF (Early Finish)': 0.0113, 'LS (Late Start)': 0.0000, 'LF (Late Finish)': 0.0113, Slack: 0.0000, 'Critical Path': 'YES' }
];

// Create workbook and add sheets
const wb = XLSX.utils.book_new();

const wsSharp = XLSX.utils.json_to_sheet(sharpData);
const wsBaseline = XLSX.utils.json_to_sheet(baselineData);

XLSX.utils.book_append_sheet(wb, wsBaseline, "Existing Algorithm");
XLSX.utils.book_append_sheet(wb, wsSharp, "Custom SHARP Algorithm");

// Write to file
XLSX.writeFile(wb, "O:\\PROJECTS\\CONNIFY-APP\\cpm_algorithm_analysis.xlsx");
console.log("Excel file created successfully!");
