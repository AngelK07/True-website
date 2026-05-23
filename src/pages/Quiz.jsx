import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import supabaseClient from "../../API/supabase";
import logo from "../assets/logo.png";
import '../Css/Quiz.css';

const TimerDisplay = ({ timeLeft, setTimeLeft, onTimeUp }) => {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTimer = (s) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600)/60);
    const sec = s % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className={`qz-timer ${timeLeft < 60 ? 'urgent' : ''}`}>
      {formatTimer(timeLeft)}
    </div>
  );
};

const QuestionPalette = ({ statuses, current, onJump, isOpen, onClose }) => {
  const grid = (
    <div className="qz-palette-grid">
      {statuses.map((status, i) => (
        <button
          key={i}
          onClick={() => { onJump(i); onClose && onClose(); }}
          className={`qz-palette-num ${status} ${i === current ? 'current' : ''}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );

  const sidebar = (
    <div className="qz-palette-sidebar" style={{ display: window.innerWidth >= 768 ? 'block' : 'none' }}>
      <div className="qz-palette-header">Question Palette</div>
      <div className="qz-legend" style={{ padding: '10px 16px 0' }}>
        <div className="qz-legend-item"><div className="qz-legend-dot" style={{ background: '#9ca3af' }}></div>Not visited</div>
        <div className="qz-legend-item"><div className="qz-legend-dot" style={{ background: '#fff', border: '1px solid #ccc' }}></div>Seen</div>
        <div className="qz-legend-item"><div className="qz-legend-dot" style={{ background: '#22c55e' }}></div>Answered</div>
        <div className="qz-legend-item"><div className="qz-legend-dot" style={{ background: '#eab308' }}></div>Skipped</div>
      </div>
      {grid}
    </div>
  );

  const drawer = isOpen && (
    <div className="qz-drawer" style={{ display: window.innerWidth < 768 ? 'block' : 'none' }}>
      <div className="qz-drawer-header">
        <span>Question Palette</span>
        <button className="qz-drawer-close" onClick={onClose}>✕</button>
      </div>
      {grid}
    </div>
  );

  return <>{sidebar}{drawer}</>;
};

export default function QuizLogic() {
  const navigate = useNavigate();
  const location = useLocation();
  // modelNo will be set when coming from CEE mode
  const { subject, chapter, section, test_label, username } = location.state || {};

  const [question, setQuestion] = useState([]);
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionStatuses, setQuestionStatuses] = useState([]);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const isCEE = subject === 'CEE';
  const isWeekly = subject === 'Weekly';
  const [timeLeft, setTimeLeft] = useState((isWeekly || isCEE) ? 10800 : 2700);

  const updateStatus = (index, status) => {
    setQuestionStatuses(prev => {
      const updated = [...prev];
      if (updated[index] === 'answered' && status === 'seen') return updated;
      updated[index] = status;
      return updated;
    });
  };

  useEffect(() => {
    if (questionStatuses[current] === 'not_visited') {
      updateStatus(current, 'seen');
    }
  }, [current]);

  const jumpTo = (index) => {
    setCurrent(index);
    setPaletteOpen(false);
  };

  const handleAnswer = (opt) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [question[current].mcq_id]: opt }));
    updateStatus(current, 'answered');
  };

  const handleNext = () => {
    if (!answers[question[current].mcq_id] && questionStatuses[current] !== 'answered') {
      updateStatus(current, 'skipped');
    }
    setCurrent(c => c + 1);
  };

  const handlePrev = () => setCurrent(c => c - 1);

  function handleSubmit() {
    setSubmitted(true);
    setQuizStarted(false);
    navigate('/result', {
      state: {
        username,
        questions: question,
        answers: answers,
        timeTaken: (isCEE || isWeekly ? 10800 : 2700) - timeLeft,
        subject, chapter, section, test_label
      }
    });
  }

  async function LoadQuestions() {
    setLoading(true);

    let data, err;

    if (isCEE) {
      // CEE mode: fetch all CEE questions ordered by mcq_id (upload order)
      const result = await supabaseClient
        .from('mcq')
        .select('*')
        .eq('test_type', 'CEE')
        .eq('test_label', test_label)
        .order('mcq_id', { ascending: true });

      data = result.data;
      err = result.error;
    } 
    else if (isWeekly){
      // Weekly quiz: fetch questions from 'weekly_quiz' table
      const result = await supabaseClient
        .from('mcq')
        .select('*')
        .eq('test_type', 'weekly')
        .eq('test_label', test_label)
        .order('mcq_id', { ascending: true });

      data = result.data;
      err = result.error;


    }

    else {
      // Chapter practice: use existing RPC
      const result = await supabaseClient.rpc('get_random_questions', {
        p_subject: subject,
        p_chapter: chapter,
        p_section: section,
        p_limit: 50
      });

      data = result.data;
      err = result.error;
    }

    if (err) {
      setError(true);
    } else {
      const processed = data.map(q => {
        const optionsMap = { 'A': q.option_a, 'B': q.option_b, 'C': q.option_c, 'D': q.option_d };
        const correctText = optionsMap[q.correct_answer];

        let options;
        if (isCEE || isWeekly) {
          // CEE: keep original option order, no shuffle
          options = [q.option_a, q.option_b, q.option_c, q.option_d];
        } else {
          // Chapter practice: shuffle options
          options = [q.option_a, q.option_b, q.option_c, q.option_d].sort(() => Math.random() - 0.5);
        }

        return { ...q, options, correct_answer: correctText };
      });

      setQuestion(processed);
      setQuestionStatuses(Array(processed.length).fill('not_visited'));
      setQuizStarted(true);
    }
    setLoading(false);
  }

  useEffect(() => { LoadQuestions(); }, []);

  const progress = question.length > 0 ? Math.round((current / question.length) * 100) : 0;
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="qz-wrap">

      {/* Header */}
      <div className="qz-header">
        <div className="qz-header-left">
          <img src={logo} alt="HCM" className="qz-logo" />
          <div>
            <div className="qz-logo-name">HCM</div>
            <div className="qz-subject">
              {isCEE ? `CEE Model ${test_label}` : isWeekly ? `Weekly Test ${test_label}` : `${subject}${chapter ? ` — ${chapter}` : ''}`}
            </div>
          </div>
        </div>
        {quizStarted && !submitted && (
          <TimerDisplay timeLeft={timeLeft} setTimeLeft={setTimeLeft} onTimeUp={handleSubmit} />
        )}
      </div>

      {/* Progress */}
      {question.length > 0 && (
        <div className="qz-progress-wrap">
          <div className="qz-progress-info">
            <span>Question {current + 1} of {question.length}</span>
            <span>{progress}% complete</span>
          </div>
          <div className="qz-progress-bar">
            <div className="qz-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="qz-content">

        {loading && (
          <div className="qz-loading">
            <div className="qz-spinner"></div>
            <span>Loading questions...</span>
          </div>
        )}

        {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '40px' }}>Failed to load questions. Please go back and try again.</p>}

        {!loading && !error && question.length === 0 && (
          <div className="qz-empty">
            <div className="qz-empty-icon">📭</div>
            <h3>No questions available yet</h3>
            <p>We're still adding questions for this chapter. Check back soon!</p>
            <button className="qz-nav-btn" onClick={() => navigate('/QuizSelection')}>Go Back</button>
          </div>
        )}

        {!loading && !error && question.length > 0 && (
          <div className="qz-card">
            <div className="qz-qnum">Question {current + 1}</div>
            <div className="qz-qtext">{question[current]?.Questions}</div>
            <div className="qz-divider"></div>

            {question[current].options.map((opt, i) => (
              <button
                key={i}
                className={`qz-opt ${answers[question[current].mcq_id] === opt ? 'selected' : ''}`}
                onClick={() => handleAnswer(opt)}
              >
                <span className="qz-opt-label">{optionLabels[i]}</span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Legend on mobile */}
        <div className="qz-legend" style={{ display: window.innerWidth < 768 ? 'flex' : 'none' }}>
          <div className="qz-legend-item"><div className="qz-legend-dot" style={{ background: '#9ca3af' }}></div>Not visited</div>
          <div className="qz-legend-item"><div className="qz-legend-dot" style={{ background: '#fff', border: '1px solid #ccc' }}></div>Seen</div>
          <div className="qz-legend-item"><div className="qz-legend-dot" style={{ background: '#22c55e' }}></div>Answered</div>
          <div className="qz-legend-item"><div className="qz-legend-dot" style={{ background: '#eab308' }}></div>Skipped</div>
        </div>
      </div>

      {/* Fixed Bottom Nav */}
      <div className="qz-bottom">
        <button className="qz-nav-btn" onClick={handlePrev} disabled={current === 0}>Prev</button>
        <button className="qz-palette-btn" onClick={() => setPaletteOpen(true)}>Questions</button>
        <button className="qz-nav-btn" onClick={handleNext} disabled={current === question.length - 1}>Next</button>
        {!submitted && <button className="qz-submit-btn" onClick={handleSubmit}>Submit</button>}
      </div>

      <QuestionPalette
        statuses={questionStatuses}
        current={current}
        onJump={jumpTo}
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
}