import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoadingSpinner from './components/LoadingSpinner'
import LoginPage from './components/LoginPage'
import LandingPage from './components/LandingPage'
import CreateAccountPage from './components/CreateAccountPage'
import AlumniClaimProfile from './components/AlumniClaimProfile'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import './App.css'

function App() {
  const { isAuthenticated, userType, isLoading, logout, user } = useAuth()
  
  console.log('App render - isAuthenticated:', isAuthenticated, 'userType:', userType, 'isLoading:', isLoading)

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/create-account" element={<CreateAccountPage />} />
              <Route path="/claim-alumni-profile" element={<AlumniClaimProfile />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/" element={
                userType === 'super_admin' ? (
                  <SuperAdminDashboard />
                ) : (
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow text-center">
                      <h3 className="text-lg font-semibold mb-2">✅ Welcome Back!</h3>
                      <p className="mb-4">You are successfully logged in as: <strong>{userType}</strong></p>
                      {user && (
                        <div className="mb-4">
                          <p>Email: {user.email}</p>
                          <p>Name: {user.first_name} {user.last_name}</p>
                        </div>
                      )}
                      <button 
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  )
}

export default App
