import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import RecipeBrowser from './components/RecipeBrowser'
import RecipeDetails from './components/RecipeDetails'
import TaskScheduler from './components/TaskScheduler'
import ResourceMonitor from './components/ResourceMonitor'
import RecipeSelector from './components/RecipeSelector'
import api from './services/api'
import './App.css'

function App() {
  const [sessionData, setSessionData] = useState(null)

  const handleStartSession = (selectedRecipes) => {
    setSessionData({ selectedRecipes, timestamp: Date.now() })
  }

  return (
    <Router>
      <div className="app">
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
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<RecipeBrowser />} />
            <Route path="/select" element={<RecipeSelectorWrapper onStartSession={handleStartSession} />} />
            <Route path="/recipe/:recipeName" element={<RecipeDetails />} />
            <Route path="/scheduler" element={<TaskSchedulerWrapper sessionData={sessionData} />} />
            <Route path="/resources" element={<ResourceMonitor />} />
          </Routes>
        </main>
      </div>
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
