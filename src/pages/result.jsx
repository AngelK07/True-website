import React, { useState, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabaseClient from "../../API/supabase";
import logo from "../assets/logo.png";
import '../Css/result.css';

let attemptSaved = false; // module-level, above the component
export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    questions, answers, timeTaken, subject, chapter, section, test_label, test_type,
    attemptId, reviewMode
  } = location.state || {};
  
  const [reviewData, setReviewData] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("wrong");
  const [subjectFilter, setSubjectFilter] = useState("All");

  // Review mode fetch
  useEffect(() => {
    if (!reviewMode || !attemptId) return;
    setLoadingReview(true);

    async function loadReview() {
      const { data: attempt } = await supabaseClient
        .from('quiz_attempts')
        .select('*')
        .eq('attempt_id', attemptId)
        .single();

      const { data: attemptAnswers } = await supabaseClient
        .from('attempt_answers')
        .select('mcq_id, selected, is_correct')
        .eq('attempt_id', attemptId);

      const mcqIds = attemptAnswers.map(a => a.mcq_id);
      const { data: mcqs } = await supabaseClient
        .from('mcq')
        .select('*')
        .in('mcq_id', mcqIds);

      const answersMap = {};
      attemptAnswers.forEach(a => { answersMap[a.mcq_id] = a.selected; });

      const correct = [];
      const wrong = [];
      const skipped = [];

      attemptAnswers.forEach(a => {
        const q = mcqs.find(m => m.mcq_id === a.mcq_id);
        if (!q) return;
        if (a.selected === null) {
          skipped.push({ ...q, userAnswer: null });
        } else if (a.is_correct) {
          correct.push({ ...q, userAnswer: a.selected });
        } else {
          wrong.push({ ...q, userAnswer: a.selected });
        }
      });

      // assign index for display
      [...wrong, ...skipped, ...correct].forEach((q, i) => { q.index = i; });

      setReviewData({ attempt, questions: mcqs, answers: answersMap, correct, wrong, skipped });
      setLoadingReview(false);
    }

    loadReview();
  }, [reviewMode, attemptId]);

  // Save attempt (normal mode only)
