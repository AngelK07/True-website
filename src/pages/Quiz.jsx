import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import supabaseClient from "../../API/supabase";

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
    const mins = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div style={{ fontWeight: 'bold', color: timeLeft < 60 ? 'red' : 'black' }}>
      Time Remaining: {formatTimer(timeLeft)}
    </div>
  );
};

// Palette component
const QuestionPalette = ({ total, statuses, current, onJump, isOpen, onClose }) => {
  const colorMap = {
    not_visited: '#9ca3af',  // grey
    seen: '#ffffff',          // white
    answered: '#22c55e',      // green
    skipped: '#eab308',       // yellow
  };

  const grid = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px' }}>
      {statuses.map((status, i) => (
        <button
          key={i}
          onClick={() => { onJump(i); onClose && onClose(); }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            border: i === current ? '2px solid #3b82f6' : '1px solid #ccc',
            background: colorMap[status],
            fontWeight: i === current ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );

  // Desktop sidebar
  const sidebar = (
    <div style={{
      position: 'fixed', top: 0, right: 0,
      width: '220px', height: '100vh',
      background: '#f9fafb', borderLeft: '1px solid #e5e7eb',
      overflowY: 'auto', zIndex: 100,
      display: window.innerWidth >= 768 ? 'block' : 'none'
    }}>
      <p style={{ padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb' }}>
        Question Palette
      </p>
      {grid}
    </div>
  );

  // Mobile drawer
  const drawer = isOpen && (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '2px solid #e5e7eb',
      zIndex: 200, maxHeight: '60vh', overflowY: 'auto',
      display: window.innerWidth < 768 ? 'block' : 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #eee' }}>
        <span style={{ fontWeight: 'bold' }}>Question Palette</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
      </div>
      {grid}
    </div>
  );

  return <>{sidebar}{drawer}</>;
};

export default function QuizLogic() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject, chapter, section } = location.state || {};

  const [question, setQuestion] = useState([]);
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2700);
  const [quizStarted, setQuizStarted] = useState(false);

  // Palette state — inside the component, fixed
  const [questionStatuses, setQuestionStatuses] = useState(Array(50).fill('not_visited'));
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Update status helper
  const updateStatus = (index, status) => {
    setQuestionStatuses(prev => {
      const updated = [...prev];
      // Don't downgrade answered to seen
      if (updated[index] === 'answered' && status === 'seen') return updated;
      updated[index] = status;
      return updated;
    });
  };

  // When current question changes, mark as seen if not_visited
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
    // If moving away without answering, mark as skipped
    if (!answers[question[current].mcq_id] && questionStatuses[current] !== 'answered') {
      updateStatus(current, 'skipped');
    }
    setCurrent(c => c + 1);
  };

  const handlePrev = () => {
    setCurrent(c => c - 1);
  };

  function handleSubmit() {
    setSubmitted(true);
    setQuizStarted(false);
    navigate('/result', {
      state: {
        questions: question,
        answers: answers,
        timeTaken: 2700 - timeLeft,
        subject, chapter, section
    }
  });
  }

  async function LoadQuestions() {
    setLoading(true);
    const { data, error } = await supabaseClient.rpc('get_random_questions', {
      p_subject: subject,
      p_chapter: chapter,
      p_section: section,
      p_limit: 50
    });
      console.log("data:", data);   // is it null? empty array? actual data?
  console.log("error:", error);

    if (error) {
      setError(true);
    } else {
      const processed = data.map(q => {
        const optionsMap = { 'A': q.option_a, 'B': q.option_b, 'C': q.option_c, 'D': q.option_d };
        const correctText = optionsMap[q.correct_answer];
        const shuffledOptions = [q.option_a, q.option_b, q.option_c, q.option_d].sort(() => Math.random() - 0.5);
        return { ...q, options: shuffledOptions, correct_answer: correctText };
      });
      setQuestion(processed);
      setQuizStarted(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    LoadQuestions();
  }, []);

  return (
    <div style={{ marginRight: '230px' }}> {/* offset for sidebar */}
      {loading && <p>Loading Questions...</p>}

      {quizStarted && !submitted && (
        <TimerDisplay timeLeft={timeLeft} setTimeLeft={setTimeLeft} onTimeUp={handleSubmit} />
      )}

      {!loading && !error && question.length > 0 && (
        <div>
          <h3>Question {current + 1}</h3>
          <p>{question[current]?.Questions}</p>

          {question[current].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              style={{
                display: 'block',
                margin: '5px 0',
                background: answers[question[current].mcq_id] === opt ? 'lightblue' : 'white'
              }}
            >
              {opt}
            </button>
          ))}

          <div style={{ marginTop: '20px' }}>
            <button onClick={handlePrev} disabled={current === 0}>Prev</button>
            <button onClick={handleNext} disabled={current === question.length - 1}>Next</button>
            {!submitted && (
              <button onClick={handleSubmit} style={{ marginLeft: '10px', background: 'orange' }}>
                Submit Quiz
              </button>
            )}
          </div>
            
        </div>
      )}

      {/* Mobile open button */}
      <button
        onClick={() => setPaletteOpen(true)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          background: '#3b82f6', color: '#fff',
          border: 'none', borderRadius: '50px',
          padding: '10px 18px', cursor: 'pointer',
          display: window.innerWidth < 768 ? 'block' : 'none',
          zIndex: 150
        }}
      >
        Questions
      </button>

      <QuestionPalette
        total={question.length}
        statuses={questionStatuses}
        current={current}
        onJump={jumpTo}
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
}