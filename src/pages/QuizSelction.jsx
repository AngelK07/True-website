import React,{useEffect} from "react";
import { useNavigate } from "react-router-dom";
export default function QuizSelection(){
    const Subject = document.getElementById('subject_input').value;
    const Chapter = document.getElementById('chapter_input').value;
    const Difficulty = document.getElementById('difficulty_input').value;
    return(
        <div>
            <h1>Quiz Selection</h1>
            <form>
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