import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authProvider";
import "../Css/Login.css";

export default function Login() {
  const { handleLogin, user } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (user !== null) {
    return <Navigate to="/QuizSelection" />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await handleLogin(e, email);
    setSent(true);
  }

  return (
    <div className="login-wrap">

      {/* ── Left branding panel ── */}
      <div className="login-left">
        <img
          src="/logo.png"
          alt="HighCareMentor logo"
          className="login-left-logo"
        />
        <div className="login-brand-name">HighCareMentor</div>
        <div className="login-brand-sub">
          CEE mentorship &amp; guided exam preparation
        </div>
        <div className="login-divider" />
        <div className="login-feature">
          <div className="login-feature-dot" />
          <span>Chapterwise &amp; weekly MCQ practice</span>
        </div>
        <div className="login-feature">
          <div className="login-feature-dot" />
          <span>Expert notes &amp; one-shot videos</span>
        </div>
        <div className="login-feature">
          <div className="login-feature-dot" />
          <span>Personalized study guidance</span>
        </div>
        <div className="login-feature">
          <div className="login-feature-dot" />
          <span>Doubt solving &amp; mentor support</span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-right">

        {!sent ? (
          <div className="login-form-box">
            <span className="login-badge">Beta — Closed Access</span>
            <h1 className="login-heading">Welcome back</h1>
            <p className="login-subheading">
              Enter your registered email to receive a magic login link.
            </p>

            <form onSubmit={handleSubmit}>
              <label className="login-label" htmlFor="loginEmail">
                Email address
              </label>
              <div className="login-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  className="login-input"
                  id="loginEmail"
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="login-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
                Send magic link
              </button>
            </form>

            <div className="login-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Only registered students can log in. Make sure to use the email you signed up with.
            </div>
          </div>

        ) : (
          <div className="login-form-box login-success">
            <div className="login-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h3>Check your Gmail</h3>
            <p>
              We've sent a magic link to <strong>{email}</strong>.
              Click it to sign in — make sure to open it on the same device.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}