import React from 'react'
import {BrowserRouter,Route,Routes,Navigate} from "react-router-dom"
import AfterLogin from './pages/afterLogin'
import Login from './pages/Login'
import AuthProvider from '../context/authProvider'
import ProtectedRoute from '../components/ProtectedRoute'
import Verify from '../context/verify'
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/after-login" element={
            <ProtectedRoute>
              <AfterLogin />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App