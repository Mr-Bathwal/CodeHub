import React from "react";
import { Routes, Route } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CodeEditor from "./pages/CodeEditor";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage defaultView="login" />} />
      <Route path="/login" element={<AuthPage defaultView="login" />} />
      <Route path="/signup" element={<AuthPage defaultView="signup" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/code-editor" element={<CodeEditor />} />
    </Routes>
  );
}

