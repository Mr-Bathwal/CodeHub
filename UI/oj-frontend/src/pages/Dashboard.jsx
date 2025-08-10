import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import CodeEditor from "./CodeEditor";

export default function Dashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);

  // Controls for CodeEditor props
  const [problemTitle, setProblemTitle] = useState("");
  const [language, setLanguage] = useState("python");
  const [runSubmitTrigger, setRunSubmitTrigger] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    const userId = localStorage.getItem("userId");
    API.get(`/profile/${userId}`)
      .then((res) => {
        setUserData(res.data.user);
        const submissions = res.data.submissions || [];
        const total = submissions.length;
        const accepted = submissions.filter(
          (s) => s.status?.toLowerCase() === "accepted"
        ).length;

        setStats({ totalSubmissions: total, acceptedCount: accepted });
      })
      .catch(() => {
        localStorage.clear();
        navigate("/login");
      });
  }, [navigate]);

  if (!userData || !stats) {
    return (
      <p
        style={{
          textAlign: "center",
          marginTop: "40px",
          color: "#007acc",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        Loading dashboard...
      </p>
    );
  }

  return (
    <>
      <header style={styles.header}>
        <h1 style={styles.logo}>
          <span style={styles.code}>code</span>
          <span style={styles.HUB}>HUB</span>
        </h1>
        <div style={styles.userSection}>
          <span style={styles.username}>{userData.username}</span>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.mainContainer}>
        <aside style={styles.sidebar}>
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>User Info</h2>
            <p>
              <strong>Username:</strong> {userData.username}
            </p>
            <p>
              <strong>Email:</strong> {userData.email || "Hidden"}
            </p>
          </section>

          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Submission Summary</h2>
            <p>
              <strong>Total Problems Submitted:</strong> {stats.totalSubmissions}
            </p>
            <p>
              <strong>Problems Accepted:</strong> {stats.acceptedCount}
            </p>
          </section>

          <section style={{ ...styles.card, marginTop: "auto" }}>
            {/* Problem Title input */}
            <label style={styles.label}>
              Problem Title:
              <input
                type="text"
                value={problemTitle}
                onChange={(e) => setProblemTitle(e.target.value)}
                placeholder="Enter problem title"
                style={styles.input}
              />
            </label>

            {/* Language selector */}
            <label style={{ ...styles.label, marginTop: "20px" }}>
              Language:
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                size={3} // Show all options expanded, adjust size to number of languages
                style={styles.select}
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                {/* Add more languages here */}
              </select>
            </label>

            {/* Run & Submit button */}
            <button
              onClick={() => setRunSubmitTrigger((prev) => !prev)}
              style={{ ...styles.runSubmitButton, marginTop: "30px", width: "100%" }}
            >
              Run & Submit
            </button>
          </section>
        </aside>

        <section style={styles.editorSection}>
          <CodeEditor
            problemTitle={problemTitle}
            language={language}
            runSubmitTrigger={runSubmitTrigger}
          />
        </section>
      </main>
    </>
  );
}

const styles = {
  header: {
    backgroundColor: "#f7f7f7",
    padding: "12px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ddd",
  },
  logo: {
    fontFamily: "'Share Tech Mono', monospace",
    fontWeight: "800",
    fontSize: "2rem",
    color: "#007acc",
    userSelect: "none",
    margin: 0,
  },
  code: {
    textTransform: "lowercase",
  },
  HUB: {
    textTransform: "uppercase",
    color: "#00a86b",
    fontWeight: "900",
    marginLeft: "6px",
    letterSpacing: "8px",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  username: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontSize: "1rem",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    border: "none",
    borderRadius: "4px",
    color: "#fff",
    padding: "8px 14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.25s ease",
  },

  mainContainer: {
    display: "flex",
    height: "calc(100vh - 56px)", // header height approx
    backgroundColor: "#ffffff",
  },

  sidebar: {
    width: "320px",
    backgroundColor: "#f9f9f9",
    borderRight: "1px solid #ddd",
    padding: "24px",
    boxSizing: "border-box",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: "6px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    color: "#333",
    fontWeight: "500",
    userSelect: "none",
  },

  cardTitle: {
    marginBottom: "12px",
    fontSize: "1.2rem",
    borderBottom: "2px solid #00a86b",
    paddingBottom: "6px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    color: "#222",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #bbb",
    fontSize: "1rem",
    marginTop: "6px",
    boxSizing: "border-box",
  },

  select: {
    width: "100%",
    marginTop: "6px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #bbb",
    boxSizing: "border-box",
    cursor: "pointer",
  },

  runSubmitButton: {
    backgroundColor: "#00a86b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "1.1rem",
    padding: "14px 0",
    cursor: "pointer",
    boxShadow: "0 6px 15px rgba(0,168,107,0.4)",
    transition: "background-color 0.3s ease, transform 0.3s ease",
  },

  editorSection: {
    flex: 1,
    padding: "24px",
    backgroundColor: "#1e252b",
    display: "flex",
    flexDirection: "column",
    borderRadius: "0 8px 8px 0", // round only right corners
    boxShadow: "inset 0 0 8px rgba(0, 0, 0, 0.7)",
  },
};

