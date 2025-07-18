'use client'

import { useState, useEffect } from 'react'
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  file: {
    id: string
    name: string
    type: string
    size: string
    downloadUrl: string
  } | null
}

export default function FilePreviewModal({ isOpen, onClose, file }: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setZoom(100)
      setRotation(0)
    }
  }, [isOpen, file])

  if (!isOpen || !file) return null

  const handleDownload = () => {
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = file.downloadUrl
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderPreview = () => {
    if (file.type === 'pdf') {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
            <p className="text-gray-500 mb-4">PDF preview not available</p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download to View
            </button>
          </div>
        </div>
      )
    }

    if (file.type.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(file.type.toLowerCase())) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div 
            className="max-w-full max-h-full"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <img
              src={file.downloadUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.parentElement!.innerHTML = `
                  <div class="text-center p-8">
                    <div class="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg class="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">${file.name}</h3>
                    <p class="text-gray-500 mb-4">Image preview not available</p>
                    <button onclick="handleDownload()" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Download to View
                    </button>
                  </div>
                `
              }}
            />
          </div>
        </div>
      )
    }

    // For other file types
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
          <p className="text-gray-500 mb-4">Preview not available for this file type</p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download File
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 truncate">{file.name}</h3>
              <p className="text-sm text-gray-500">{file.size}</p>
            </div>
            <div className="flex items-center space-x-2">
              {(file.type.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(file.type.toLowerCase())) && (
                <>
                  <button
                    onClick={() => setZoom(Math.max(25, zoom - 25))}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    disabled={zoom <= 25}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-500 min-w-[3rem] text-center">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRotation((rotation + 90) % 360)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={handleDownload}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white" style={{ height: '70vh' }}>
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  )
}

