import React from 'react'
import {BrowserRouter,Route,Routes,Navigate} from "react-router-dom"
import Login from './pages/Login'
import AuthProvider from '../context/authProvider'
import ProtectedRoute from '../components/ProtectedRoute'
import Verify from '../context/verify'
import QuizSelection from './pages/QuizSelction'
import AfterLogin from './pages/afterLogin'
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/QuizSelection" element={
            <ProtectedRoute>
              <QuizSelection />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App