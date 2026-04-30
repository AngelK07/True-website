// Get the things i need for login page
import React,{useState,useEffect,useContext,createContext} from "react"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { supabaseClient } from "../API/supabase"

// Create the authentication context
const AuthContext = createContext()

//make a default function i.e initial state
export default function AuthProvider({children}){
    const[loading,setloading] = useState(false)
    const[user,setUser] = useState(null)
     // check initial contidion if a user is logged is not?  
     const [verifyiing,setverifying] = useState(false)
     const[authError,setautherror] = useState(null)
     const[authSuccess,setauthsuccess] = useState(false)
        useEffect(()=>{
            const params = new URLSearchParams(window.location.search)
            const token_Hash = params.get('token_hash')
            const type = params.get('type')
            if(token_Hash){
                //verify the token
                setverifying(true)
                supabaseClient.auth
                .verifyOtp({token_hash: token_Hash, type: type || 'email'})
                .then(({error})=>{
                    if(error){
                        setautherror(error.message)
                    }
                    else{
                        setauthsuccess(true)
                        //now clear params
                        window.history.replaceState({}, document.title, '/')
                    }
                setauthsuccess(false)
                setverifying(false)
                })
            }
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
            setUser(session.user)
        } else {
            setUser(null)
        }
    })

    return () => subscription.unsubscribe()
}, [])
const handleLogin = async (e,email) => {
    e.preventDefault()
    setloading(true)
    const {error} = await supabaseClient.auth.signInWithOtp({email
        ,options:{
            emailRedirectTo: window.location.origin + "/verify",}
        })
    if(error){
        alert(error.error_description || error.message)
    }
    setloading(false)
}
const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    setUser(null)
    setauthsuccess(false)
    setverifying(false)
}
return(
    <AuthContext.Provider value={{user,loading,handleLogin,handleLogout,verifyiing,authError,authSuccess}}>
{children}</AuthContext.Provider>
)
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};