useEffect(() => {
  if (reviewMode) return;
  if (attemptSaved) return;
  if (!questions) return;
  attemptSaved = true;

  async function saveAttempt() {
    if (timeTaken < 300) {
    alert('Test must be at least 5 minutes long to save.');
    attemptSaved = false; // reset so if they somehow retake it can save
    return;
  }
    let sc = 0;
    questions.forEach((q) => {
      const ua = answers[q.mcq_id];
      if (ua === q.correct_answer) sc += 1;
      else if (ua) sc -= 0.25;
    });

    const { data, error } = await supabaseClient
      .from('quiz_attempts')
      .insert({
        score: sc,
        time_taken: timeTaken,
        test_type,
        test_label,
        total: questions.length,
        subject,
        chapter
      })
      .select('attempt_id')
      .single();

    if (error) { console.error('Attempt save failed:', error); return; }

    const answerRows = questions.map((q) => ({
      attempt_id: data.attempt_id,
      mcq_id: q.mcq_id,
      selected: answers[q.mcq_id] || null,
      is_correct: answers[q.mcq_id] === q.correct_answer,
      time_taken: null
    }));

    const { error: ansError } = await supabaseClient
      .from('attempt_answers')
      .insert(answerRows);

    if (ansError) console.error('Answers save failed:', ansError);
  }

  saveAttempt();
}, []);

  // Early returns after all hooks
  if (!reviewMode && !questions) {
    navigate('/');
    return null;
  }
  if (reviewMode && loadingReview) return <div className="rs-loading">Loading review...</div>;
  if (reviewMode && !reviewData) return <div className="rs-loading">Failed to load.</div>;

  // Active data
  const activeQuestions = reviewMode ? reviewData.questions : questions;
  const activeTimeTaken = reviewMode ? reviewData.attempt.time_taken : timeTaken;
  const activeSubject = reviewMode ? reviewData.attempt.subject : subject;
  const activeChapter = reviewMode ? reviewData.attempt.chapter : chapter;

  // Score + categorization
  let correct, wrong, skipped, score, displayTotal;

  if (reviewMode) {
    correct = reviewData.correct;
    wrong = reviewData.wrong;
    skipped = reviewData.skipped;
    score = reviewData.attempt.score;
    displayTotal = reviewData.attempt.total;
  } else {
    correct = [];
    wrong = [];
    skipped = [];
    score = 0;
    displayTotal = questions.length;

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
  }

  const subjects = ["All", ...new Set(activeQuestions.map(q => q.Subject))];
  const filteredWrong = subjectFilter === "All" ? wrong : wrong.filter(q => q.Subject === subjectFilter);
  const filteredSkipped = subjectFilter === "All" ? skipped : skipped.filter(q => q.Subject === subjectFilter);
  const filteredCorrect = subjectFilter === "All" ? correct : correct.filter(q => q.Subject === subjectFilter);

  const formatTime = (s) => {
    if (!s && s !== 0) return '00:00';
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

  const getTabClass = (key) => activeTab === key ? `rs-tab active-${key}` : 'rs-tab';

  return (
    <div className="rs-wrap">
      <div className="rs-header">
        <img src={logo} alt="HCM" className="rs-logo" />
        <div className="rs-logo-name">HCM</div>
      </div>

      <div className="rs-score-card">
        <div className="rs-score-subject">
          {activeSubject}{activeChapter ? ` — ${activeChapter}` : ''}
        </div>
        <div className="rs-score-main">{typeof score === 'number' ? score.toFixed(2) : '—'}</div>
        <div className="rs-score-total">out of {displayTotal}</div>
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
            <div className="rs-stat-value">{formatTime(activeTimeTaken)}</div>
            <div className="rs-stat-label">Time</div>
          </div>
        </div>
      </div>

      <div className="rs-tabs">
        <button className={getTabClass('wrong')} onClick={() => setActiveTab('wrong')}>
          Wrong ({filteredWrong.length})
        </button>
        <button className={getTabClass('skipped')} onClick={() => setActiveTab('skipped')}>
          Skipped ({filteredSkipped.length})
        </button>
        <button className={getTabClass('correct')} onClick={() => setActiveTab('correct')}>
          Correct ({filteredCorrect.length})
        </button>
      </div>

      <div className="rs-subject-filter">
        {subjects.map(s => (
          <button
            key={s}
            className={subjectFilter === s ? 'rs-subject-btn active' : 'rs-subject-btn'}
            onClick={() => setSubjectFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'wrong' && (
          filteredWrong.length === 0
            ? <div className="rs-empty">No wrong answers 🎉</div>
            : filteredWrong.map((q, i) => <QuestionCard key={i} q={q} type="wrong" />)
        )}
        {activeTab === 'skipped' && (
          filteredSkipped.length === 0
            ? <div className="rs-empty">No skipped questions 🎉</div>
            : filteredSkipped.map((q, i) => <QuestionCard key={i} q={q} type="skipped" />)
        )}
        {activeTab === 'correct' && (
          filteredCorrect.length === 0
            ? <div className="rs-empty">No correct answers yet</div>
            : filteredCorrect.map((q, i) => <QuestionCard key={i} q={q} type="correct" />)
        )}
      </div>

      {!reviewMode && (
        <div className="rs-actions">
          <button
            className="rs-btn-retake"
            onClick={() => {
              attemptSaved = false;
              navigate('/Quiz', { state: { subject, chapter, section, test_label } });
            }}
          >
            Retake
          </button>
          <button className="rs-btn-back" onClick={() => navigate('/QuizSelection')}>
            New Quiz
          </button>
        </div>
      )}

      {reviewMode && (
        <div className="rs-actions">
          <button className="rs-btn-back" onClick={() => navigate('/history')}>
            ← Back to History
          </button>
        </div>
      )}
    </div>
  );
}