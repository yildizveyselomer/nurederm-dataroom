'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  Edit3, 
  Trash2, 
  File, 
  Image, 
  FileText, 
  FileSpreadsheet, 
  Presentation,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  XCircle
} from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: string
  size: string
  lastModified: string
  description: string
  tags: string[]
  url: string
}

interface FileManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onFileUpdated: () => void
}

export default function FileManagementModal({ 
  isOpen, 
  onClose, 
  onFileUpdated 
}: FileManagementModalProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    tags: ''
  })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadFiles()
    }
  }, [isOpen])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/files')
      const result = await response.json()
      
      if (result.success) {
        // Flatten all files from categories and root
        const allFiles: FileItem[] = [
          ...result.data.rootFiles,
          ...result.data.categories.flatMap((cat: any) => cat.files)
        ]
        setFiles(allFiles)
      }
    } catch (error) {
      console.error('Failed to load files:', error)
      showMessage('error', 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />
      case 'powerpoint':
        return <Presentation className="w-5 h-5 text-orange-500" />
      default:
        return <File className="w-5 h-5 text-gray-500" />
    }
  }

  const handleEdit = (file: FileItem) => {
    setEditingFile(file.id)
    setEditForm({
      name: file.name,
      description: file.description,
      tags: file.tags.join(', ')
    })
  }

  const handleSaveEdit = async (fileId: string) => {
    setActionLoading(fileId)
    try {
      const response = await fetch('/api/files', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileId,
          name: editForm.name,
          description: editForm.description,
          tags: editForm.tags
        })
      })

      const result = await response.json()
      
      if (result.success) {
        showMessage('success', 'File updated successfully')
        setEditingFile(null)
        loadFiles()
        onFileUpdated()
      } else {
        showMessage('error', result.error || 'Failed to update file')
      }
    } catch (error) {
      showMessage('error', 'Network error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingFile(null)
    setEditForm({ name: '', description: '', tags: '' })
  }

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return
    }

    setActionLoading(fileId)
    try {
      const response = await fetch(`/api/files?id=${fileId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        showMessage('success', 'File deleted successfully')
        loadFiles()
        onFileUpdated()
      } else {
        showMessage('error', result.error || 'Failed to delete file')
      }
    } catch (error) {
      showMessage('error', 'Network error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">File Management</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-600' 
              : 'bg-red-50 text-red-600'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No files found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        {editingFile === file.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="File name"
                            />
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Description"
                              rows={2}
                            />
                            <input
                              type="text"
                              value={editForm.tags}
                              onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Tags (comma separated)"
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleSaveEdit(file.id)}
                                disabled={actionLoading === file.id}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                              >
                                {actionLoading === file.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                                <span>Save</span>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex items-center space-x-1 px-3 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{file.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                              <span>{file.size}</span>
                              <span>Modified: {file.lastModified}</span>
                              {file.tags.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <span>Tags:</span>
                                  <div className="flex space-x-1">
                                    {file.tags.map((tag, index) => (
                                      <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {editingFile !== file.id && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(file)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit file"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id, file.name)}
                          disabled={actionLoading === file.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="Delete file"
                        >
                          {actionLoading === file.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {files.length} file{files.length !== 1 ? 's' : ''} total
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

