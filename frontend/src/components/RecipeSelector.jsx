import React, { useState, useEffect } from 'react'
import api from '../services/api'
import GroceryList from './GroceryList'
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
  const [step, setStep] = useState(1)
  const [numChefs, setNumChefs] = useState(1)
  const [chefNames, setChefNames] = useState(["Chef 1"])
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

  const handleNumChefsChange = (e) => {
    const num = Math.max(1, parseInt(e.target.value) || 1)
    setNumChefs(num)
    const newNames = [...chefNames]
    while(newNames.length < num) newNames.push(`Chef ${newNames.length + 1}`)
    setChefNames(newNames.slice(0, num))
  }

  const handleNameChange = (index, value) => {
    const newNames = [...chefNames]
    newNames[index] = value
    setChefNames(newNames)
  }

  const handleStartSession = () => {
    if (selectedRecipes?.length > 0) {
      const finalChefs = chefNames.map(n => n?.trim()).filter(n => n && n.length > 0)
      if (finalChefs.length === 0) finalChefs.push("Default Chef")
      onStartSession(selectedRecipes, finalChefs)
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

      {selectedRecipes?.length > 0 && (
        <GroceryList selectedRecipes={selectedRecipes} />
      )}

      <div className="selector-footer" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', marginTop: '20px' }}>
        {step === 1 ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className="selection-summary">
              {selectedRecipes?.length === 0 ? (
                <span className="no-selection">No recipes selected</span>
              ) : (
                <span className="selection-count font-bold text-lg" style={{ color: '#2c3e50' }}>
                  {selectedRecipes.length} recipe{selectedRecipes.length > 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <button
              className="start-session-button"
              onClick={() => setStep(2)}
              disabled={selectedRecipes?.length === 0}
              style={{ background: '#3498db', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: selectedRecipes?.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              Next: Assign Chefs ➜
            </button>
          </div>
        ) : (
          <div className="chef-setup-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.2rem' }}>🧑‍🍳 Chef Assignment</h3>
            
            <label style={{ display: 'flex', alignItems: 'center', fontWeight: '600', color: '#34495e' }}>
              How many people are cooking?
              <input 
                type="number" 
                min="1" max="10" 
                value={numChefs} 
                onChange={handleNumChefsChange} 
                style={{ marginLeft: '12px', padding: '8px 12px', width: '80px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              />
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', marginBottom: '16px' }}>
              {chefNames.map((name, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ minWidth: '70px', color: '#64748b', fontWeight: '500' }}>Chef {idx + 1}:</span>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder="Enter name..."
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '10px' }}>
              <button 
                onClick={() => setStep(1)}
                style={{ background: '#94a3b8', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
              >
                ⬅ Back
              </button>
              <button 
                onClick={handleStartSession}
                style={{ background: '#e11d48', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)' }}
              >
                🔥 Start Cooking Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipeSelector

