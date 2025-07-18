import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// GET - List all files
export async function GET() {
  try {
    const inventoryPath = path.join(process.cwd(), 'public', 'inventory.json')
    const inventoryData = JSON.parse(await readFile(inventoryPath, 'utf8'))
    
    return NextResponse.json({ 
      success: true, 
      data: inventoryData.dataroom 
    })
  } catch (error) {
    console.error('Error reading files:', error)
    return NextResponse.json(
      { error: 'Failed to read files' }, 
      { status: 500 }
    )
  }
}

// DELETE - Delete a file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    const inventoryPath = path.join(process.cwd(), 'public', 'inventory.json')
    const inventoryData = JSON.parse(await readFile(inventoryPath, 'utf8'))

    let fileFound = false
    let fileUrl = ''

    // Search in root files
    const rootFileIndex = inventoryData.dataroom.rootFiles.findIndex(
      (file: any) => file.id === fileId
    )
    if (rootFileIndex !== -1) {
      fileUrl = inventoryData.dataroom.rootFiles[rootFileIndex].url
      inventoryData.dataroom.rootFiles.splice(rootFileIndex, 1)
      fileFound = true
    }

    // Search in category files
    if (!fileFound) {
      for (const category of inventoryData.dataroom.categories) {
        const fileIndex = category.files.findIndex((file: any) => file.id === fileId)
        if (fileIndex !== -1) {
          fileUrl = category.files[fileIndex].url
          category.files.splice(fileIndex, 1)
          fileFound = true
          break
        }
      }
    }

    if (!fileFound) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete physical file if it exists
    if (fileUrl && fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', fileUrl)
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    }

    // Save updated inventory
    await writeFile(inventoryPath, JSON.stringify(inventoryData, null, 2))

    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully' 
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' }, 
      { status: 500 }
    )
  }
}

// PUT - Update file metadata
export async function PUT(request: NextRequest) {
  try {
    const { fileId, name, description, tags, category } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    const inventoryPath = path.join(process.cwd(), 'public', 'inventory.json')
    const inventoryData = JSON.parse(await readFile(inventoryPath, 'utf8'))

    let fileFound = false
    let fileToUpdate: any = null

    // Search in root files
    const rootFileIndex = inventoryData.dataroom.rootFiles.findIndex(
      (file: any) => file.id === fileId
    )
    if (rootFileIndex !== -1) {
      fileToUpdate = inventoryData.dataroom.rootFiles[rootFileIndex]
      fileFound = true
    }

    // Search in category files
    if (!fileFound) {
      for (const cat of inventoryData.dataroom.categories) {
        const fileIndex = cat.files.findIndex((file: any) => file.id === fileId)
        if (fileIndex !== -1) {
          fileToUpdate = cat.files[fileIndex]
          fileFound = true
          break
        }
      }
    }

    if (!fileFound) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Update file metadata
    if (name) fileToUpdate.name = name
    if (description) fileToUpdate.description = description
    if (tags) fileToUpdate.tags = Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim())

    // Save updated inventory
    await writeFile(inventoryPath, JSON.stringify(inventoryData, null, 2))

    return NextResponse.json({ 
      success: true, 
      file: fileToUpdate,
      message: 'File updated successfully' 
    })

  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update file' }, 
      { status: 500 }
    )
  }
}

