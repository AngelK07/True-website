import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/authProvider"

export default function Verify() {
    const { verifyiing, authError, authSuccess } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (authSuccess) {
            navigate('/QuizSelection', { replace: true })
        }
    }, [authSuccess])

    if (verifyiing) return <div><h1>Verifying...</h1></div>
    if (authError) return <div><h1>Error: {authError}</h1></div>
    
    return <div><h1>Loading...</h1></div>
    //fixed bug idk just force deploying and it worked idk why it was not working before
}