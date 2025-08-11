import React, { useState } from "react";
import API from "../api";

export default function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [hover, setHover] = useState(false);
  const [focusInput, setFocusInput] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    return;
  }
  setError(null);

  try {
    // Call your backend signup API
    await API.post("/signup", {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    // If successful, call onSignupSuccess to switch to login
    if (typeof onSignupSuccess === "function") {
      onSignupSuccess();
    }
  } catch (err) {
    // Show backend error message if signup fails
    setError(err.response?.data?.message || "Signup failed. Please try again.");
  }
};

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Source Code Pro', monospace, Consolas, monospace",
    background: `
      radial-gradient(circle at top left, #0f2027, #203a43, #2c5364),
      repeating-linear-gradient(
        45deg,
        rgba(0, 255, 214, 0.05),
        rgba(0, 255, 214, 0.05) 2px,
        transparent 2px,
        transparent 10px
      ),
      repeating-linear-gradient(
        -45deg,
        rgba(0, 255, 214, 0.05),
        rgba(0, 255, 214, 0.05) 2px,
        transparent 2px,
        transparent 10px
      )
    `,
    backgroundBlendMode: "overlay",
    padding: "20px",
  };

  const formStyle = {
    backgroundColor: "#121619dd",
    borderRadius: "10px",
    padding: "50px 60px",
    width: "100%",
    maxWidth: "420px",
    color: "#b0f7ff",
    boxShadow: "0 4px 25px rgba(0, 255, 214, 0.15), inset 0 0 6px #00ffd6",
    perspective: "800px",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(0,255,214,0.3)",
  };

  const appNameStyle = {
    fontSize: "3.5rem",
    color: "#00ffd6",
    letterSpacing: "4px",
    marginBottom: "30px",
    userSelect: "none",
    position: "relative",
    textAlign: "center",
    fontWeight: "800",
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: "none",
    textShadow: "0 0 3px #00ffd6aa, 0 0 9px #00ffd6bb",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    color: "#00ffd6",
    transition: "color 0.3s ease",
    userSelect: "none",
  };

  const labelFocusedStyle = {
    color: "#00ffa2",
    textShadow: "0 0 8px #00ffa2",
  };

  const inputBaseStyle = {
    width: "100%",
    padding: "14px 18px",
    marginBottom: "30px",
    borderRadius: "8px",
    border: "2px solid #00ffd6",
    outline: "none",
    fontSize: "1rem",
    backgroundColor: "#1a1f24",
    color: "#b5eaea",
    fontWeight: "600",
    boxSizing: "border-box",
    transition:
      "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
    boxShadow: "inset 0 0 6px rgba(0, 255, 214, 0.5)",
    transformOrigin: "center center",
  };

  const inputFocusStyle = {
    transform: "scale(1.06) perspective(400px) translateZ(5px)",
    borderColor: "#00ffa2",
    boxShadow:
      "0 0 12px 4px rgba(0, 255, 162, 0.8), inset 0 0 14px rgba(0, 255, 162, 0.8)",
    backgroundColor: "#20272e",
  };

  const buttonStyle = {
    display: "block",
    width: "160px",
    margin: "0 auto",
    padding: "14px 0",
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#121619",
    backgroundImage: "linear-gradient(90deg, #00ffd6, #00ffa2, #00ffd6)",
    backgroundSize: "300% 300%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0% 50%",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 6px 25px rgba(0, 255, 214, 0.15), inset 0 0 10px rgba(0, 255, 162, 0.8)",
    transition: "background-position 1.2s ease, transform 0.3s ease, box-shadow 0.3s ease",
  };

  const buttonHoverStyle = {
    backgroundPosition: "100% 50%",
    transform: "scale(1.12) translateZ(8px)",
    boxShadow: "0 10px 35px rgba(0, 255, 162, 0.9), inset 0 0 25px rgba(0, 255, 214, 1)",
  };

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit} noValidate>
        <div style={appNameStyle}>
          <span style={{ textTransform: "lowercase" }}>code</span>
          <span
            style={{
              textTransform: "uppercase",
              color: "#00ffa2",
              letterSpacing: "12px",
              fontWeight: "bold",
              paddingBottom: "6px",
              userSelect: "none",
            }}
          >
            HUB
          </span>
        </div>

        <label
          htmlFor="username"
          style={{
            ...labelStyle,
            ...(focusInput === "username" ? labelFocusedStyle : {}),
          }}
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          placeholder="Enter username"
          onChange={handleChange}
          onFocus={() => setFocusInput("username")}
          onBlur={() => setFocusInput(null)}
          required
          style={{
            ...inputBaseStyle,
            ...(focusInput === "username" ? inputFocusStyle : {}),
          }}
          autoComplete="username"
        />

        <label
          htmlFor="email"
          style={{
            ...labelStyle,
            ...(focusInput === "email" ? labelFocusedStyle : {}),
          }}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          placeholder="your@example.com"
          onChange={handleChange}
          onFocus={() => setFocusInput("email")}
          onBlur={() => setFocusInput(null)}
          required
          style={{
            ...inputBaseStyle,
            ...(focusInput === "email" ? inputFocusStyle : {}),
          }}
          autoComplete="email"
        />

        <label
          htmlFor="password"
          style={{
            ...labelStyle,
            ...(focusInput === "password" ? labelFocusedStyle : {}),
          }}
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          placeholder="Enter your password"
          onChange={handleChange}
          onFocus={() => setFocusInput("password")}
          onBlur={() => setFocusInput(null)}
          required
          style={{
            ...inputBaseStyle,
            ...(focusInput === "password" ? inputFocusStyle : {}),
          }}
          autoComplete="new-password"
        />

        <label
          htmlFor="confirmPassword"
          style={{
            ...labelStyle,
            ...(focusInput === "confirmPassword" ? labelFocusedStyle : {}),
          }}
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          placeholder="Confirm your password"
          onChange={handleChange}
          onFocus={() => setFocusInput("confirmPassword")}
          onBlur={() => setFocusInput(null)}
          required
          style={{
            ...inputBaseStyle,
            ...(focusInput === "confirmPassword" ? inputFocusStyle : {}),
          }}
          autoComplete="new-password"
        />

        {error && (
          <p
            style={{
              color: "#ff4d4d",
              fontWeight: "600",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          style={hover ? { ...buttonStyle, ...buttonHoverStyle } : buttonStyle}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          Signup
        </button>

        {/* Toggle to Login link */}
        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#00ffd6",
            cursor: "pointer",
            userSelect: "none",
            fontWeight: "600",
            textDecoration: "underline",
          }}
          onClick={onSwitchToLogin}
        >
          Already have an account? Login
        </p>
      </form>
    </div>
  );
}

