import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"
import '../Css/QuizSelection.css'

export default function QuizSelection() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [subject, setSubject] = useState('')
  const [chapter, setChapter] = useState('')
  const [section, setSection] = useState('')
  const [mode, setMode] = useState('chapter')
  const [selWeek, setSelWeek] = useState(null)
  const [selCee, setSelCee] = useState(null)

  const syllabus = {
    Physics: {
      "Mechanics": [],
      "Heat and Thermodynamics": [],
      "Waves and Optics": [],
      "Current Electricity and Magnetism": [],
      "Modern Physics": []
    },
    Chemistry: {
      "Physical Chemistry": [],
      "Inorganic Chemistry": [],
      "Organic Chemistry": [],
      "Applied Chemistry": [],
      "Analytic Chemistry": []
    },
    Zoology: {
      "Evolutionary Biology": ["Origin of Life", "Evolution of Life"],
      "Animal Diversity and Classification": ["Classification of Animals", "Protozoa", "Porifera", "Coelenterata", "Platyhelminthes", "Nemathelminthes", "Annelida", "Arthropoda", "Mollucs", "Echinodermata", "Chordata"],
      "Animal Tissue and Histology": ["Epithelial and Connective Tissue", "Muscular and Nervous Tissues"],
      "Study of Selected Animals": ["Plasmodium", "Earthworm", "Frog"],
      "Human Biology and Physiology": ["Digestive System", "Respiratory System", "Circulatory System", "Excretory System", "Nervous System", "Sense Organ", "Endocrinology", "Reproductive System"],
      "Microbial Diseases and Immunology": ["Diseases", "Immunity and Vaccines"],
      "Medical Technology and Applied Biology": ["Medical Technology", "Applied Microbiology"],
      "Biota, Environment and Conservation": ["Animal behavior", "Environmental pollution", "Adaptation", "Conservation Biology"],
    },
    Botany: {
      "Basic component of life": ["Biomolecules"],
      "Biodiversity": ["Classification of plants", "Virus", "Bacteria", "Algae", "Fungi", "Lichens", "Bryophytes", "Pteridophytes", "Gymnosperms", "Morphology", "Taxonomy"],
      "Ecology and vegetation": ["Ecology"],
      "Cell Biology": ["Cell Biology", "Cell Division"],
      "Genetics": ["Genetics"],
      "Plant anatomy": ["Plant anatomy"],
      "Plant physiology": ["Water relation", "Photosynthesis", "Respiration", "Plant growth and development"],
      "Developmental botany": ["Reproductive of plants"],
      "Applied botany": ["Application of Biology"],
    },
    MAT: {
      "Verbal reasoning": [],
      "Numerical reasoning": [],
      "Logical sequencing": [],
      "Spatial relation": [],
    }
  }

  const chapters = subject ? Object.keys(syllabus[subject]) : []
  const sections = chapter ? syllabus[subject][chapter] : []

  const handleSubjectChange = (e) => {
    setSubject(e.target.value)
    setChapter('')
    setSection('')
  }

  const handleChapterChange = (e) => {
    setChapter(e.target.value)
    setSection('')
  }

  function handleSubmit() {
    if (mode === 'chapter') {
      if (!subject) return
      navigate('/Quiz', { state: { username, subject, chapter, section } })
    } else if (mode === 'weekly') {
      if (!selWeek) return
      alert('Week ' + selWeek + ' test — coming soon')
    } else {
      if (!selCee) return
      alert('Model ' + selCee + ' — coming soon')
    }
  }

  return (
    <div className="qs-wrap">

      {/* Logo */}
      <div className="qs-logo-area">
        <img src={logo} alt="HCM Logo" />
      </div>
      <div className="qs-tagline">CEE Preparation Platform</div>

      {/* Mode Cards */}
      <div className="qs-mode-label">Select mode</div>
      <div className="qs-cards">
        <div
          className={`qs-card ${mode === 'chapter' ? 'active' : ''}`}
          onClick={() => setMode('chapter')}
        >
          <span className="qs-card-icon">📚</span>
          <div className="qs-card-title">Chapter Practice</div>
          <div className="qs-card-sub">Topic-wise MCQs</div>
        </div>

        <div
          className={`qs-card ${mode === 'weekly' ? 'active' : ''}`}
          onClick={() => setMode('weekly')}
        >
          <span className="qs-card-icon">📅</span>
          <div className="qs-card-title">Weekly Test</div>
          <span className="qs-coming-badge">Beta</span>
        </div>

        <div
          className={`qs-card qs-card-full ${mode === 'cee' ? 'active' : ''}`}
          onClick={() => setMode('cee')}
        >
          <span className="qs-card-icon">🎯</span>
          <div className="qs-card-title">CEE Full Test</div>
          <div className="qs-card-sub">Model papers</div>
        </div>
      </div>

      {/* Chapter Practice Section */}
      {mode === 'chapter' && (
        <div className="qs-section-box">
          <div className="qs-section-title">📚 Chapter Practice</div>
          <div className="qs-field">
            <label>Your name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="qs-field">
            <label>Subject</label>
            <select value={subject} onChange={handleSubjectChange}>
              <option value="">Select subject</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Zoology">Zoology</option>
              <option value="Botany">Botany</option>
              <option value="MAT">MAT</option>
            </select>
          </div>
          {subject && (
            <div className="qs-field">
              <label>Chapter</label>
              <select value={chapter} onChange={handleChapterChange}>
                <option value="">Select chapter</option>
                {chapters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          {chapter && sections.length > 0 && (
            <div className="qs-field">
              <label>Section</label>
              <select value={section} onChange={(e) => setSection(e.target.value)}>
                <option value="">Select section (optional)</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Weekly Test Section */}
      {mode === 'weekly' && (
        <div className="qs-section-box">
          <div className="qs-section-title">📅 Weekly Test</div>
          <div className="qs-field"><label>Select week</label></div>
          <div className="qs-weekly-grid">
            {Array.from({ length: 20 }, (_, i) => i + 1).map(w => (
              <button
                key={w}
                className={`qs-week-btn ${selWeek === w ? 'selected' : ''}`}
                onClick={() => setSelWeek(w)}
              >
                Week {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CEE Full Test Section */}
      {mode === 'cee' && (
        <div className="qs-section-box">
          <div className="qs-section-title">🎯 CEE Full Test — Model Papers</div>
          <div className="qs-cee-grid">
            {Array.from({ length: 20 }, (_, i) => i + 1).map(m => (
              <button
                key={m}
                className={`qs-cee-btn ${selCee === m ? 'selected' : ''}`}
                onClick={() => setSelCee(m)}
              >
                Model {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="qs-warning">
        ⚠️ Select subject, chapter and section for best results. Without section, questions will be pulled from the full chapter.
      </div>

      <button className="qs-start-btn" onClick={handleSubmit}>
        Start Quiz
      </button>

    </div>
  )
}