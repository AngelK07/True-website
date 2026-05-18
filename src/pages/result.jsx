import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabaseClient from "../../API/supabase";
import logo from "../assets/logo.png";
import '../Css/result.css';

let attemptSaved = false;

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, answers, timeTaken, subject, chapter, section } = location.state || {};

  const [activeTab, setActiveTab] = useState("wrong");

  if (!questions) {
    navigate('/');
    return null;
  }

  const correct = [];
  const wrong = [];
  const skipped = [];
  let score = 0;

  questions.forEach((q, i) => {
    const userAnswer = answers[q.mcq_id];
    if (!userAnswer) {
      skipped.push({ ...q, index: i });
    } else if (userAnswer === q.correct_answer) {
      correct.push({ ...q, index: i, userAnswer });
      score += 1;
    } else {
      wrong.push({ ...q, index: i, userAnswer });
      score -= 0.25;
    }
  });

  useEffect(() => {
    if (attemptSaved) return;
    attemptSaved = true;

    async function saveAttempt() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;
      const { error } = await supabaseClient
        .from('quiz_attempts')
        .insert({
          student_id: user.id,
          Subject: subject,
          Chapter: chapter,
          Section: section,
          answers: answers,
          score: score,
          time_taken: timeTaken,
          attempted_at: new Date().toISOString()
        });
      if (error) console.log("Save failed:", error);
    }
    saveAttempt();
  }, []);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const QuestionCard = ({ q, type }) => (
    <div className="rs-qcard">
      <div className="rs-qnum">Q{q.index + 1}</div>
      <div className="rs-qtext">{q.Questions}</div>
      <div className="rs-divider"></div>

      {type === 'wrong' && (
        <>
          <div className="rs-answer-row wrong-ans">
            <span className="rs-answer-icon">✗</span>
            <span>Your answer: {q.userAnswer}</span>
          </div>
          <div className="rs-answer-row correct-ans">
            <span className="rs-answer-icon">✓</span>
            <span>Correct: {q.correct_answer}</span>
          </div>
        </>
      )}

      {type === 'skipped' && (
        <div className="rs-answer-row correct-ans">
          <span className="rs-answer-icon">✓</span>
          <span>Correct answer: {q.correct_answer}</span>
        </div>
      )}

      {type === 'correct' && (
        <div className="rs-answer-row correct-ans">
          <span className="rs-answer-icon">✓</span>
          <span>{q.correct_answer}</span>
        </div>
      )}

      {q.Explanation && (
        <div className="rs-explanation">
          <strong>Explanation</strong>
          {q.Explanation}
        </div>
      )}
    </div>
  );

  const getTabClass = (key) => {
    if (activeTab !== key) return 'rs-tab';
    return `rs-tab active-${key}`;
  };

  return (
    <div className="rs-wrap">

      {/* Header */}
      <div className="rs-header">
        <img src={logo} alt="HCM" className="rs-logo" />
        <div className="rs-logo-name">HCM</div>
      </div>

      {/* Score Card */}
      <div className="rs-score-card">
        <div className="rs-score-subject">
          {subject}{chapter ? ` — ${chapter}` : ''}
        </div>
        <div className="rs-score-main">{score.toFixed(2)}</div>
        <div className="rs-score-total">out of {questions.length}</div>
        <div className="rs-score-stats">
          <div className="rs-stat correct">
            <div className="rs-stat-value">{correct.length}</div>
            <div className="rs-stat-label">Correct</div>
          </div>
          <div className="rs-stat wrong">
            <div className="rs-stat-value">{wrong.length}</div>
            <div className="rs-stat-label">Wrong</div>
          </div>
          <div className="rs-stat skipped">
            <div className="rs-stat-value">{skipped.length}</div>
            <div className="rs-stat-label">Skipped</div>
          </div>
          <div className="rs-stat time">
            <div className="rs-stat-value">{formatTime(timeTaken)}</div>
            <div className="rs-stat-label">Time</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rs-tabs">
        <button className={getTabClass('wrong')} onClick={() => setActiveTab('wrong')}>
          Wrong ({wrong.length})
        </button>
        <button className={getTabClass('skipped')} onClick={() => setActiveTab('skipped')}>
          Skipped ({skipped.length})
        </button>
        <button className={getTabClass('correct')} onClick={() => setActiveTab('correct')}>
          Correct ({correct.length})
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'wrong' && (
          wrong.length === 0
            ? <div className="rs-empty">No wrong answers 🎉</div>
            : wrong.map((q, i) => <QuestionCard key={i} q={q} type="wrong" />)
        )}
        {activeTab === 'skipped' && (
          skipped.length === 0
            ? <div className="rs-empty">No skipped questions 🎉</div>
            : skipped.map((q, i) => <QuestionCard key={i} q={q} type="skipped" />)
        )}
        {activeTab === 'correct' && (
          correct.length === 0
            ? <div className="rs-empty">No correct answers yet</div>
            : correct.map((q, i) => <QuestionCard key={i} q={q} type="correct" />)
        )}
      </div>

      {/* Action Buttons */}
      <div className="rs-actions">
        <button
  className="rs-btn-retake"
  onClick={() => {
    attemptSaved = false; // reset so next attempt saves too
    navigate('/Quiz', {
      state: { subject, chapter, section }
    });
  }}
>
  Retake
</button>
        <button
          className="rs-btn-back"
          onClick={() => navigate('/QuizSelection')}
        >
          New Quiz
        </button>
      </div>

    </div>
  );
}