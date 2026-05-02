import React,{useEffect,useState} from "react";
import { useNavigate } from "react-router-dom";
export default function QuizSelection(){
    const [subject, setSubject] = useState('')
    const [chapter, setChapter] = useState('')
    const [difficulty, setDifficulty] = useState('')
    const navigate = useNavigate()

    function handleSubmit(e) {
        e.preventDefault()
        // will use these values to load quiz later
        console.log(subject, chapter, difficulty)
    }
    return(
        <div>
            <h1>Quiz Selection</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="subject_input">Subject:</label>
                <input type="text" id="subject_input" name="subject_input" required />
                <label htmlFor="chapter_input">Chapter:</label>
                <input type="text" id="chapter_input" name="chapter_input" required />
                <label htmlFor="difficulty_input">Difficulty:</label>
                <input type="text" id="difficulty_input" name="difficulty_input" required />
                <button type="submit">Start Quiz</button>
            </form>
        </div>
    )
}