const { executeWithTestcases } = require('./executeCode');
const path = require('path');

const lang = 'cpp';
const filename = 'inputtest.cpp';
const filepath = path.join(process.cwd(), 'codes', filename);

const testcases = [
  { input: '5 10', expectedOutput: 'Sum is: 15' },
  { input: '2 3', expectedOutput: 'Sum is: 5' },
];

executeWithTestcases(lang, filepath, testcases)
  .then(results => {
    console.log("Test Results:\n", results);
  })
  .catch(err => console.error(err));
