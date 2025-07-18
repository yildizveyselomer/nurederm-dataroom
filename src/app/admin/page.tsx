'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  Download, 
  Eye, 
  Search, 
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  Activity,
  ArrowLeft,
  Filter,
  RefreshCw,
  Plus,
  Upload,
  Settings
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAnalytics } from '@/hooks/useAnalytics'
import FileUploadModal from '@/components/FileUploadModal'
import FileManagementModal from '@/components/FileManagementModal'
import UserManagementModal from '@/components/UserManagementModal'

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  totalDownloads: number
  totalPreviews: number
  totalSearches: number
  topFiles: Array<{
    fileName: string
    downloads: number
    previews: number
  }>
  userActivity: Array<{
    userId: string
    username: string
    lastActive: string
    downloads: number
    previews: number
    searches: number
  }>
  recentActivity: Array<{
    id: string
    timestamp: string
    userId: string
    username: string
    action: string
    data: any
  }>
}

export default function AdminDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d') // 1d, 7d, 30d, all
  const [refreshing, setRefreshing] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false)
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { getAnalyticsData, getUserActivities } = useAnalytics()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (user?.role !== 'admin') {
      router.push('/')
      return
    }
    
    loadAnalyticsData()
    loadCategories()
  }, [isAuthenticated, user, router, timeRange])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/files')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data.categories || [])
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const events = getAnalyticsData()
      const activities = getUserActivities()
      
      // Filter by time range
      const now = new Date()
      const timeRangeMs = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        'all': Infinity
      }[timeRange]
      
      const filteredEvents = events.filter((event: any) => 
        now.getTime() - new Date(event.timestamp).getTime() < timeRangeMs
      )
      
      // Process analytics data
      const processedData = processAnalyticsData(filteredEvents, activities)
      setAnalyticsData(processedData)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processAnalyticsData = (events: any[], activities: any[]): AnalyticsData => {
    const users = new Set(events.map(e => e.userId))
    const downloads = events.filter(e => e.action === 'file_download')
    const previews = events.filter(e => e.action === 'file_preview')
    const searches = events.filter(e => e.action === 'search')
    
    // Calculate top files
    const fileStats: { [key: string]: { downloads: number, previews: number, fileName: string } } = {}
    
    downloads.forEach(event => {
      const fileName = event.data.fileName
      if (!fileStats[fileName]) {
        fileStats[fileName] = { fileName, downloads: 0, previews: 0 }
      }
      fileStats[fileName].downloads++
    })
    
    previews.forEach(event => {
      const fileName = event.data.fileName
      if (!fileStats[fileName]) {
        fileStats[fileName] = { fileName, downloads: 0, previews: 0 }
      }
      fileStats[fileName].previews++
    })
    
    const topFiles = Object.values(fileStats)
      .sort((a, b) => (b.downloads + b.previews) - (a.downloads + a.previews))
      .slice(0, 10)
    
    // Calculate user activity
    const userStats: { [key: string]: any } = {}
    
    events.forEach(event => {
      if (!userStats[event.userId]) {
        userStats[event.userId] = {
          userId: event.userId,
          username: event.username,
          lastActive: event.timestamp,
          downloads: 0,
          previews: 0,
          searches: 0
        }
      }
      
      if (new Date(event.timestamp) > new Date(userStats[event.userId].lastActive)) {
        userStats[event.userId].lastActive = event.timestamp
      }
      
      if (event.action === 'file_download') userStats[event.userId].downloads++
      if (event.action === 'file_preview') userStats[event.userId].previews++
      if (event.action === 'search') userStats[event.userId].searches++
    })
    
    const userActivity = Object.values(userStats)
      .sort((a: any, b: any) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
    
    // Recent activity (last 50 events)
    const recentActivity = events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50)
    
    return {
      totalUsers: users.size,
      activeUsers: userActivity.filter((u: any) => 
        new Date().getTime() - new Date(u.lastActive).getTime() < 24 * 60 * 60 * 1000
      ).length,
      totalDownloads: downloads.length,
      totalPreviews: previews.length,
      totalSearches: searches.length,
      topFiles,
      userActivity: userActivity as any,
      recentActivity
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalyticsData()
    setRefreshing(false)
  }

  const handleUploadSuccess = () => {
    loadAnalyticsData() // Refresh analytics after upload
  }

  const exportToCSV = () => {
    if (!analyticsData) return

    const csvData = [
      ['User Activity Report'],
      ['Generated:', new Date().toISOString()],
      ['Time Range:', timeRange],
      [''],
      ['Username', 'Last Active', 'Downloads', 'Previews', 'Searches'],
      ...analyticsData.userActivity.map(user => [
        user.username,
        formatDate(user.lastActive),
        user.downloads.toString(),
        user.previews.toString(),
        user.searches.toString()
      ]),
      [''],
      ['File Statistics'],
      ['File Name', 'Downloads', 'Previews', 'Total'],
      ...analyticsData.topFiles.map(file => [
        file.fileName,
        file.downloads.toString(),
        file.previews.toString(),
        (file.downloads + file.previews).toString()
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dataroom-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToJSON = () => {
    if (!analyticsData) return

    const jsonData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalUsers: analyticsData.totalUsers,
        activeUsers: analyticsData.activeUsers,
        totalDownloads: analyticsData.totalDownloads,
        totalPreviews: analyticsData.totalPreviews,
        totalSearches: analyticsData.totalSearches
      },
      userActivity: analyticsData.userActivity,
      topFiles: analyticsData.topFiles,
      recentActivity: analyticsData.recentActivity
    }

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dataroom-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'file_download': return <Download className="w-4 h-4 text-green-600" />
      case 'file_preview': return <Eye className="w-4 h-4 text-blue-600" />
      case 'search': return <Search className="w-4 h-4 text-purple-600" />
      case 'login': return <Users className="w-4 h-4 text-emerald-600" />
      case 'logout': return <Users className="w-4 h-4 text-red-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'file_download': return 'bg-green-50 text-green-700'
      case 'file_preview': return 'bg-blue-50 text-blue-700'
      case 'search': return 'bg-purple-50 text-purple-700'
      case 'login': return 'bg-emerald-50 text-emerald-700'
      case 'logout': return 'bg-red-50 text-red-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dataroom</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Upload File</span>
              </button>
              
              <button
                onClick={() => setIsManagementModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Files</span>
              </button>
              
              <button
                onClick={() => setIsUserManagementModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Manage Users</span>
              </button>
              
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportToCSV}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Export CSV
                </button>
                <button
                  onClick={exportToJSON}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Export JSON
                </button>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.activeUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.totalDownloads || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Previews</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.totalPreviews || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Search className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Searches</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.totalSearches || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Files */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Most Popular Files</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData?.topFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {file.downloads} downloads
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {file.previews} previews
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {file.downloads + file.previews} total
                    </div>
                  </div>
                ))}
                {(!analyticsData?.topFiles || analyticsData.topFiles.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No file activity yet</p>
                )}
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData?.userActivity.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">Last active: {formatDate(user.lastActive)}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        {user.downloads}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {user.previews}
                      </span>
                      <span className="flex items-center">
                        <Search className="w-3 h-3 mr-1" />
                        {user.searches}
                      </span>
                    </div>
                  </div>
                ))}
                {(!analyticsData?.userActivity || analyticsData.userActivity.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No user activity yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analyticsData?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{activity.username}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(activity.action)}`}>
                        {activity.action.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.action === 'file_download' && `Downloaded: ${activity.data.fileName}`}
                      {activity.action === 'file_preview' && `Previewed: ${activity.data.fileName}`}
                      {activity.action === 'search' && `Searched: "${activity.data.query}" (${activity.data.resultsCount} results)`}
                      {activity.action === 'login' && 'Signed in'}
                      {activity.action === 'logout' && 'Signed out'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
              {(!analyticsData?.recentActivity || analyticsData.recentActivity.length === 0) && (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        categories={categories}
      />

      {/* File Management Modal */}
      <FileManagementModal
        isOpen={isManagementModalOpen}
        onClose={() => setIsManagementModalOpen(false)}
        onFileUpdated={handleUploadSuccess}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
        onUserUpdated={handleUploadSuccess}
      />
    </div>
  )
}

