import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabaseClient from "../../API/supabase";
import logo from "../assets/logo.png";
import "../Css/History.css";

const PAGE_SIZE = 5;

export default function History() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(0);

  useEffect(() => {
    async function fetchAttempts() {
      const { data, error } = await supabaseClient
        .from("quiz_attempts")
        .select("*")
        .order("attempted_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch attempts:", error);
      } else {
        setAttempts(data);
      }
      setLoading(false);
    }
    fetchAttempts();
  }, []);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Fixed filter tabs — always show these 4
  const filterTabs = ["All", "chapter", "weekly", "cee"];

  const filtered =
    filter === "All" ? attempts : attempts.filter((a) => a.test_type === filter);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function handleFilterChange(tab) {
    setFilter(tab);
    setPage(0); // reset to first page on filter change
  }

  async function handleReview(attempt) {
    const { data: answerRows, error } = await supabaseClient
      .from("attempt_answers")
      .select("*, mcq(*)")
      .eq("attempt_id", attempt.attempt_id);

    if (error) {
      console.error("Failed to fetch attempt answers:", error);
      return;
    }

    const questions = answerRows.map((row) => row.mcq);
    const answers = {};
    answerRows.forEach((row) => {
      answers[row.mcq_id] = row.selected;
    });

    navigate("/result", {
      state: {
        questions,
        answers,
        timeTaken: attempt.time_taken,
        subject: attempt.subject,
        chapter: attempt.chapter,
        test_type: attempt.test_type,
        test_label: attempt.test_label,
        reviewMode: true,
      },
    });
  }

  const getScoreClass = (score, total) => {
    const pct = (score / total) * 100;
    if (pct >= 70) return "hs-score-good";
    if (pct >= 40) return "hs-score-avg";
    return "hs-score-bad";
  };

  return (
    <div className="hs-wrap">
      <div className="hs-header">
        <img src={logo} alt="HCM" className="hs-logo" />
        <div className="hs-logo-name">HCM</div>
      </div>

      <div className="hs-top">
        <h2 className="hs-title">My History</h2>
        <div className="hs-summary">
          <div className="hs-summary-item">
            <span className="hs-summary-value">{attempts.length}</span>
            <span className="hs-summary-label">Total Attempts</span>
          </div>
          <div className="hs-summary-item">
            <span className="hs-summary-value">
              {attempts.length > 0
                ? (
                    attempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) /
                    attempts.length
                  ).toFixed(1) + "%"
                : "—"}
            </span>
            <span className="hs-summary-label">Avg Score</span>
          </div>
          <div className="hs-summary-item">
            <span className="hs-summary-value">
              {attempts.length > 0
                ? Math.max(...attempts.map((a) => (a.score / a.total) * 100)).toFixed(1) + "%"
                : "—"}
            </span>
            <span className="hs-summary-label">Best Score</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="hs-filter">
        {filterTabs.map((t) => (
          <button
            key={t}
            className={filter === t ? "hs-filter-btn active" : "hs-filter-btn"}
            onClick={() => handleFilterChange(t)}
          >
            {t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="hs-loading">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="hs-empty">No attempts found.</div>
      ) : (
        <>
          <div className="hs-list">
            {paginated.map((attempt) => (
              <div key={attempt.attempt_id} className="hs-card">
                <div className="hs-card-top">
                  <div className="hs-card-meta">
                    <div className="hs-card-subject">
                      {attempt.subject}
                      {attempt.chapter ? ` — ${attempt.chapter}` : ""}
                    </div>
                    <div className="hs-card-type">{attempt.test_type}</div>
                  </div>
                  <div className={`hs-card-score ${getScoreClass(attempt.score, attempt.total)}`}>
                    {attempt.score?.toFixed(2)}/{attempt.total}
                  </div>
                </div>
                <div className="hs-card-bottom">
                  <span className="hs-card-date">{formatDate(attempt.attempted_at)}</span>
                  <span className="hs-card-time">⏱ {formatTime(attempt.time_taken)}</span>
                  <button
                    className="hs-review-btn"
                    onClick={() => handleReview(attempt)}
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="hs-pagination">
              <button
                className="hs-page-btn"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
              >
                ← Prev
              </button>
              <span className="hs-page-info">
                {page + 1} / {totalPages}
              </span>
              <button
                className="hs-page-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <button className="hs-back-btn" onClick={() => navigate("/QuizSelection")}>
        ← Back
      </button>
    </div>
  );
}