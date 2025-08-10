// executeCode.js
const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

function runOnce(runCommand, args, input, timeLimitMs = 2000, maxOutput = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const child = spawn(runCommand, args, { stdio: ["pipe", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill("SIGKILL"); } catch {}
    }, Math.max(50, timeLimitMs));

    child.stdout.on("data", d => {
      stdout += d.toString();
      if (stdout.length > maxOutput) {
        stdout = stdout.slice(0, maxOutput) + "\n...[output truncated]";
        try { child.kill("SIGKILL"); } catch {}
      }
    });

    child.stderr.on("data", d => {
      stderr += d.toString();
      if (stderr.length > maxOutput) {
        stderr = stderr.slice(0, maxOutput) + "\n...[stderr truncated]";
      }
    });

    child.on("error", err => {
      clearTimeout(timer);
      reject({ kind: "spawn-error", message: err.message });
    });

    child.on("close", (code, signal) => {
      clearTimeout(timer);
      const timeMs = Date.now() - start;
      resolve({ stdout, stderr, timeMs, timedOut, exitCode: code, signal });
    });

    if (input) {
      try { child.stdin.write(input); } catch {}
    }
    try { child.stdin.end(); } catch {}
  });
}

function prepareExecution(language, filepath, meta = {}, compileTimeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const jobId = path.basename(filepath).split(".")[0];
    let command = "";
    let compiledOutputPath = "";
    let runCommand, runArgs = [];
    const cleanupFiles = [];

    switch (language) {
      case "cpp":
        compiledOutputPath = path.join(outputPath, `${jobId}.out`);
        command = `g++ "${filepath}" -o "${compiledOutputPath}"`;
        exec(command, { timeout: compileTimeoutMs }, (error, stdout, stderr) => {
          if (error) {
            return resolve({ compileError: stderr || error.message, runCommand: null, runArgs: [], cleanupFiles });
          }
          cleanupFiles.push(compiledOutputPath);
          runCommand = compiledOutputPath;
          runArgs = [];
          resolve({ compileError: null, runCommand, runArgs, cleanupFiles });
        });
        break;

      case "c":
        compiledOutputPath = path.join(outputPath, `${jobId}.out`);
        command = `gcc "${filepath}" -o "${compiledOutputPath}"`;
        exec(command, { timeout: compileTimeoutMs }, (error, stdout, stderr) => {
          if (error) {
            return resolve({ compileError: stderr || error.message, runCommand: null, runArgs: [], cleanupFiles });
          }
          cleanupFiles.push(compiledOutputPath);
          runCommand = compiledOutputPath;
          runArgs = [];
          resolve({ compileError: null, runCommand, runArgs, cleanupFiles });
        });
        break;

      case "python":
        runCommand = "python";
        runArgs = [filepath];
        resolve({ compileError: null, runCommand, runArgs, cleanupFiles });
        break;

      case "java":
        compiledOutputPath = outputPath;
        command = `javac "${filepath}" -d "${compiledOutputPath}"`;
        exec(command, { timeout: compileTimeoutMs }, (error, stdout, stderr) => {
          if (error) {
            return resolve({ compileError: stderr || error.message, runCommand: null, runArgs: [], cleanupFiles });
          }
          const className = meta.className || path.basename(filepath, ".java");
          runCommand = "java";
          runArgs = ["-cp", compiledOutputPath, className];
          resolve({ compileError: null, runCommand, runArgs, cleanupFiles });
        });
        break;

      default:
        reject(new Error("Language not supported"));
    }
  });
}

module.exports = { runOnce, prepareExecution };
