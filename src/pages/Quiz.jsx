import React,{useEffect,useState,useRef} from "react"
import { useNavigate,useLocation} from "react-router-dom"
import supabaseClient from "../../API/supabase"
//we imported the things we actually neeed
export default function QuizLogic(){
    //using useref
    const timerInterval = useRef(null)  
    const timeLeft = useRef(2700)
    //use the uselocation to get the data from quiz selection page
    const location = useLocation()
    const {subject,chapter,section,difficulty} = location.state;
    //idk what i am doing with this but i will figure it out later
    const[question,setQuestion]=useState([])
    const[answer,setAnswers]=useState([])
    const[current,setCurrent]=useState(0)
    const[selected,setSelected]=useState(null)
    const[submitted,setSubmitted]=useState(false)
    const[loading,setLoading]=useState(false)
    const[error,setError]=useState(false)
    async function LoadQuestions(){
        setLoading(true)
        setError(false)
        const {data,error} = await supabaseClient
        .rpc('get_random_questions',{
            p_subject: subject,
            p_chapter: chapter,
            p_section: section,
            p_limit: 50
        })
        if(error){
            setError(true)
            alert(error.error_description || error.message)
        }
        else{
            const shuffledQuestions = data.sort(() => Math.random() - 0.5)
            const processed = shuffledQuestions.map(q => {
            const optionsMap = {
            'A': q.option_a,
            'B': q.option_b,
            'C': q.option_c,
            'D': q.option_d
        }
            const correctText = optionsMap[q.correct_answer] // get actual text before shuffle
    
            const shuffledOptions = [q.option_a, q.option_b, q.option_c, q.option_d]
            .sort(() => Math.random() - 0.5)
        return {
            ...q,
            options: shuffledOptions,
            correct_answer: correctText // now stored as text, not A/B/C/D
        }
    })
        setQuestion(processed)
        startTimer()
        }
        setLoading(false)
    }
    function startTimer(){
        timerInterval.current= setInterval(()=> {
            timeLeft.current--;
            if(timeLeft.current <= 0){
                clearInterval(timerInterval.current)
                handleSubmit()
            }   
        },1000)
    }
   function nextQuestion(){
        setCurrent(current+1)
   }
   function prevQuestion(){
        setCurrent(current-1)
   }
   function handleSubmit(){
        setSubmitted(true)
        //calculate score and show result
   }
   useEffect(()=> {
        LoadQuestions();
        return () => clearInterval(timerInterval.current)
    }, [])

   return(
    <>
    {loading && <p>Loading...</p>}
    {error && <p>Something went wrong.Try again later</p>}
    {!loading && !error && question.length > 0 && (
        <div>
            {/* render the quiz interface here*/}
            <p>{current+1}. {question[current]?.Questions}</p>
            {/*render the options here*/}
            {question[current].options.map((opt,i) => (
                <button
                key={i}
                onClick={() => setSelected(opt)}
                style={{
                    display: 'block',
                    background: selected === opt ? 'lightblue' : 'white',
                    color: selected === opt ? 'white' : 'black',
                }} 
                >
                    {opt}  
                </button>   
            ))} 
            {/* Explanation — show only after submitted */}
                {submitted && (
                    <div>
                        <p>Correct: {question[current].correct_answer}</p>
                        <p>Explanation: {question[current].explanation}</p>
                    </div>
                )}

                {/* Navigation */}
                <button onClick={prevQuestion} disabled={current === 0}>Prev</button>
                <button onClick={nextQuestion} disabled={current === question.length - 1}>Next</button>
                <button onClick={handleSubmit}>Submit</button>   
        </div>
    )}
    </>
    )
}