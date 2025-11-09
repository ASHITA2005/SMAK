import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './RecipeSelector.css'

const recipeIcons = {
  burger: '🍔',
  fries: '🍟',
  pasta: '🍝',
  salad: '🥗',
  chicken: '🍗',
  soup: '🍲',
  sandwich: '🥪',
  pizza: '🍕',
  tacos: '🌮',
  rice_bowl: '🍚',
  stir_fry: '🍜',
  nachos: '🧀'
}

function RecipeSelector({ onStartSession }) {
  const [recipes, setRecipes] = useState({})
  const [selectedRecipes, setSelectedRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to fetch from API, fall back to mock data
    api.getRecipes()
      .then(response => {
        setRecipes(response.data)
        setLoading(false)
      })
      .catch(() => {
        setRecipes(api.getMockRecipes())
        setLoading(false)
      })
  }, [])

  const toggleRecipe = (recipeName) => {
    setSelectedRecipes(prev => {
      if (prev.includes(recipeName)) {
        return prev.filter(name => name !== recipeName)
      } else {
        return [...prev, recipeName]
      }
    })
  }

  const handleStartSession = () => {
    if (selectedRecipes.length > 0) {
      onStartSession(selectedRecipes)
    }
  }

  if (loading) {
    return <div className="loading">Loading recipes...</div>
  }

  const recipeNames = Object.keys(recipes)

  return (
    <div className="recipe-selector">
      <div className="selector-header">
        <h1>Select Recipes to Cook</h1>
        <p className="subtitle">Choose multiple recipes and we'll optimize the schedule</p>
      </div>

      <div className="recipes-selection-grid">
        {recipeNames.map(recipeName => {
          const recipe = recipes[recipeName]
          const isSelected = selectedRecipes.includes(recipeName)
          const taskCount = Object.keys(recipe.tasks).length
          const totalDuration = Object.values(recipe.tasks)
            .reduce((sum, task) => sum + task.duration, 0)

          return (
            <div
              key={recipeName}
              className={`recipe-select-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleRecipe(recipeName)}
            >
              <div className="select-card-checkbox">
                <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
                  {isSelected && '✓'}
                </div>
              </div>
              <div className="select-card-icon">
                {recipeIcons[recipeName] || '🍽️'}
              </div>
              <div className="select-card-content">
                <h3>{recipeName.charAt(0).toUpperCase() + recipeName.slice(1)}</h3>
                <div className="select-card-stats">
                  <span>{taskCount} tasks</span>
                  <span>•</span>
                  <span>{totalDuration} min</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="selector-footer">
        <div className="selection-summary">
          {selectedRecipes.length === 0 ? (
            <span className="no-selection">No recipes selected</span>
          ) : (
            <span className="selection-count">
              {selectedRecipes.length} recipe{selectedRecipes.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        <button
          className="start-session-button"
          onClick={handleStartSession}
          disabled={selectedRecipes.length === 0}
        >
          Start Cooking Session
        </button>
      </div>
    </div>
  )
}

export default RecipeSelector

