import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Css/payment.css";
import Bankqr from "../assets/Bankqr.jpg";
import Esewaqr from "../assets/esewaqr.jpg";
import logo from "../assets/logo.png";

function NavItem({ to, label, badge, disabled }) {
  if (disabled) {
    return (
      <span className="nav-link nav-link--disabled">
        {label}
        {badge && <span className="nav-badge">{badge}</span>}
      </span>
    );
  }
  return (
    <Link to={to} className="nav-link">
      {label}
      {badge && <span className="nav-badge">{badge}</span>}
    </Link>
  );
}

const METHODS = [
  {
    id: "esewa",
    label: "eSewa",
    qr: Esewaqr,
    details: [
      { label: "Name", value: "Anjal Kumal" },
      { label: "Number", value: "9801998209" },
    ],
  },
  {
    id: "bank",
    label: "Bank Transfer",
    qr: Bankqr,
    details: [
      { label: "Bank", value: "Machhapuchhre Bank" },
      { label: "Name", value: "Anjal Kumal" },
      { label: "Account No.", value: "0170984799000017" },
      { label: "Branch", value: "Pokhara" },
    ],
  },
];

const CONTACTS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/qr/A72RUA2R7WOON1",
    color: "#25d366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/share/1DoWcDQUDZ/",
    color: "#1877f2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/Highcarementor",
    color: "#229ed9",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    id: "email",
    label: "Email",
    href: "mailto:aklebussiness@gmail.com",
    color: "#22c55e",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

export default function Payment() {
  const [activeMethod, setActiveMethod] = useState("esewa");
  const method = METHODS.find((m) => m.id === activeMethod);

  return (
    <div className="pay-page">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');`}</style>

      <nav className="pay-nav">
        <Link to="/" className="pay-nav-logo">
          <img src={logo} alt="HCM" />
        </Link>
        <div className="pay-nav-links">
          <NavItem to="/QuizSelection" label="MCQs" />
          <NavItem to="/notes" label="Notes" badge="Soon" disabled />
          <NavItem to="/videos" label="Videos" badge="Soon" disabled />
        </div>
      </nav>

      <div className="pay-blob pay-blob--1" />
      <div className="pay-blob pay-blob--2" />

      <main className="pay-main">

        <div className="pay-hero">
          <img src={logo} alt="HighCareMentor" className="pay-hero-logo" />
          <div className="pay-price-wrap">
            <span className="pay-price-old">NPR 1,500</span>
            <span className="pay-price">NPR 999</span>
          </div>
          <div className="pay-deal-badge">🔥 Special price for first 10 students only</div>
          <p className="pay-hero-sub">One-time payment · Full access · No subscription</p>
        </div>

        <div className="pay-card">

          <div className="pay-tabs">
            {METHODS.map((m) => (
              <button
                key={m.id}
                className={`pay-tab ${activeMethod === m.id ? "pay-tab--active" : ""}`}
                onClick={() => setActiveMethod(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="pay-warning">
            <span className="pay-warning-icon">⚠️</span>
            <span>If one payment method is full, please use the other option.</span>
          </div>

          <div className="pay-qr-section">
            <div className="pay-qr-wrap">
              <img
                src={method.qr}
                alt={method.label + " QR"}
                className="pay-qr-img"
              />
              <span className="pay-qr-label">{method.label}</span>
            </div>
            <div className="pay-details">
              {method.details.map((d) => (
                <div key={d.label} className="pay-detail-row">
                  <span className="pay-detail-label">{d.label}</span>
                  <span className="pay-detail-value">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pay-instruction">
            <div className="pay-instruction-title">After Payment</div>
            <p className="pay-instruction-body">
              Send a <strong>screenshot of your transaction</strong> along with your{" "}
              <strong>name and contact number</strong> to any of our contact handles below.
            </p>
          </div>

        </div>

        <div className="pay-contact-section">
          <h2 className="pay-contact-title">Contact Us</h2>
          <p className="pay-contact-sub">Reach out via any platform after payment</p>

          <div className="pay-contact-icons">
            {CONTACTS.map((c) => (
              <a
                key={c.id}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pay-contact-icon-btn"
                style={{ "--contact-color": c.color }}
                title={c.label}
              >
                <span className="pay-contact-icon">{c.icon}</span>
                <span className="pay-contact-icon-label">{c.label}</span>
              </a>
            ))}
          </div>

          <div className="pay-phones">
            <div className="pay-phone-card">
              <span className="pay-phone-icon">📞</span>
              <div>
                <div className="pay-phone-name">Omraj</div>
                <a href="tel:+9779813402033" className="pay-phone-num">+977 9813402033</a>
              </div>
            </div>
            <div className="pay-phone-card">
              <span className="pay-phone-icon">📞</span>
              <div>
                <div className="pay-phone-name">Anjal</div>
                <a href="tel:+9779801998209" className="pay-phone-num">+977 9801998209</a>
              </div>
            </div>
          </div>
        </div>

      </main>

      <footer className="pay-footer">
        © {new Date().getFullYear()} HighCareMentor · All rights reserved
      </footer>

    </div>
  );
}