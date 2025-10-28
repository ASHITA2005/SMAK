import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './ResourceMonitor.css'

function ResourceMonitor() {
  const [resources, setResources] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to fetch from API, fall back to mock data
    api.getResources()
      .then(response => {
        setResources(response.data)
        setLoading(false)
      })
      .catch(() => {
        // Use mock data if API is not available
        setResources(api.getMockResources())
        setLoading(false)
      })
  }, [])

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
