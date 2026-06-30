"use client";

import { styles } from "../styles/shared";

export default function LoginForm({ email, password, onEmailChange, onPasswordChange, onLogin }) {
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

          <button onClick={onLogin} style={styles.primaryButton}>
            Login
          </button>
        </div>
      </div>
    </main>
  );
}
