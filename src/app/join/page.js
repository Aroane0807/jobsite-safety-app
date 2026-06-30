"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { styles } from "../../styles/shared";

function JoinForm() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("english");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Supabase auto-processes the invite token from the URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit() {
    if (!fullName.trim()) { alert("Enter your full name."); return; }
    if (!phone.trim()) { alert("Enter your phone number."); return; }
    if (!password) { alert("Set a password."); return; }
    if (password.length < 6) { alert("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { alert("Passwords do not match."); return; }

    setSubmitting(true);

    // Set their chosen password
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) {
      alert(passwordError.message);
      setSubmitting(false);
      return;
    }

    // Get the current session token to send to the API
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    // Create their worker profile
    const response = await fetch("/api/setup-worker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentSession?.access_token}`,
      },
      body: JSON.stringify({
        fullName,
        phone,
        preferredLanguage: language,
        role,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={{ ...styles.container, maxWidth: 480 }}>
          <div style={styles.header}>
            <h1 style={styles.title}>Jobsite Safety</h1>
          </div>
          <div style={styles.card}>
            <p>Loading your invite link...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main style={styles.page}>
        <div style={{ ...styles.container, maxWidth: 480 }}>
          <div style={styles.header}>
            <h1 style={styles.title}>Jobsite Safety</h1>
          </div>
          <div style={{ ...styles.card, ...styles.warning }}>
            <h2 style={{ marginTop: 0 }}>Invite link invalid or expired</h2>
            <p>This link may have already been used or has expired. Please ask your supervisor to send a new invite.</p>
          </div>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main style={styles.page}>
        <div style={{ ...styles.container, maxWidth: 480 }}>
          <div style={styles.header}>
            <h1 style={styles.title}>Jobsite Safety</h1>
          </div>
          <div style={{ ...styles.card, ...styles.notice }}>
            <h2 style={{ marginTop: 0 }}>You're all set!</h2>
            <p>Your account has been created. You can now log in every day to acknowledge your safety topics.</p>
            <a href="/" style={{ ...styles.primaryButton, display: "block", textDecoration: "none", textAlign: "center" }}>
              Go to Login
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={{ ...styles.container, maxWidth: 480 }}>
        <div style={styles.header}>
          <h1 style={styles.title}>Jobsite Safety</h1>
          <p style={styles.subtitle}>Set up your account</p>
        </div>

        <div style={styles.card}>
          <p style={{ marginTop: 0, color: "#4b5563" }}>
            Welcome! Fill in your details below to finish setting up your account.
            You are logged in as <strong>{session.user.email}</strong>.
          </p>

          <label>
            <strong>Full Name</strong>
            <input
              style={styles.input}
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>

          <label>
            <strong>Phone Number</strong>
            <input
              style={styles.input}
              placeholder="Your phone number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <label>
            <strong>Preferred Language</strong>
            <select
              style={styles.select}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="english">English</option>
              <option value="spanish">Español</option>
            </select>
          </label>

          <label>
            <strong>Password</strong>
            <input
              style={styles.input}
              placeholder="Choose a password (min. 6 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label>
            <strong>Confirm Password</strong>
            <input
              style={styles.input}
              placeholder="Confirm your password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={submitting ? styles.disabledButton : styles.primaryButton}
          >
            {submitting ? "Setting up your account..." : "Create My Account"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}
