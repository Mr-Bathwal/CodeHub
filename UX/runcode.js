const { executeCode } = require('./executeCode');
const path = require('path');

// Read command line arguments
// Example: node runcode.js cpp inputtest.cpp "5\n10\n"
const lang = process.argv[2];        // first argument
const filename = process.argv[3];    // second argument
const customInput = process.argv[4] || '';  // optional third argument

if (!lang || !filename) {
  console.log("Usage: node runcode.js <language> <filename> [input]");
  process.exit(1);
}

const filepath = path.join(process.cwd(), 'codes', filename);

executeCode(lang, filepath, customInput)
  .then(out => console.log("OUTPUT:\n", out))
  .catch(err => console.error("ERROR:\n", err));
