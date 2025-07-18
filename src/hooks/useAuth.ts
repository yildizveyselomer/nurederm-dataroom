'use client'

import { useState, useEffect } from 'react'

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

interface User {
  id: string
  username: string
  role: 'admin' | 'investor'
  name: string
  email: string
  permissions?: {
    canDownload: boolean
    canPreview: boolean
    allowedCategories: string[]
  }
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for existing authentication on mount
    checkAuth()
    
    // Set up session timeout check
    const interval = setInterval(checkAuth, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [])

  const checkAuth = () => {
    try {
      const authData = localStorage.getItem('dataroom-auth')
      if (!authData) {
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        return
      }

      const { timestamp, user: userData } = JSON.parse(authData)
      const now = Date.now()

      if (now - timestamp > SESSION_TIMEOUT) {
        // Session expired
        localStorage.removeItem('dataroom-auth')
        setIsAuthenticated(false)
        setUser(null)
      } else {
        // Update timestamp for session extension
        localStorage.setItem('dataroom-auth', JSON.stringify({ 
          timestamp: now, 
          user: userData 
        }))
        setIsAuthenticated(true)
        setUser(userData)
      }
    } catch (error) {
      // Invalid data, clear auth
      localStorage.removeItem('dataroom-auth')
      setIsAuthenticated(false)
      setUser(null)
    }
    
    setIsLoading(false)
  }

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Load users from JSON file
      const response = await fetch('/users.json')
      const userData = await response.json()
      
      // Find user
      const foundUser = userData.users.find((u: any) => 
        u.username === username && u.password === password && u.isActive
      )

      if (!foundUser) {
        return { success: false, error: 'Invalid username or password' }
      }

      // Create session data
      const authData = {
        timestamp: Date.now(),
        user: {
          id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
          name: foundUser.name,
          email: foundUser.email,
          permissions: foundUser.permissions
        }
      }

      localStorage.setItem('dataroom-auth', JSON.stringify(authData))
      setIsAuthenticated(true)
      setUser(authData.user)

      // Log the login activity
      logActivity('login', { userId: foundUser.id, username: foundUser.username })

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Authentication service unavailable' }
    }
  }

  const logout = () => {
    if (user) {
      logActivity('logout', { userId: user.id, username: user.username })
    }
    
    localStorage.removeItem('dataroom-auth')
    setIsAuthenticated(false)
    setUser(null)
  }

  const logActivity = async (action: string, data: any) => {
    try {
      const activity = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action,
        data,
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      // In a real app, this would be sent to a backend API
      // For now, we'll store it in localStorage for demo purposes
      const existingActivities = JSON.parse(localStorage.getItem('user-activities') || '[]')
      existingActivities.push(activity)
      localStorage.setItem('user-activities', JSON.stringify(existingActivities))
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  }
}

