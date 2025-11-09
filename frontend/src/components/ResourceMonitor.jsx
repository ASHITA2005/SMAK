import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../services/api'
import { scheduleRecipes } from '../utils/scheduler'
import './ResourceMonitor.css'

function ResourceMonitor({ sessionData: propSessionData }) {
  const location = useLocation()
  const [resources, setResources] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)

  // Resource limits
  const resourceLimits = {
    countertop: 5,
    grill: 1,
    stove: 3,
    toaster: 1,
    fryer: 2
  }

  useEffect(() => {
    // Calculate resource usage from schedule
    const calculateResourceUsage = () => {
      // Get session data from props, location state, or session storage
      let sessionData = propSessionData || location.state?.sessionData
      if (!sessionData) {
        // Try to get from session storage
        const stored = sessionStorage.getItem('sessionData')
        if (stored) {
          try {
            sessionData = JSON.parse(stored)
          } catch (e) {
            sessionData = null
          }
        }
      }

      if (!sessionData || !sessionData.selectedRecipes) {
        // No active session, show all resources as available
        const defaultResources = {}
        Object.keys(resourceLimits).forEach(resource => {
          defaultResources[resource] = {
            total: resourceLimits[resource],
            available: resourceLimits[resource]
          }
        })
        setResources(defaultResources)
        setLoading(false)
        return
      }

      // Generate schedule from selected recipes
      const recipesData = api.getMockRecipes()
      const schedule = scheduleRecipes(recipesData, sessionData.selectedRecipes)

      // Calculate current resource usage at currentTime
      const resourceUsage = {}
      Object.keys(resourceLimits).forEach(resource => {
        resourceUsage[resource] = {
          total: resourceLimits[resource],
          used: 0
        }
      })

      // Count tasks that are currently active (start <= currentTime < end)
      schedule.forEach(task => {
        if (task.start <= currentTime && currentTime < task.end) {
          if (resourceUsage[task.resource]) {
            resourceUsage[task.resource].used++
          }
        }
      })

      // Calculate available resources
      const resourceStatus = {}
      Object.keys(resourceUsage).forEach(resource => {
        resourceStatus[resource] = {
          total: resourceUsage[resource].total,
          available: Math.max(0, resourceUsage[resource].total - resourceUsage[resource].used)
        }
      })

      setResources(resourceStatus)
      setLoading(false)
    }

    // Try to fetch from API first, fall back to calculation
    api.getResources()
      .then(response => {
        setResources(response.data)
        setLoading(false)
      })
      .catch(() => {
        // Calculate from schedule
        calculateResourceUsage()
      })
  }, [currentTime, propSessionData, location.state])

  // Update current time periodically to simulate real-time monitoring
  // Only update if there's an active session
  useEffect(() => {
    const sessionData = propSessionData || location.state?.sessionData || 
      (() => {
        const stored = sessionStorage.getItem('sessionData')
        return stored ? JSON.parse(stored) : null
      })()
    
    if (!sessionData || !sessionData.selectedRecipes) {
      return // No active session, don't update time
    }

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        // Get max time from schedule to stop at the end
        const recipesData = api.getMockRecipes()
        const schedule = scheduleRecipes(recipesData, sessionData.selectedRecipes)
        const maxTime = schedule.length > 0 ? Math.max(...schedule.map(task => task.end)) : 0
        return prev < maxTime ? prev + 1 : prev
      })
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [propSessionData, location.state])

  if (loading) {
    return <div className="loading">Loading resources...</div>
  }

  const resourceNames = Object.keys(resources)
  const resourceIcons = {
    countertop: '🧰',
    grill: '🔥',
    stove: '🔥',
    toaster: '🍞',
    fryer: '🍟'
  }

  const getResourceColor = (available, total) => {
    const percentage = (available / total) * 100
    if (percentage >= 50) return '#4caf50'
    if (percentage >= 25) return '#ff9800'
    return '#f44336'
  }

  return (
    <div className="resource-monitor">
      <div className="monitor-header">
        <h1>Resource Monitor</h1>
        <p className="subtitle">Real-time kitchen resource availability</p>
        {(() => {
          const sessionData = propSessionData || location.state?.sessionData || 
            (() => {
              const stored = sessionStorage.getItem('sessionData')
              return stored ? JSON.parse(stored) : null
            })()
          if (sessionData && sessionData.selectedRecipes) {
            const recipesData = api.getMockRecipes()
            const schedule = scheduleRecipes(recipesData, sessionData.selectedRecipes)
            const maxTime = schedule.length > 0 ? Math.max(...schedule.map(task => task.end)) : 0
            return (
              <div className="time-display">
                <span className="time-label">Current Time:</span>
                <span className="time-value">{currentTime} min</span>
                <span className="time-separator">/</span>
                <span className="time-total">{maxTime} min</span>
              </div>
            )
          }
          return null
        })()}
      </div>

      <div className="resources-grid">
        {resourceNames.map(resourceName => {
          const resource = resources[resourceName]
          const { total, available } = resource
          const used = total - available
          const usagePercentage = (used / total) * 100
          const availabilityPercentage = (available / total) * 100

          return (
            <div key={resourceName} className="resource-card">
              <div className="resource-card-header">
                <div className="resource-icon-large">
                  {resourceIcons[resourceName] || '⚙️'}
                </div>
                <div className="resource-card-title">
                  <h2>{resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}</h2>
                  <p className="resource-status">
                    {available > 0 ? (
                      <span className="status-available">Available</span>
                    ) : (
                      <span className="status-busy">Busy</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="resource-stats">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Available:</span>
                  <span className="stat-value available">{available}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">In Use:</span>
                  <span className="stat-value used">{used}</span>
                </div>
              </div>

              <div className="resource-progress">
                <div className="progress-bar">
                  <div
                    className="progress-used"
                    style={{
                      width: `${usagePercentage}%`,
                      backgroundColor: getResourceColor(available, total)
                    }}
                  />
                  <div
                    className="progress-available"
                    style={{
                      width: `${availabilityPercentage}%`,
                      backgroundColor: '#e0e0e0'
                    }}
                  />
                </div>
                <div className="progress-labels">
                  <span>Used: {used}/{total}</span>
                  <span>Free: {available}/{total}</span>
                </div>
              </div>

              {available === 0 && (
                <div className="resource-warning">
                  ⚠️ All resources in use
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="monitor-summary">
        <h3>Resource Summary</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <div className="summary-label">Total Resources</div>
              <div className="summary-value">
                {resourceNames.reduce((sum, name) => sum + resources[name].total, 0)}
              </div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <div className="summary-label">Available</div>
              <div className="summary-value">
                {resourceNames.reduce((sum, name) => sum + resources[name].available, 0)}
              </div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🔧</div>
            <div className="summary-content">
              <div className="summary-label">In Use</div>
              <div className="summary-value">
                {resourceNames.reduce((sum, name) => sum + (resources[name].total - resources[name].available), 0)}
              </div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📈</div>
            <div className="summary-content">
              <div className="summary-label">Utilization</div>
              <div className="summary-value">
                {Math.round(
                  (resourceNames.reduce((sum, name) => sum + (resources[name].total - resources[name].available), 0) /
                    resourceNames.reduce((sum, name) => sum + resources[name].total, 0)) * 100
                )}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourceMonitor
