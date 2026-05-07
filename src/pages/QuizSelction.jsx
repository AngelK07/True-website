import React,{useEffect,useState} from "react"
import {useNavigate} from "react-router-dom"
import logo from "../assets/logo.png"
//import { useNavigate } from "react-router-dom";
export default function QuizSelection(){
    //for navigating to quiz page
    const navigate = useNavigate()
    //forstoring the value (difficulty is not used yet but will be used later)
    const[username,setUsername] = useState('')
    const [subject, setSubject] = useState('')
    const [chapter, setChapter] = useState('')
    const [section, setSection] = useState('')
    const [difficulty, setDifficulty] = useState('')
   // const navigate = useNavigate()
    const syllabus = {
        Physics: {
            "Mechanics":[], 
            "Heat and Thermodynamics":[],
            "Waves and Optics":[], 
            "Current Electricity and Magnetism":[], 
            "Modern Physics":[]
        },
        Chemistry: {
            "Physical Chemistry":[],
            "Inorganic Chemistry":[],
            "Organic Chemistry":[],
            "Applied Chemistry":[],
            "Analytic Chemistry":[]
        },
        Zoology:{
            "Evolutionary Biology":["Origin of life","Evolution of life"],
            "Animal Diversity and Classification":["Classification of aniimals","Protozoa","Porifera","Coelenterata","Platyhelminthes",
                                                   "Nemathelminthes","Annelida","Arthopoda","Mollucs","Echinodermata","Chordata"],
            "Animal Tissue and Histology":["Epithetial and Connective tissue","Muscular and Nervous tissues"],
            "Study of Selected Animals":["plasmadium","Earthworm","Frog"],
            "Human biology and Physiology":["Digestive system","Respiratory system","Circulatory system","Excretory system","Nervous system",
                                            "Sense organ","Endocrinology","Reproductive system"],
            "Microbial Diseases and Immunology":["Diseases","Immunity and Vaccines"],
            "Medical Technology and Applied Biology":["Medical Technology","Applied microbiology"],
            "Biota, Enviroment and Conservation":["Animal behavior","Enviromental pollution","Adaptation","Conservation Biology"],
        },
        Botany:{
            "Basic component of life":["Biomolecultes"],
            "Biodiversity":["Classification of plants","Virus","Bacteria","Algae","Fungi","Lichens","Bryophytes","Pteridophytes","Gymnosperms",
                            "Morphology","Taxonomy"],
            "Ecology and vegetation":["Ecology"],
            "Cell Biology":["Cell Biology" ,"Cell Division"],
            "Genetics":["Genetics",],
            "Plant anatomy":["Plant anatomy"],
            "Plant physiology":["Water relation","Photosynthesis","Respiration","Plant growth and development"],
            "Developmental botany":["Reproductive of plants"],
            "Applied botany":["Application of Biology"],
        },
        MAT:{
            "Verbal reasoning":[],
            "Numerical reasoning":[],
            "Logical sequencing":[],
            "Spatial relation":[],
        }
        }
    //derived from above
    const chapters = subject ? Object.keys(syllabus[subject]):[] 
    const sections = chapter ? syllabus[subject][chapter]:[]
    //for changing once they select the value
    const handleSubjectChange = (e) => {
        setSubject(e.target.value)
        setChapter('')
        setSection('')
    }
    const handleChapterChange = (e) => {
        setChapter(e.target.value)
        setSection('')
    }
    function handleSubmit(e) {
        //e.preventDefault()
        if(!subject){
            //alert("Select at least subject");
            return;
        }
        // will use these values to load quiz later
        navigate('/quiz', {state: {username, subject, chapter, section}})
    }
    return(
        <div>
            <img src={logo} alt="Logo/"/>
            <h1>Quiz Selection</h1>
                <input type="text" id="Username" placeholder="Enter your name" value={username} onChange={(e) => setUsername(e.target.value)}></input>
                <select value={subject} onChange={handleSubjectChange} required>
                    <option value="">Select Subject</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Zoology">Zoology</option>
                    <option value="Botany">Botany</option>
                    <option value="MAT">MAT</option>
                </select>
                {subject && (
                    <select value={chapter} onChange={handleChapterChange} required>
                        <option value="">--Select Chapter--</option>
                        {chapters.map( c => <option key={c} value={c}>{c}</option>)}
                    </select>
                )}
                {chapter && (
                    <select value={section} onChange={(e) => setSection(e.target.value)}>
                        <option value="">--Select Section--</option>
                        {sections.map( s => <option key={s} value={s}>{s}</option>)}
                    </select>
                )}
                <button onClick= {handleSubmit}>Start Quiz</button>                
        </div>
    )
}