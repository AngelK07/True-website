import React from 'react'
import {BrowserRouter,Route,Routes,Navigate} from "react-router-dom"
import Login from './pages/Login'
import AuthProvider from '../context/authProvider'
import ProtectedRoute from '../components/ProtectedRoute'
import Verify from '../context/verify'
import QuizSelection from './pages/QuizSelction'
import QuizLogic from './pages/Quiz'
import Result from './pages/result'
import Payment from './pages/payment'  // adjust path if needed
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
          <Route path="/Quiz" element={
            <ProtectedRoute>
              <QuizLogic/>
              </ProtectedRoute>
          }/>
          <Route path="/result" element={
            <ProtectedRoute>
              <Result/>
              </ProtectedRoute>
          }/>
          <Route path="/payment" element={
              <Payment/>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
