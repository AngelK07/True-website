import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/authProvider"
import QuizSelection from "../src/pages/QuizSelction"
export default function Verify(){
    const {verifyiing,authError,authSuccess} = useAuth()
    if(verifyiing){
        return <div><h1> Verifying....</h1></div>
    }
    if(authError){
        return <div><h1> Error: {authError}</h1></div>
    }
    if(authSuccess){
        return <div>
                <Navigate to="/pages/QuizSelection" />
                </div>
    }
    return <div>
        <Navigate to="/Login" />
    </div>
}