import React, { useState,useEffect,useRef} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabaseClient from "../../API/supabase";

 let attemptSaved = (false);

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, answers, timeTaken, subject, chapter, section } = location.state || {};

  const [activeTab, setActiveTab] = useState("wrong");

  if (!questions) {
    navigate('/');
    return null;
  }

  // Categorize
  const correct = [];
  const wrong = [];
  const skipped = [];
  let score = 0; // Assuming 1 mark per question

  questions.forEach((q, i) => {
    const userAnswer = answers[q.mcq_id];
    if (!userAnswer) {
      skipped.push({ ...q, index: i });
    } else if (userAnswer === q.correct_answer) {
      correct.push({ ...q, index: i, userAnswer });
      score += 1;
    } else {
      wrong.push({ ...q, index: i, userAnswer });
      score -= 0.25; // Negative marking for wrong answers
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
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      background: '#fff'
    }}>
      <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        Q{q.index + 1}. {q.Questions}
      </p>

      {/* Wrong — show user answer in red, correct in green */}
      {type === 'wrong' && (
        <>
          <p style={{ color: 'red' }}>✗ Your answer: {q.userAnswer}</p>
          <p style={{ color: 'green' }}>✓ Correct: {q.correct_answer}</p>
        </>
      )}

      {/* Skipped — just show correct */}
      {type === 'skipped' && (
        <p style={{ color: 'green' }}>✓ Correct: {q.correct_answer}</p>
      )}

      {/* Correct — show correct answer */}
      {type === 'correct' && (
        <p style={{ color: 'green' }}>✓ {q.correct_answer}</p>
      )}

      {/* Explanation for all */}
      {q.Explanation && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#374151'
        }}>
          <strong>Explanation:</strong> {q.Explanation}
        </div>
      )}
    </div>
  );

  const tabs = [
    { key: 'wrong', label: `Wrong (${wrong.length})`, color: '#ef4444' },
    { key: 'skipped', label: `Skipped (${skipped.length})`, color: '#eab308' },
    { key: 'correct', label: `Correct (${correct.length})`, color: '#22c55e' },
  ];

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px' }}>

      {/* Score Card */}
      <div style={{
        background: '#1e293b',
        color: '#fff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '28px' }}>
          {score} / {questions.length}
        </h2>
        <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>
          Time taken: {formatTime(timeTaken)} &nbsp;|&nbsp;
          Wrong: {wrong.length} &nbsp;|&nbsp;
          Skipped: {skipped.length}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              background: activeTab === tab.key ? tab.color : '#f1f5f9',
              color: activeTab === tab.key ? '#fff' : '#64748b',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'wrong' && (
          wrong.length === 0
            ? <p style={{ color: '#64748b' }}>No wrong answers 🎉</p>
            : wrong.map((q, i) => <QuestionCard key={i} q={q} type="wrong" />)
        )}
        {activeTab === 'skipped' && (
          skipped.length === 0
            ? <p style={{ color: '#64748b' }}>No skipped questions 🎉</p>
            : skipped.map((q, i) => <QuestionCard key={i} q={q} type="skipped" />)
        )}
        {activeTab === 'correct' && (
          correct.map((q, i) => <QuestionCard key={i} q={q} type="correct" />)
        )}
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/QuizSelection')}
        style={{
          marginTop: '24px',
          width: '100%',
          padding: '12px',
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Back to Quiz Selection
      </button>
    </div>
  );
}