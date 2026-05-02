import React,{useState} from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authProvider";
import QuizSelection from "./QuizSelction";
//we imported the useAuth hook to get the login function from the auth provider
export default function Login(){
    const {handleLogin,user} = useAuth()
    const[email,setEmail] = useState('')
    if(user!==null){
        return(<Navigate to="/QuizSelection " />)   
    }
    return(
        <div>
            <h2>Login</h2>
            <form onSubmit={(e)=>handleLogin(e,email)}>
                <input type="email" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                <button type="submit">Send Magic Link</button>
            </form>
        </div>
    )
}