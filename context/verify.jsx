import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabaseClient } from "../API/supabase"

export default function Verify() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const verifyUser = async () => {
            const { data, error } = await supabaseClient.auth.getSession()

            if (error) {
                setError(error.message)
                setLoading(false)
                return
            }

            if (data.session) {
                navigate("/QuizSelection", { replace: true })
            } else {
                navigate("/login", { replace: true })
            }
        }

        verifyUser()
    }, [navigate])

    if (loading) {
        return (
            <div>
                <h1>Verifying...</h1>
            </div>
        )
    }

    if (error) {
        return (
            <div>
                <h1>Error: {error}</h1>
            </div>
        )
    }

    return null
}