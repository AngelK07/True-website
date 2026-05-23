import React, { useState,useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/authProvider"
import logo from "../assets/logo.png"
import '../Css/QuizSelection.css'
import supabaseClient from "../../API/supabase"

export default function QuizSelection() {
  const navigate = useNavigate()
  const { handleLogout } = useAuth()
  const [username, setUsername] = useState('')
  const [subject, setSubject] = useState('')
  const [chapter, setChapter] = useState('')
  const [section, setSection] = useState('')
  const [mode, setMode] = useState('chapter')
  const [selWeek, setSelWeek] = useState(null)
  const [weeklabels, setWeeklabels] = useState([])
  const [ceelabels, setCeelabels] = useState([])
  const [selCee, setSelCee] = useState(null)
  const [labelloading,setlabelloading] = useState(false)

  const syllabus = {
    Physics: {
      "Mechanics": ["Rotational Motion", "Simple Harmonic Motion","Surface Tension", "Fluid Mechanics", "Hydrostats"],
      "Heat and Thermodynamics": ["Thermometry","Thermal Expansion", "Calorimetry,Change of state and Hygrometry",
                                  " theory Kinetic of gases", "transmission of heat", "Thermodynamics"
      ],
      "Waves and Optics": ["Waves and its characteristics", "Refraction and SuperposReflectionition of waves", "Vibration of string,Rods and air columns, waves in pipes"
                           ,"Musical Sound and Doppler Effect", "wave nature of light,Inference,Diffraction and Polarization of light"
      ],
      "Current Electricity and Magnetism": ["ThermoElectricity", "Magnetic Effect of Current","Electromagnetic Induction","Alternating Current","Moving coil Meter"],
      "Modern Physics": ["Charged particles","Radioactivity","X-rays","Photoelectricity","Atomic Structure","Semiconductor devices","Electromagnetic waves","Relativity"]
    },
    Chemistry: {
      "Physical Chemistry": ["Atomic structure","Chemical bonding","Chemical Kinetics","Fundamental of chemistry","Gaseous state","Ionic Equilibrium",
                             "Liquid state","Oxidation and reduction","Solid state","Stoichiometry","Surface chemistry","Volumetric Analysis"
      ],
      "Inorganic Chemistry": ["Alkaline earth metal","Alkaline metal","Boron family","Carbon family","Co-ordination Compounds",
                              "D-Block Elements","Halogen family","Hydrogen and its compounds", "Metallurgy","Nitrogen family","Oxygen family","Noble gases"
      ],
      "Organic Chemistry": ["Alcohol","Carbonyl Compounds","Carboxylic acid and Derivatives","Ether","GOC/reaction mechanism",
                            "Haloalkanes and haloarennes","Hydrocarbon","Isomerism","Nitrogen containing compounds","Nomenclature","Phenol","purification"
      ],
      "Applied Chemistry": ["Polymers and dye","Bio-inorganic chemistry","cement","Fundamentals of Applied Chemistry","Modern chemical manufactures","Paper and pulp"],
      "Analytical chemistry": ["Acid,base and salt"]
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
      "Verbal Reasoning": ["Analogy","Classification","Coding and Decoding","Series","Inserting the Missing Character","Ranking and Timer Sequence Test", "Venn Diagram" , "Blood Relation","Clock","Calender","Direction and distance","Sitting Arrangement"],
      "Numerical reasoning": ["Number Systems","Percentage","Profit and loss","Simple Intrest","Average","Time and Work","Age","Permutation and Combination",],
      "Logical Sequencing": ["Statements and conclusions","Statements and Arguments","Statements and Assumptions","Statements and Course of Action","Causes and Effect"],
      "Spatial Relation/Abstract Reasoning": ["Completion of Series","Analogy","Classification","Counting of Figures"
        //,"Dice","Embedded Figures","Paper Folding","Paper Cutting","Mirror Image","Water Image","Dot Situation","Figure Matrix"
      ],
    }
  }

  const chapters = subject ? Object.keys(syllabus[subject]) : []
  const sections = chapter ? syllabus[subject][chapter] : []

useEffect(() =>  {
  if(mode === 'weekly') fetchlabels('weekly',setWeeklabels)
  if (mode === 'cee') fetchlabels('CEE',setCeelabels)
},[mode])

  async function fetchlabels(testType, setter){
    setlabelloading(true)
    const { data,error} = await supabaseClient
      .from('mcq')
      .select('test_label')
      .eq('test_type', testType)
      .not('test_label','is',null)

      if(!error && data){
        //get unique label, preserve order
        const unique = [...new Set(data.map(r => r.test_label))]
        setter(unique)
      }
      setlabelloading(false)
  }

  const handleSubjectChange = (e) => {
    setSubject(e.target.value)
    
    setChapter('')
    setSection('')
  }

  const handleChapterChange = (e) => {
    setChapter(e.target.value)
    setSection('')
  }

  async function onLogout() {
    await handleLogout()
    navigate('/Login')
  }

 function handleSubmit() {
  if (mode === 'chapter') {
    if (!subject) return
    navigate('/Quiz', { state: { username, subject, chapter, section } })
  } else if (mode === 'weekly') {
    if (!selWeek) return
    navigate('/Quiz',{ state: { username, subject: 'Weekly', test_type: 'weekly', test_label: selWeek } })
  } else {
    if (!selCee) return
    navigate('/Quiz', { state: { username, subject: 'CEE', test_type: 'CEE', test_label: selCee } })
  }
}

  return (
    <div className="qs-wrap">

      <div className="qs-top">
        <button type="button" className="qs-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

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
          {labelloading ? (
            <p style  ={{textAlign: 'center',color:'#888'}}>Loading...</p>
          ):  weeklabels.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888' }}>No tests available</p>
          ) : (
          <div className="qs-weekly-grid">
            {weeklabels.map(label => (
              <button
                key={label}
                className={`qs-week-btn ${selWeek === label ? 'selected' : ''}`}
                onClick={() => setSelWeek(label)}
              >
                {label}
              </button>
            ))}
          </div>
      )}
      </div>
      )}

           {/* CEE Full Test Section */}
      {mode === 'cee' && (
        <div className="qs-section-box">
          <div className="qs-section-title">🎯 CEE Full Test — Model Papers</div>
          {labelloading ? (
            <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>
          ) : ceelabels.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888' }}>No CEE tests available yet.</p>
          ) : (
            <div className="qs-cee-grid">
              {ceelabels.map(label => (
                <button
                  key={label}
                  className={`qs-cee-btn ${selCee === label ? 'selected' : ''}`}
                  onClick={() => setSelCee(label)}
                >
                  CEE {label}  {/* "2024" from DB becomes "CEE 2024" */}
                </button>
              ))}
            </div>
          )}
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