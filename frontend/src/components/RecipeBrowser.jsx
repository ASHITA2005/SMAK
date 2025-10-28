import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import './RecipeBrowser.css'

function RecipeBrowser() {
  const [recipes, setRecipes] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to fetch from API, fall back to mock data
    api.getRecipes()
      .then(response => {
        setRecipes(response.data)
        setLoading(false)
      })
      .catch(() => {
        // Use mock data if API is not available
        setRecipes(api.getMockRecipes())
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="loading">Loading recipes...</div>
  }

  const recipeNames = Object.keys(recipes)

  return (
    <div className="recipe-browser">
      <div className="browser-header">
        <h1>Recipe Collection</h1>
        <p className="subtitle">Select a recipe to view details and start cooking</p>
      </div>

      <div className="recipes-grid">
        {recipeNames.map(recipeName => {
          const recipe = recipes[recipeName]
          const taskCount = Object.keys(recipe.tasks).length
          const totalDuration = Object.values(recipe.tasks)
            .reduce((sum, task) => sum + task.duration, 0)

          return (
            <Link 
              key={recipeName} 
              to={`/recipe/${recipeName}`}
              className="recipe-card"
            >
              <div className="recipe-card-icon">
                {recipeName === 'burger' ? '🍔' : '🍟'}
              </div>
              <div className="recipe-card-content">
                <h2 className="recipe-card-title">
                  {recipeName.charAt(0).toUpperCase() + recipeName.slice(1)}
                </h2>
                <div className="recipe-card-stats">
                  <div className="stat">
                    <span className="stat-label">Tasks:</span>
                    <span className="stat-value">{taskCount}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Time:</span>
                    <span className="stat-value">{totalDuration}min</span>
                  </div>
                </div>
              </div>
              <div className="recipe-card-arrow">→</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default RecipeBrowser
