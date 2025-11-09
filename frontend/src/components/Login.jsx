import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking')
  const navigate = useNavigate()

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          const data = await response.json()
          setBackendStatus('connected')
        } else {
          setBackendStatus('error')
          setError('Backend server is not responding correctly. Please check if the server is running.')
        }
      } catch (err) {
        setBackendStatus('error')
        setError('Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000')
      }
    }
    checkBackend()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let response, data

      if (isLogin) {
        // Login
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        })
      } else {
        // Register
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        })
      }

      // Check if response is ok and try to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        try {
          data = await response.json()
          setError(data.message || `${isLogin ? 'Login' : 'Registration'} failed`)
        } catch (parseError) {
          // If response is not JSON, show status text
          setError(`Error: ${response.status} ${response.statusText || 'Server error'}. Please check if the backend server is running.`)
        }
        return
      }

      // Parse successful response
      try {
        data = await response.json()
        if (data.token && data.username) {
          login(data.username, data.token)
          navigate('/')
        } else {
          setError('Invalid response from server')
        }
      } catch (parseError) {
        setError('Failed to parse server response')
      }
    } catch (err) {
      console.error('Registration/Login error:', err)
      setError(err.message || 'Network error. Please make sure the backend server is running on http://localhost:5000')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">🍳</span>
          <h1>Smart Kitchen</h1>
          <p>{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          {backendStatus === 'checking' && (
            <div className="info-message">Checking backend connection...</div>
          )}
          {backendStatus === 'error' && (
            <div className="error-message">
              {error || 'Backend server is not accessible. Please start the backend server.'}
            </div>
          )}
          {backendStatus === 'connected' && error && (
            <div className="error-message">{error}</div>
          )}

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading || backendStatus !== 'connected'}
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="toggle-button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setFormData({ username: '', email: '', password: '' })
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

