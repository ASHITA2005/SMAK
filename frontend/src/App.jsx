import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import RecipeBrowser from './components/RecipeBrowser'
import RecipeDetails from './components/RecipeDetails'
import TaskScheduler from './components/TaskScheduler'
import ResourceMonitor from './components/ResourceMonitor'
import RecipeSelector from './components/RecipeSelector'
import Login from './components/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import api from './services/api'
import './App.css'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppContent() {
  const [sessionData, setSessionData] = useState(null)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleStartSession = (selectedRecipes) => {
    const newSessionData = { selectedRecipes, timestamp: Date.now() }
    setSessionData(newSessionData)
    // Store in sessionStorage so ResourceMonitor can access it
    sessionStorage.setItem('sessionData', JSON.stringify(newSessionData))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app">
      {isAuthenticated && (
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="logo">
              <span className="logo-icon">🍳</span>
              <span className="logo-text">Smart Kitchen</span>
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Recipes</Link>
              <Link to="/select" className="nav-link">Start Session</Link>
              <Link to="/scheduler" className="nav-link">Scheduler</Link>
              <Link to="/resources" className="nav-link">Resources</Link>
              <div className="user-section">
                <span className="username">Welcome, {user?.username}</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<ProtectedRoute><RecipeBrowser /></ProtectedRoute>} />
          <Route path="/select" element={<ProtectedRoute><RecipeSelectorWrapper onStartSession={handleStartSession} /></ProtectedRoute>} />
          <Route path="/recipe/:recipeName" element={<ProtectedRoute><RecipeDetails /></ProtectedRoute>} />
          <Route path="/scheduler" element={<ProtectedRoute><TaskSchedulerWrapper sessionData={sessionData} /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><ResourceMonitor sessionData={sessionData} /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

function RecipeSelectorWrapper({ onStartSession }) {
  const navigate = useNavigate()

  const handleStart = (selectedRecipes) => {
    onStartSession(selectedRecipes)
    navigate('/scheduler')
  }

  return <RecipeSelector onStartSession={handleStart} />
}

function TaskSchedulerWrapper({ sessionData }) {
  return <TaskScheduler sessionData={sessionData} />
}

export default App
