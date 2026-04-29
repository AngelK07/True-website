import React from 'react'
import Tutorialone from './pages/tutorialone'
import Login from './context/login'
import AuthProvider from '../context/authProvider'
function App() {
  return (
    <div>
      <Tutorialone/>
      <AuthProvider/>
    </div>
  )
}

export default App