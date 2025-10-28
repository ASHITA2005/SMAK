import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import './RecipeDetails.css'

function RecipeDetails() {
  const { recipeName } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to fetch from API, fall back to mock data
    api.getRecipe(recipeName)
      .then(response => {
        setRecipe(response.data)
        setLoading(false)
      })
      .catch(() => {
        // Use mock data if API is not available
        const recipes = api.getMockRecipes()
        setRecipe(recipes[recipeName])
        setLoading(false)
      })
  }, [recipeName])

  if (loading) {
    return <div className="loading">Loading recipe details...</div>
  }

  if (!recipe) {
    return (
      <div className="error">
        <h2>Recipe not found</h2>
        <Link to="/">Back to Recipes</Link>
      </div>
    )
  }

  const tasks = recipe.tasks
  const taskNames = Object.keys(tasks)
  const totalDuration = Object.values(tasks).reduce((sum, task) => sum + task.duration, 0)

  // Build dependency graph for visualization
  const getDependencies = (taskId) => {
    return recipe.deps
      .filter(([from, to]) => to === taskId)
      .map(([from]) => from)
  }

  const getDependents = (taskId) => {
    return recipe.deps
      .filter(([from, to]) => from === taskId)
      .map(([, to]) => to)
  }

  return (
    <div className="recipe-details">
      <Link to="/" className="back-button">
        ← Back to Recipes
      </Link>

      <div className="details-header">
        <div className="recipe-icon-large">
          {recipeName === 'burger' ? '🍔' : '🍟'}
        </div>
        <div>
          <h1>{recipeName.charAt(0).toUpperCase() + recipeName.slice(1)}</h1>
          <div className="recipe-summary">
            <span className="summary-item">
              <span className="summary-label">Total Time:</span>
              <span className="summary-value">{totalDuration} minutes</span>
            </span>
            <span className="summary-item">
              <span className="summary-label">Tasks:</span>
              <span className="summary-value">{taskNames.length}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="tasks-section">
        <h2>Cooking Tasks</h2>
        <div className="tasks-grid">
          {taskNames.map(taskId => {
            const task = tasks[taskId]
            const dependencies = getDependencies(taskId)
            const dependents = getDependents(taskId)

            return (
              <div key={taskId} className="task-card">
                <div className="task-header">
                  <h3 className="task-name">{task.name.replace(/_/g, ' ')}</h3>
                  <span className="task-id">{taskId}</span>
                </div>
                
                <div className="task-info">
                  <div className="info-row">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">{task.duration} min</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">Resource:</span>
                    <span className={`resource-badge resource-${task.resource}`}>
                      {task.resource}
                    </span>
                  </div>

                  {task.involvement_time && (
                    <div className="info-row">
                      <span className="info-label">Involvement:</span>
                      <span className="info-value">{task.involvement_time} min</span>
                    </div>
                  )}
                </div>

                {(dependencies.length > 0 || dependents.length > 0) && (
                  <div className="task-dependencies">
                    {dependencies.length > 0 && (
                      <div className="deps-section">
                        <span className="deps-label">Depends on:</span>
                        <div className="deps-list">
                          {dependencies.map(dep => (
                            <span key={dep} className="dep-tag">{dep}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {dependents.length > 0 && (
                      <div className="deps-section">
                        <span className="deps-label">Required by:</span>
                        <div className="deps-list">
                          {dependents.map(dep => (
                            <span key={dep} className="dep-tag">{dep}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="dependency-graph-section">
        <h2>Task Flow</h2>
        <div className="dependency-visualization">
          {taskNames.map(taskId => {
            const dependencies = getDependencies(taskId)
            const task = tasks[taskId]
            
            return (
              <div key={taskId} className="flow-node">
                <div className={`flow-task-card resource-${task.resource}`}>
                  <div className="flow-task-name">{task.name.replace(/_/g, ' ')}</div>
                  <div className="flow-task-time">{task.duration}min</div>
                </div>
                {dependencies.length > 0 && (
                  <div className="flow-arrows">
                    {dependencies.map(dep => (
                      <div key={dep} className="flow-arrow">
                        <div className="arrow-line"></div>
                        <div className="arrow-head"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RecipeDetails
