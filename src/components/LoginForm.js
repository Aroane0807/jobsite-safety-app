"use client";

import { styles } from "../styles/shared";

export default function LoginForm({ email, password, rememberMe, onEmailChange, onPasswordChange, onRememberMeChange, onLogin }) {
  return (
    <main style={styles.page}>
      <div style={{ ...styles.container, maxWidth: 420 }}>
        <div style={styles.header}>
          <h1 style={styles.title}>Jobsite Safety</h1>
          <p style={styles.subtitle}>Daily safety acknowledgment portal</p>
        </div>

        <div style={styles.card}>
          <h2>Login</h2>

          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
          />

          <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => onRememberMeChange(e.target.checked)}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            <span style={{ fontSize: 15, color: "#374151" }}>Keep me logged in on this device</span>
          </label>

          <button onClick={onLogin} style={styles.primaryButton}>
            Login
          </button>
        </div>
      </div>
    </main>
  );
}
