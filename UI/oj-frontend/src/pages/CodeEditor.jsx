import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import API from "../api";

export default function CodeEditor({ problemTitle, language, runSubmitTrigger }) {
  const [code, setCode] = useState("// write your code here");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    setOutput("");
    try {
      const { data } = await API.post("/run", {
        problemTitle,
        language,
        code,
        input,
      });

      if (data.error) {
        setError(data.error);
      } else {
        setOutput(data.output || "No output");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed");
    }
  };

  // Run submit when trigger changes
  useEffect(() => {
    if (runSubmitTrigger !== undefined) {
      handleSubmit();
    }
  }, [runSubmitTrigger]);

  return (
    <div style={styles.container}>
      <label style={styles.label}>
        Input:
        <textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Standard input for the program"
          style={styles.textarea}
        />
      </label>

      <Editor
        height="400px"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(val) => setCode(val)}
        options={{ minimap: { enabled: false } }}
      />

      {error && <p style={styles.error}>Error: {error}</p>}

      {output && (
        <pre style={styles.outputBox}>
          {output}
        </pre>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    color: "#ddd",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  label: {
    fontWeight: "600",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #444",
    backgroundColor: "#121212",
    color: "#eee",
    fontSize: "1rem",
    fontFamily: "monospace",
    resize: "vertical",
  },
  error: {
    color: "#f44336",
    fontWeight: "700",
  },
  outputBox: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#2e2e2e",
    borderRadius: "6px",
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    maxHeight: "200px",
    overflowY: "auto",
  },
};
