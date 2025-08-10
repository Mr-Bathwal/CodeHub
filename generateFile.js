// generateFile.js
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirCodes = path.join(__dirname, "codes");
if (!fs.existsSync(dirCodes)) fs.mkdirSync(dirCodes, { recursive: true });

function generateFile(language, content) {
  const jobId = uuid();
  let extension;

  switch (language) {
    case "cpp": extension = ".cpp"; break;
    case "c": extension = ".c"; break;
    case "python": extension = ".py"; break;
    case "java": extension = ".java"; break;
    default: throw new Error("Language not supported");
  }

  if (language === "java") {
    // Java public class rename & wrapping logic
    const safeClassName = "Class_" + jobId.replace(/-/g, "_");
    if (/public\s+class\s+\w+/.test(content)) {
      content = content.replace(/public\s+class\s+\w+/, `public class ${safeClassName}`);
    } else if (/static\s+void\s+main\s*\(/.test(content)) {
      if (/class\s+\w+/.test(content)) {
        content = content.replace(/class\s+(\w+)/, `class ${safeClassName}`);
      } else {
        content = `public class ${safeClassName} {\n${content}\n}`;
      }
    } else {
      content = `public class ${safeClassName} {\n${content}\n}`;
    }

    const fileName = `${safeClassName}.java`;
    const filePath = path.join(dirCodes, fileName);
    fs.writeFileSync(filePath, content);
    return { filePath, meta: { className: safeClassName } };
  }

  const fileName = `${jobId}${extension}`;
  const filePath = path.join(dirCodes, fileName);
  fs.writeFileSync(filePath, content);
  return { filePath, meta: {} };
}

module.exports = { generateFile };
