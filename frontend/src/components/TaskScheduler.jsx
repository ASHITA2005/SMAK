import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './TaskScheduler.css'

function TaskScheduler() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState({})

  useEffect(() => {
    // Get recipes for task names
    try {
      const recipesData = api.getMockRecipes()
      setRecipes(recipesData)
    } catch (error) {
      console.error('Error loading recipes:', error)
    }

    // Try to fetch schedule from API
    api.getSchedule()
      .then(response => {
        setSchedule(response.data)
        setLoading(false)
      })
      .catch(() => {
        // Generate mock schedule data
        generateMockSchedule()
        setLoading(false)
      })
  }, [])

  const generateMockSchedule = () => {
    // Mock schedule based on the scheduling algorithm
    const mockSchedule = [
      { taskId: 'burger_t1', start: 0, end: 2, resource: 'countertop', recipe: 'burger', taskName: 'form_patties' },
      { taskId: 'fries_f1', start: 0, end: 2, resource: 'countertop', recipe: 'fries', taskName: 'cut_potatoes' },
      { taskId: 'burger_t3', start: 2, end: 3, resource: 'toaster', recipe: 'burger', taskName: 'toast_buns' },
      { taskId: 'burger_t2', start: 2, end: 8, resource: 'grill', recipe: 'burger', taskName: 'grill_patties' },
      { taskId: 'fries_f2', start: 2, end: 6, resource: 'fryer', recipe: 'fries', taskName: 'fry_potatoes' },
      { taskId: 'fries_f3', start: 6, end: 7, resource: 'countertop', recipe: 'fries', taskName: 'salt_fries' },
      { taskId: 'burger_t4', start: 8, end: 9, resource: 'countertop', recipe: 'burger', taskName: 'assemble' }
    ]
    setSchedule(mockSchedule)
  }

  if (loading) {
    return <div className="loading">Loading schedule...</div>
  }

  const maxTime = Math.max(...schedule.map(task => task.end), 0)
  const timeScale = 100 / maxTime

  const tasksByResource = schedule.reduce((acc, task) => {
    if (!acc[task.resource]) {
      acc[task.resource] = []
    }
    acc[task.resource].push(task)
    return acc
  }, {})

  const resources = ['countertop', 'grill', 'stove', 'toaster', 'fryer']

  return (
    <div className="task-scheduler">
      <div className="scheduler-header">
        <h1>Task Scheduler</h1>
        <p className="subtitle">Visual timeline of all cooking tasks</p>
      </div>

      <div className="timeline-container">
        <div className="timeline-header">
          <div className="resource-column-header">Resource</div>
          <div className="timeline-axis">
            {Array.from({ length: Math.ceil(maxTime) + 1 }, (_, i) => (
              <div key={i} className="time-marker" style={{ left: `${i * timeScale}%` }}>
                <span className="time-label">{i}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="timeline-resources">
          {resources.map(resource => (
            <div key={resource} className="resource-row">
              <div className="resource-label">
                <span className={`resource-icon resource-${resource}`}>
                  {resource === 'countertop' && '🧰'}
                  {resource === 'grill' && '🔥'}
                  {resource === 'stove' && '🔥'}
                  {resource === 'toaster' && '🍞'}
                  {resource === 'fryer' && '🍟'}
                </span>
                <span className="resource-name">{resource}</span>
              </div>
              <div className="timeline-track">
                {tasksByResource[resource]?.map(task => {
                  const left = (task.start / maxTime) * 100
                  const width = ((task.end - task.start) / maxTime) * 100

                  return (
                    <div
                      key={task.taskId}
                      className={`task-block task-${task.recipe}`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        minWidth: `${width > 5 ? width : 5}%`
                      }}
                      title={`${task.recipe} - ${task.taskName}`}
                    >
                      <div className="task-block-content">
                        <div className="task-block-recipe">{task.recipe}</div>
                        <div className="task-block-name">{task.taskName.replace(/_/g, ' ')}</div>
                        <div className="task-block-time">{task.start}-{task.end}min</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="schedule-summary">
        <h2>Schedule Summary</h2>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-label">Total Tasks:</span>
            <span className="stat-value">{schedule.length}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Total Time:</span>
            <span className="stat-value">{maxTime} minutes</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Resources Used:</span>
            <span className="stat-value">{Object.keys(tasksByResource).length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskScheduler
