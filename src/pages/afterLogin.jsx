import React from "react"
import { useAuth } from "../../context/authProvider"
export default function AfterLogin(){
    const { handleLogout } = useAuth()
    return(
        <div>
            <h2>Welcome to the protected page!</h2>
            <p>You are successfully logged in.</p>
            <br/>
            <p>Click the logout button to end your session.</p>
            <button onClick={()=>window.location.href="/Login"

            }>Logout</button>
        </div>
    )
}

