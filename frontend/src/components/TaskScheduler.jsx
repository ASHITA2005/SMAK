import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { scheduleRecipes } from '../utils/scheduler'
import './TaskScheduler.css'

const recipeColors = {
  burger: '#667eea',
  fries: '#f5576c',
  pasta: '#4facfe',
  salad: '#43e97b',
  chicken: '#fa709a',
  soup: '#fee140',
  sandwich: '#30cfd0',
  pizza: '#ff6b6b',
  tacos: '#ffa94d',
  rice_bowl: '#51cf66',
  stir_fry: '#339af0',
  nachos: '#ffd43b'
}

function TaskScheduler({ sessionData }) {
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState([])
  const [recipes, setRecipes] = useState({})
  const [selectedRecipes, setSelectedRecipes] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Get recipes
    try {
      const recipesData = api.getMockRecipes()
      setRecipes(recipesData)
    } catch (error) {
      console.error('Error loading recipes:', error)
    }

    // If session data exists, use it; otherwise show empty state
    if (sessionData && sessionData.selectedRecipes) {
      setSelectedRecipes(sessionData.selectedRecipes)
      const recipesData = api.getMockRecipes()
      const generatedSchedule = scheduleRecipes(recipesData, sessionData.selectedRecipes, sessionData.chefs)
      setSchedule(generatedSchedule)
      setCurrentTime(0) // Reset time when new session starts
      setIsPlaying(false) // Stop playback
    }
  }, [sessionData])

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || !schedule || schedule.length === 0) return

    const maxTime = Math.max(...schedule.map(task => task.end), 0)
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= maxTime) {
          setIsPlaying(false)
          return maxTime
        }
        return prev + 1
      })
    }, 4000) // 4 seconds = 1 simulated minute

    return () => clearInterval(interval)
  }, [isPlaying, schedule])

  const handleStartNewSession = () => {
    navigate('/select')
  }

  if (!schedule || schedule.length === 0) {
    return (
      <div className="task-scheduler">
        <div className="empty-scheduler flex flex-col items-center justify-center py-20 px-4">
          <div className="empty-icon bg-slate-50 w-32 h-32 flex items-center justify-center rounded-full mb-6 shadow-sm border border-slate-100 text-6xl">📋</div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">No Active Session</h1>
          <p className="text-slate-500 font-medium mb-8 text-lg">Select recipes to coordinate your kitchen workflow.</p>
          <button className="start-session-btn bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white font-black py-4 px-8 rounded-xl shadow-xl flex items-center gap-3 transform transition-all hover:-translate-y-1" onClick={handleStartNewSession}>
            Set Up Your Kitchen ➜
          </button>
        </div>
      </div>
    )
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

  const getMaxLayers = (resource) => {
    const tasks = tasksByResource[resource] || []
    return tasks.length > 0 ? Math.max(...tasks.map(t => t.layer || 0)) + 1 : 1
  }

  // Get task state based on current time
  const getTaskState = (task) => {
    if (task.end <= currentTime) return 'completed'
    if (task.start <= currentTime && currentTime < task.end) return 'active'
    return 'future'
  }

  const resources = ['countertop', 'grill', 'stove', 'toaster', 'fryer']

  return (
    <div className="task-scheduler">
      <div className="scheduler-header">
        <div className="header-titles">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Optimized Cooking Schedule</h1>
          <div className="recipe-tags">
            {selectedRecipes.map(r => (
               <span key={r} className="recipe-tag">
                 {r.replace(/_/g, ' ')}
               </span>
            ))}
          </div>
        </div>
        <div className="header-actions">
          <div className="active-tasks-badge">
            <h3>
              Live Operations
              <span className="live-indicator"></span>
            </h3>
           <ul>
            {schedule?.filter(t => getTaskState(t) === 'active')?.length === 0 ? (
               <li className="empty">Awaiting assignments...</li>
            ) : (
               schedule?.filter(t => getTaskState(t) === 'active').map(t => (
                 <li key={t.taskId}>
                   <div className="active-marker"></div>
                   <span className="emoji">👉</span>
                   <span className="task-text">{t.taskName?.replace(/_/g, ' ').toUpperCase()}</span>
                 </li>
               ))
            )}
          </ul>
        </div>
          <button 
            onClick={() => navigate('/live')} 
            className="start-live-btn"
          >
            <span className="icon">⚡</span> <span className="text">Start Live Mode</span>
          </button>
        </div>
      </div>

      <div className="timeline-controls">
        <div className="controls-container">
          <div className="time-controls">
            <button 
              className={`play-pause-btn ${isPlaying ? 'pause' : 'play'}`}
              onClick={() => {
                if (currentTime >= maxTime) {
                  setCurrentTime(0)
                }
                setIsPlaying(!isPlaying)
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              className="reset-btn"
              onClick={() => {
                setCurrentTime(0)
                setIsPlaying(false)
              }}
              title="Reset to start"
            >
              ⏮
            </button>
            <div className="time-slider-container">
              <input
                type="range"
                min="0"
                max={maxTime}
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(Number(e.target.value))
                  setIsPlaying(false) // Pause when manually scrubbing
                }}
                className="time-slider"
              />
              <div className="time-display">
                <span className="current-time">{currentTime}</span>
                <span className="time-separator">/</span>
                <span className="max-time">{maxTime} min</span>
              </div>
            </div>
          </div>
        </div>
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
            {/* Current time indicator line */}
            <div 
              className="current-time-indicator"
              style={{ left: `${(currentTime / maxTime) * 100}%` }}
            />
          </div>
        </div>

        <div className="timeline-resources">
          {resources.map(resource => {
            const maxLayers = getMaxLayers(resource)
            const trackTasks = tasksByResource[resource] || []
            const trackHeight = 60 + (maxLayers - 1) * 60
            
            return (
              <div key={resource} className="resource-row">
                <div className="resource-label">
                  <span className={`resource-icon resource-${resource}`}>
                    {resource === 'countertop' && '🧰'}
                    {resource === 'grill' && '🔥'}
                    {resource === 'stove' && '🔥'}
                    {resource === 'toaster' && '🍞'}
                    {resource === 'fryer' && '🍟'}
                  </span>
                  <span className="resource-name font-black tracking-widest uppercase text-[10px] bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">{resource}</span>
                </div>
                <div 
                  className="timeline-track" 
                  style={{ height: `${trackHeight}px` }}
                >
                  {/* Current time indicator line for this track */}
                  <div 
                    className="current-time-line"
                    style={{ left: `${(currentTime / maxTime) * 100}%` }}
                  />
                  {trackTasks.map((task) => {
                    const layer = task.layer || 0;
                    const left = (task.start / maxTime) * 100
                    const width = ((task.end - task.start) / maxTime) * 100
                    const top = 8 + (layer * 60)
                    const taskState = getTaskState(task)

                    return (
                      <div
                        key={task.taskId || `${task.recipe}_${task.taskName}`}
                        className={`task-block task-${taskState} ${selectedTask?.taskId === task.taskId ? 'selected' : ''}`}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          minWidth: `14px`,
                          top: `${top}px`,
                          backgroundColor: recipeColors[task.recipe] || '#667eea',
                          outline: selectedTask?.taskId === task.taskId ? '4px solid #fff' : 'none',
                          outlineOffset: '2px',
                          zIndex: selectedTask?.taskId === task.taskId ? '20' : layer + 1
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTask(task)
                        }}
                      >
                        {/* Always display tooltip unconditionally. CSS hover drives visibility. */}
                        <div className="task-tooltip">
                          <div className="font-black text-rose-400 uppercase text-[10px] tracking-widest mb-1">{task.recipe?.replace(/_/g, ' ')} • {task.duration}m</div>
                          <div className="font-bold text-white text-lg mb-2">{task.taskName?.replace(/_/g, ' ').toUpperCase()}</div>
                          <div className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded-md inline-flex items-center gap-2 border border-slate-700 w-full justify-between">
                            <span className="font-semibold text-xs tracking-wide">🧑‍🍳 {task.chef}</span>
                            <span className="text-xs text-slate-400">{task.start}m ➜ {task.end}m</span>
                          </div>
                        </div>

                        {width > 6 && ( /* Only render internal string if width is sufficiently large (6% of timescale approx ~2-4m) */
                          <div className="task-block-content truncate px-1">
                             <div className="task-name truncate text-[11px] leading-tight opacity-90">{task.taskName?.replace(/_/g, ' ')}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
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
          <div className="summary-stat">
            <span className="stat-label">Recipes:</span>
            <span className="stat-value">{selectedRecipes.length}</span>
          </div>
        </div>
      </div>

      <div className="scheduler-actions">
        <button className="new-session-btn" onClick={handleStartNewSession}>
          Start New Session
        </button>
      </div>

      {selectedTask && (
        <div className="task-detail-modal" onClick={() => setSelectedTask(null)}>
          <div className="task-detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Task Details</h2>
              <button className="close-modal" onClick={() => setSelectedTask(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-row">
                  <span className="detail-label">Recipe:</span>
                  <span className="detail-value" style={{ color: recipeColors[selectedTask.recipe] }}>
                    {selectedTask.recipe.charAt(0).toUpperCase() + selectedTask.recipe.slice(1)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Task:</span>
                  <span className="detail-value">
                    {selectedTask.taskName.replace(/_/g, ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Resource:</span>
                  <span className="detail-value">{selectedTask.resource}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{selectedTask.duration} minutes</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Start Time:</span>
                  <span className="detail-value">{selectedTask.start} minutes</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">End Time:</span>
                  <span className="detail-value">{selectedTask.end} minutes</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time Range:</span>
                  <span className="detail-value">{selectedTask.start} - {selectedTask.end} minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskScheduler
