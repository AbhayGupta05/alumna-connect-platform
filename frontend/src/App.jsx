import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import AlumniDirectory from './components/AlumniDirectory'
import ProfilePage from './components/ProfilePage'
import Events from './components/Events'
import Messages from './components/Messages'
import CommunicationHub from './components/CommunicationHub'
import CareerGrowth from './components/CareerGrowth'
import AcademicLegacy from './components/AcademicLegacy'
import Networking from './components/Networking'
import AdminDashboard from './components/AdminDashboard'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import AlumniDashboard from './components/AlumniDashboard'
import UniversalLoginPage from './components/UniversalLoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import RegisterPage from './components/RegisterPage'
import LandingPage from './components/LandingPage'
import LoadingSpinner from './components/LoadingSpinner'
import CreateAccountPage from './components/CreateAccountPage'
import './App.css'

const AppContent = () => {
  const { isAuthenticated, user, isLoading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<UniversalLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          {/* Public preview pages */}
          <Route path="/directory" element={<AlumniDirectory />} />
          <Route path="/events" element={<Events />} />
          <Route path="/communication" element={<CommunicationHub />} />
          <Route path="/career" element={<CareerGrowth />} />
          <Route path="/legacy" element={<AcademicLegacy />} />
          <Route path="/networking" element={<Networking />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <Routes>
          {/* Super Admin Dashboard */}
          <Route 
            path="/super-admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Dashboard */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <div className="min-h-screen bg-gray-50">
                  <Navbar 
                    userType={user?.role} 
                    onLogout={handleLogout}
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                  />
                  <div className="flex">
                    <Sidebar 
                      userType={user?.role} 
                      isOpen={sidebarOpen}
                      onClose={() => setSidebarOpen(false)}
                    />
                    <main className="flex-1 lg:ml-64 pt-16">
                      <AdminDashboard />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Alumni Dashboard */}
          <Route 
            path="/alumni/dashboard" 
            element={
              <ProtectedRoute requiredRole="alumni">
                <AlumniDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Student Dashboard */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute requiredRole="student">
                <div className="min-h-screen bg-gray-50">
                  <Navbar 
                    userType={user?.role} 
                    onLogout={handleLogout}
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                  />
                  <div className="flex">
                    <Sidebar 
                      userType={user?.role} 
                      isOpen={sidebarOpen}
                      onClose={() => setSidebarOpen(false)}
                    />
                    <main className="flex-1 lg:ml-64 pt-16">
                      <Dashboard />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Other protected routes */}
          <Route path="/directory" element={<AlumniDirectory />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/communication" element={<CommunicationHub />} />
          <Route path="/career" element={<CareerGrowth />} />
          <Route path="/legacy" element={<AcademicLegacy />} />
          <Route path="/networking" element={<Networking />} />
          
          {/* Redirect to appropriate dashboard based on role */}
          <Route path="/" element={
            user?.role === 'super_admin' ? <Navigate to="/super-admin/dashboard" /> :
            user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
            user?.role === 'alumni' ? <Navigate to="/alumni/dashboard" /> :
            user?.role === 'student' ? <Navigate to="/student/dashboard" /> :
            <Navigate to="/login" />
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
