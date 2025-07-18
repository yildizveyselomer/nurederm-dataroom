'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Download, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  Presentation,
  LogOut,
  Clock,
  Tag,
  Eye,
  Menu,
  X,
  BarChart3
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import FilePreviewModal from '@/components/FilePreviewModal'
import { useAuth } from '@/hooks/useAuth'
import { useAnalytics } from '@/hooks/useAnalytics'

interface DataroomFile {
  id: string
  name: string
  type: string
  size: string
  lastModified: string
  description: string
  tags: string[]
  downloadUrl: string
}

interface DataroomCategory {
  id: string
  title: string
  description: string
  files: DataroomFile[]
}

interface DataroomData {
  title: string
  lastUpdated: string
  categories: DataroomCategory[]
  rootFiles: DataroomFile[]
}

export default function DataroomPage() {
  const [data, setData] = useState<DataroomData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<DataroomFile | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const router = useRouter()
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const { 
    trackFileDownload, 
    trackFilePreview, 
    trackSearch, 
    trackCategoryFilter,
    trackSessionStart,
    trackInteraction 
  } = useAnalytics()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated && !data) {
      // Load dataroom data
      fetch('/inventory.json')
        .then(res => res.json())
        .then(data => setData(data.dataroom))
        .catch(err => console.error('Failed to load dataroom data:', err))
    }
  }, [isAuthenticated, isLoading, router, data])

  useEffect(() => {
    if (isAuthenticated && data) {
      // Track session start
      trackSessionStart()
    }
  }, [isAuthenticated, data, trackSessionStart])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handlePreview = (file: DataroomFile) => {
    setPreviewFile(file)
    setIsPreviewOpen(true)
    
    // Track file preview
    trackFilePreview({
      fileId: file.id,
      fileName: file.name,
      fileType: file.type,
      category: file.category
    })
  }

  const handleDownload = (file: DataroomFile) => {
    // Track file download
    trackFileDownload({
      fileId: file.id,
      fileName: file.name,
      fileType: file.type,
      category: file.category
    })
    
    // For now, we'll create a placeholder download
    const link = document.createElement('a')
    link.href = '#'
    link.download = file.name
    link.click()
    
    // Show success message
    alert(`Download started: ${file.name}`)
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case 'pptx':
      case 'ppt':
        return <Presentation className="h-5 w-5 text-orange-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-blue-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getAllFiles = (): DataroomFile[] => {
    if (!data) return []
    
    const categoryFiles = data.categories.flatMap(cat => cat.files)
    return [...data.rootFiles, ...categoryFiles]
  }

  const getFilteredFiles = (): DataroomFile[] => {
    const allFiles = getAllFiles()
    
    let filtered = allFiles
    
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'root') {
        filtered = data?.rootFiles || []
      } else {
        const category = data?.categories.find(cat => cat.id === selectedCategory)
        filtered = category?.files || []
      }
    }
    
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    return filtered
  }

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? 'Checking authentication...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dataroom...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <SidebarContent 
              data={data}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onLogout={handleLogout}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent 
          data={data}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">Nurederm Dataroom</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  console.log('Admin dashboard clicked')
                  window.location.href = '/admin'
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Search bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files, descriptions, or tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                // Track search with debounce
                if (e.target.value.length > 2) {
                  setTimeout(() => {
                    const filteredFiles = getFilteredFiles()
                    trackSearch({
                      query: e.target.value,
                      resultsCount: filteredFiles.length
                    })
                  }, 500)
                }
              }}
            />
          </div>
        </div>

        {/* File list */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredFiles().map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(file.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {file.name}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {file.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{file.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.lastModified).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(file.type === 'pdf' || file.type.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(file.type.toLowerCase())) && (
                            <button 
                              onClick={() => handlePreview(file)}
                              className="text-blue-600 hover:text-blue-900 flex items-center transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </button>
                          )}
                          <button 
                            onClick={() => handleDownload(file)}
                            className="text-green-600 hover:text-green-900 flex items-center transition-colors"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {getFilteredFiles().length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={previewFile}
      />
    </div>
  )
}

function SidebarContent({ 
  data, 
  selectedCategory, 
  setSelectedCategory, 
  onLogout, 
  onClose 
}: {
  data: DataroomData
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  onLogout: () => void
  onClose?: () => void
}) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <button
          onClick={() => {
            setSelectedCategory('all')
            onClose?.()
          }}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Files
        </button>
        
        <button
          onClick={() => {
            setSelectedCategory('root')
            onClose?.()
          }}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedCategory === 'root'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Root Documents ({data.rootFiles.length})
        </button>

        <div className="pt-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Categories
          </h3>
          <div className="mt-2 space-y-1">
            {data.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id)
                  onClose?.()
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="truncate">{category.title}</div>
                <div className="text-xs text-gray-500 truncate">
                  {category.files.length} files
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  )
}

