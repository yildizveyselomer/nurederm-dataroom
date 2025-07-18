'use client'

import { useEffect } from 'react'
import { useAuth } from './useAuth'

interface AnalyticsEvent {
  id: string
  timestamp: string
  userId: string
  username: string
  action: string
  data: any
  userAgent: string
  url: string
  sessionId: string
}

interface PageViewEvent {
  page: string
  duration?: number
}

interface FileEvent {
  fileId: string
  fileName: string
  fileType: string
  category: string
}

interface SearchEvent {
  query: string
  resultsCount: number
}

export function useAnalytics() {
  const { user } = useAuth()

  // Generate or get session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics-session-id')
    if (!sessionId) {
      sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('analytics-session-id', sessionId)
    }
    return sessionId
  }

  // Track page views automatically
  useEffect(() => {
    if (user) {
      trackPageView({ page: window.location.pathname })
      
      // Track page visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          trackEvent('page_blur', { page: window.location.pathname })
        } else {
          trackEvent('page_focus', { page: window.location.pathname })
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user])

  const trackEvent = async (action: string, data: any) => {
    if (!user) return

    try {
      const event: AnalyticsEvent = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        userId: user.id,
        username: user.username,
        action,
        data,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: getSessionId()
      }

      // Store in localStorage for demo (in production, send to backend)
      const existingEvents = JSON.parse(localStorage.getItem('analytics-events') || '[]')
      existingEvents.push(event)
      
      // Keep only last 1000 events to prevent storage overflow
      if (existingEvents.length > 1000) {
        existingEvents.splice(0, existingEvents.length - 1000)
      }
      
      localStorage.setItem('analytics-events', JSON.stringify(existingEvents))

      // Also log to console for debugging
      console.log('Analytics Event:', event)
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  const trackPageView = (data: PageViewEvent) => {
    trackEvent('page_view', data)
  }

  const trackFileDownload = (data: FileEvent) => {
    trackEvent('file_download', data)
  }

  const trackFilePreview = (data: FileEvent) => {
    trackEvent('file_preview', data)
  }

  const trackSearch = (data: SearchEvent) => {
    trackEvent('search', data)
  }

  const trackCategoryFilter = (category: string) => {
    trackEvent('category_filter', { category })
  }

  const trackSessionStart = () => {
    trackEvent('session_start', { 
      sessionId: getSessionId(),
      userRole: user?.role 
    })
  }

  const trackSessionEnd = () => {
    trackEvent('session_end', { 
      sessionId: getSessionId(),
      duration: Date.now() - parseInt(getSessionId().split('').slice(0, 13).join(''))
    })
  }

  // Track mouse movements and clicks (for heatmap data)
  const trackInteraction = (element: string, position?: { x: number, y: number }) => {
    trackEvent('interaction', { 
      element, 
      position,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    })
  }

  // Get analytics data (for admin dashboard)
  const getAnalyticsData = () => {
    try {
      return JSON.parse(localStorage.getItem('analytics-events') || '[]')
    } catch {
      return []
    }
  }

  // Get user activities
  const getUserActivities = () => {
    try {
      return JSON.parse(localStorage.getItem('user-activities') || '[]')
    } catch {
      return []
    }
  }

  return {
    trackEvent,
    trackPageView,
    trackFileDownload,
    trackFilePreview,
    trackSearch,
    trackCategoryFilter,
    trackSessionStart,
    trackSessionEnd,
    trackInteraction,
    getAnalyticsData,
    getUserActivities
  }
}

