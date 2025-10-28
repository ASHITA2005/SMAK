import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom'
import RecipeBrowser from './components/RecipeBrowser'
import RecipeDetails from './components/RecipeDetails'
import TaskScheduler from './components/TaskScheduler'
import ResourceMonitor from './components/ResourceMonitor'
import api from './services/api'
import './App.css'

function App() {
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
              <Link to="/scheduler" className="nav-link">Scheduler</Link>
              <Link to="/resources" className="nav-link">Resources</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<RecipeBrowser />} />
            <Route path="/recipe/:recipeName" element={<RecipeDetails />} />
            <Route path="/scheduler" element={<TaskScheduler />} />
            <Route path="/resources" element={<ResourceMonitor />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
