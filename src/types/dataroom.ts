/**
 * Canonical dataroom file schema.
 * Add or remove fields only from this interface, then import everywhere.
 */
export interface DataroomFile {
  id: string
  name: string
  type: 'pdf' | 'image' | 'excel' | 'word' | 'powerpoint' | 'file'
  size: string
  lastModified: string
  description: string
  tags: string[]
  category: string
  /**
   * Absolute or root‑relative path that will trigger a file download.
   * Required for all items.
   */
  downloadUrl: string
  /**
   * Optional URL for inline preview (e.g. images, pdfs).
   */
  previewUrl?: string
}
