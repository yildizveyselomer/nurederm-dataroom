import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = (formData.get('category') as string) || 'root'
    const description = (formData.get('description') as string) || ''
    const tagsInput = (formData.get('tags') as string) || ''

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // ------------------------------------------------------------------
    // Persist physical file
    // ------------------------------------------------------------------
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Sanitize and generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${safeName}`
    const filePath = path.join(uploadsDir, fileName)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // ------------------------------------------------------------------
    // Update inventory.json (acts like a tiny DB in the demo)
    // ------------------------------------------------------------------
    const inventoryPath = path.join(process.cwd(), 'public', 'inventory.json')
    let inventoryData: any = { dataroom: { lastUpdated: '', rootFiles: [], categories: [] } }
    try {
      inventoryData = JSON.parse(await readFile(inventoryPath, 'utf8'))
    } catch { /* first upload */ }

    const getFileType = (ext: string) => {
      const e = ext.toLowerCase()
      if (['.pdf'].includes(e)) return 'pdf'
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(e)) return 'image'
      if (['.xls', '.xlsx'].includes(e)) return 'excel'
      if (['.doc', '.docx'].includes(e)) return 'word'
      if (['.ppt', '.pptx'].includes(e)) return 'powerpoint'
      return 'file'
    }

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const newFile = {
      id: `file_${timestamp}`,
      name: file.name,
      type: getFileType(fileExtension),
      size: formatFileSize(file.size),
      lastModified: new Date().toLocaleDateString(),
      description,
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()) : [],
      category,
      downloadUrl: `/uploads/${fileName}`,
      previewUrl: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension.toLowerCase())
        ? `/uploads/${fileName}`
        : undefined
    }

    // push into inventory
    if (category && category !== 'root') {
      const catIdx = inventoryData.dataroom.categories.findIndex((c: any) => c.id === category)
      if (catIdx !== -1) {
        inventoryData.dataroom.categories[catIdx].files.push(newFile)
      } else {
        // category not found, fallback to root
        inventoryData.dataroom.rootFiles.push(newFile)
      }
    } else {
      inventoryData.dataroom.rootFiles.push(newFile)
    }

    inventoryData.dataroom.lastUpdated = new Date().toISOString()
    await writeFile(inventoryPath, JSON.stringify(inventoryData, null, 2))

    return NextResponse.json({ success: true, file: newFile, message: 'File uploaded successfully' })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
