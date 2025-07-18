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

import type { DataroomFile } from '@/types/dataroom'

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
  const [files, setFiles] = useState<DataroomFile[]>([])
  const [loading, setLoading] = useState(false)
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    tags: ''
  })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (isOpen) loadFiles()
  }, [isOpen])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/files')
      const result = await response.json()
      if (result.success) {
        const allFiles: DataroomFile[] = [
          ...result.data.rootFiles,
          ...result.data.categories.flatMap((cat: any) => cat.files)
        ]
        setFiles(allFiles)
      }
    } catch (err) {
      console.error(err)
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

  const handleEdit = (file: DataroomFile) => {
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
      const res = await fetch('/api/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          name: editForm.name,
          description: editForm.description,
          tags: editForm.tags
        })
      })
      const result = await res.json()
      if (result.success) {
        showMessage('success', 'File updated')
        setEditingFile(null)
        onFileUpdated()
        loadFiles()
      } else {
        showMessage('error', result.error || 'Update failed')
      }
    } catch (err) {
      console.error(err)
      showMessage('error', 'Update failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this file?')) return
    setActionLoading(fileId)
    try {
      const res = await fetch(`/api/files?id=${fileId}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        showMessage('success', 'File deleted')
        onFileUpdated()
        loadFiles()
      } else {
        showMessage('error', result.error || 'Delete failed')
      }
    } catch (err) {
      console.error(err)
      showMessage('error', 'Delete failed')
    } finally {
      setActionLoading(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Manage Files</h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading files…</span>
            </div>
          ) : files.length === 0 ? (
            <p className="text-center text-gray-500">No files found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2"></th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Size</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{getFileIcon(file.type)}</td>
                    <td className="p-2">{file.name}</td>
                    <td className="p-2">{file.size}</td>
                    <td className="p-2">{file.category}</td>
                    <td className="p-2 space-x-2">
                      {editingFile === file.id ? (
                        <button
                          onClick={() => handleSaveEdit(file.id)}
                          disabled={!!actionLoading}
                          className="rounded-md bg-green-600 px-3 py-1 text-white disabled:opacity-70"
                        >
                          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(file)}
                          className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(file.id)}
                        disabled={!!actionLoading}
                        className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-70"
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {message && (
          <div
            className={`flex items-center space-x-2 p-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  )
}
