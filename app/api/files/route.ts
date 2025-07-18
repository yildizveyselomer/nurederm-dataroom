import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const INVENTORY_PATH = path.join(process.cwd(), 'public', 'inventory.json')

async function readInventory() {
  return JSON.parse(await readFile(INVENTORY_PATH, 'utf8'))
}

// GET - list all files/categories
export async function GET() {
  try {
    const data = await readInventory()
    return NextResponse.json({ success: true, data: data.dataroom })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to read files' }, { status: 500 })
  }
}

// DELETE - remove file by id
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.downloadUrl)
    const fileId = searchParams.get('id')
    if (!fileId) return NextResponse.json({ error: 'File ID required' }, { status: 400 })

    const inv = await readInventory()

    const removeFromList = (arr: any[]) => {
      const idx = arr.findIndex((f) => f.id === fileId)
      if (idx !== -1) {
        const [removed] = arr.splice(idx, 1)
        return removed
      }
      return null
    }

    // search root, then categories
    let removed = removeFromList(inv.dataroom.rootFiles)
    if (!removed) {
      for (const cat of inv.dataroom.categories) {
        removed = removeFromList(cat.files)
        if (removed) break
      }
    }
    if (!removed) return NextResponse.json({ error: 'File not found' }, { status: 404 })

    // delete physical file
    if (removed.downloadUrl?.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', removed.downloadUrl)
      if (existsSync(filePath)) await unlink(filePath)
    }

    inv.dataroom.lastUpdated = new Date().toISOString()
    await writeFile(INVENTORY_PATH, JSON.stringify(inv, null, 2))

    return NextResponse.json({ success: true, message: 'File deleted successfully' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}

// PUT - update metadata
export async function PUT(request: NextRequest) {
  try {
    const { fileId, name, description, tags } = await request.json()
    if (!fileId) return NextResponse.json({ error: 'File ID required' }, { status: 400 })

    const inv = await readInventory()

    const findFile = () => {
      let f: any = inv.dataroom.rootFiles.find((fl: any) => fl.id === fileId)
      if (f) return f
      for (const cat of inv.dataroom.categories) {
        const ff = cat.files.find((fl: any) => fl.id === fileId)
        if (ff) return ff
      }
      return null
    }

    const fileRef = findFile()
    if (!fileRef) return NextResponse.json({ error: 'File not found' }, { status: 404 })

    if (name) fileRef.name = name
    if (description) fileRef.description = description
    if (tags !== undefined) {
      fileRef.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())
    }

    inv.dataroom.lastUpdated = new Date().toISOString()
    await writeFile(INVENTORY_PATH, JSON.stringify(inv, null, 2))

    return NextResponse.json({ success: true, file: fileRef, message: 'File updated successfully' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update file' }, { status: 500 })
  }
}
