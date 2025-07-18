import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const tags = formData.get('tags') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = path.join(uploadsDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Update inventory.json
    const inventoryPath = path.join(process.cwd(), 'public', 'inventory.json')
    const inventoryData = JSON.parse(await readFile(inventoryPath, 'utf8'))

    // Create new file entry
    const newFile = {
      id: `file_${timestamp}`,
      name: file.name,
      type: getFileType(fileExtension),
      size: formatFileSize(file.size),
      lastModified: new Date().toLocaleDateString(),
      description: description || 'Uploaded file',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      url: `/uploads/${fileName}`
    }

    // Add to appropriate category or root
    if (category && category !== 'root') {
      const categoryIndex = inventoryData.dataroom.categories.findIndex(
        (cat: any) => cat.id === category
      )
      if (categoryIndex !== -1) {
        inventoryData.dataroom.categories[categoryIndex].files.push(newFile)
      } else {
        inventoryData.dataroom.rootFiles.push(newFile)
      }
    } else {
      inventoryData.dataroom.rootFiles.push(newFile)
    }

    // Save updated inventory
    await writeFile(inventoryPath, JSON.stringify(inventoryData, null, 2))

    return NextResponse.json({ 
      success: true, 
      file: newFile,
      message: 'File uploaded successfully' 
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' }, 
      { status: 500 }
    )
  }
}

function getFileType(extension: string): string {
  const ext = extension.toLowerCase()
  if (['.pdf'].includes(ext)) return 'pdf'
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'image'
  if (['.xls', '.xlsx'].includes(ext)) return 'excel'
  if (['.doc', '.docx'].includes(ext)) return 'word'
  if (['.ppt', '.pptx'].includes(ext)) return 'powerpoint'
  return 'file'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

