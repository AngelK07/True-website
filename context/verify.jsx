import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabaseClient } from "../API/supabase"

export default function Verify() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

useEffect(() => {
    const ua = navigator.userAgent;
    const isWebView = (
        ua.includes('wv') ||
        /gmail/i.test(ua) ||
        ua.includes('FBAN') ||
        ua.includes('FBAV')
    );

    if (isWebView) {
        const url = window.location.href;
        window.location.href = `intent://${url.replace(/https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        return; // stop here, let Chrome reload the page
    }
    }, []);

    useEffect(() => {
        const verifyUser = async () => {
            const { data, error } = await supabaseClient.auth.getSession()

            if (error) {
                setError(error.message)
                setLoading(false)
                return
            }

            if (data.session) {
                const user = data.session.user
                const { data: upsertData, error: upsertError } = await supabaseClient
                    .from("profiles")
                    .upsert({
                        id: user.id,
                        email: user.email,
                        username: user.email,
                        created_at: new Date().toISOString()
                    }, { 
                    onConflict: "id",
                    ignoreDuplicates: false
                    })//wont change if the id already exists
                setLoading(false)
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