import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Login from "./login";
import Signup from "./Signup";

export default function AuthPage({ defaultView = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize view based on URL or defaultView prop
  const getViewFromPath = (path) => {
    if (path === "/signup") return "signup";
    if (path === "/login") return "login";
    return defaultView;
  };

  const [view, setView] = useState(getViewFromPath(location.pathname));

  // Sync view if URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    setView(getViewFromPath(location.pathname));
  }, [location.pathname]);

  // Handlers to switch views and update URL via navigate()
  const switchToSignup = () => {
    setView("signup");
    navigate("/signup");
  };

  const switchToLogin = () => {
    setView("login");
    navigate("/login");
  };

  const handleSignupSuccess = () => {
    setView("login");
    navigate("/login");
  };

  return (
    <>
      {/* Toggle buttons */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <button
          onClick={switchToLogin}
          style={{
            fontWeight: view === "login" ? "bold" : "normal",
            marginRight: 10,
            cursor: "pointer",
          }}
        >
          Login
        </button>
        <button
          onClick={switchToSignup}
          style={{
            fontWeight: view === "signup" ? "bold" : "normal",
            cursor: "pointer",
          }}
        >
          Signup
        </button>
      </div>

      {/* Render either Login or Signup */}
      {view === "login" ? (
        <Login onSwitchToSignup={switchToSignup} />
      ) : (
        <Signup
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </>
  );
}