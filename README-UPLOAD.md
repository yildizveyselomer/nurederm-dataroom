# 📁 Admin Dosya Upload ve Yönetim Sistemi

Nurederm Dataroom'a eklenen gelişmiş dosya upload ve yönetim sistemi.

## ✨ Yeni Özellikler

### 🔧 **Admin Dosya Upload**
- **Drag & Drop Interface**: Dosyaları sürükleyip bırakarak yükleme
- **Çoklu Format Desteği**: PDF, Images, Excel, Word, PowerPoint
- **Kategori Seçimi**: Dosyaları kategorilere göre organize etme
- **Metadata Ekleme**: Açıklama ve etiket ekleme
- **Gerçek Zamanlı Upload**: Progress gösterimi ve hata yönetimi

### 📋 **Dosya Yönetimi**
- **Tüm Dosyaları Görüntüleme**: Kategoriler ve root dosyalar
- **Inline Düzenleme**: Dosya adı, açıklama ve etiket düzenleme
- **Dosya Silme**: Güvenli silme onayı ile
- **Dosya Filtreleme**: Tip ve kategoriye göre filtreleme
- **Bulk Operations**: Çoklu dosya işlemleri

### 🎯 **Admin Dashboard Entegrasyonu**
- **Upload File Butonu**: Ana dashboard'da kolay erişim
- **Manage Files Butonu**: Dosya yönetim paneli
- **Analytics Entegrasyonu**: Upload aktiviteleri tracking
- **Real-time Updates**: Upload sonrası otomatik güncelleme

## 🛠️ Teknik Detaylar

### API Endpoints

#### 1. Dosya Upload - `/api/upload`
```typescript
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File (required)
- category: string (optional)
- description: string (optional)
- tags: string (comma separated, optional)

Response:
{
  "success": true,
  "file": {
    "id": "file_1234567890",
    "name": "document.pdf",
    "type": "pdf",
    "size": "1.2 MB",
    "lastModified": "7/18/2025",
    "description": "Important document",
    "tags": ["financial", "quarterly"],
    "url": "/uploads/1234567890_document.pdf"
  },
  "message": "File uploaded successfully"
}
```

#### 2. Dosya Yönetimi - `/api/files`
```typescript
// Tüm dosyaları listele
GET /api/files
Response: { success: true, data: { rootFiles: [], categories: [] } }

// Dosya güncelle
PUT /api/files
Body: { fileId, name, description, tags }

// Dosya sil
DELETE /api/files?id=fileId
```

### Dosya Depolama
- **Upload Dizini**: `public/uploads/`
- **Dosya Adlandırma**: `timestamp_originalname.ext`
- **Güvenlik**: Dosya tipi validasyonu
- **Boyut Limiti**: Tarayıcı limitleri dahilinde

### Frontend Bileşenleri

#### 1. FileUploadModal
```typescript
interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadSuccess: () => void
  categories: Array<{ id: string; name: string }>
}
```

**Özellikler:**
- Drag & drop zone
- Dosya tipi validasyonu
- Upload progress
- Kategori seçimi
- Metadata form
- Error handling

#### 2. FileManagementModal
```typescript
interface FileManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onFileUpdated: () => void
}
```

**Özellikler:**
- Tüm dosyaları listeleme
- Inline editing
- Dosya silme
- Bulk operations
- Search & filter

## 🎯 Kullanım Kılavuzu

### Admin Olarak Dosya Yükleme

1. **Admin Dashboard'a Giriş**
   - `admin` / `NDR-ADMIN-2025` ile giriş yapın
   - "Admin Dashboard" butonuna tıklayın

2. **Dosya Upload**
   - "Upload File" butonuna tıklayın
   - Dosyayı drag & drop yapın veya "browse" ile seçin
   - Kategori seçin (opsiyonel)
   - Açıklama ve etiket ekleyin
   - "Upload File" butonuna tıklayın

3. **Dosya Yönetimi**
   - "Manage Files" butonuna tıklayın
   - Dosyaları görüntüleyin ve düzenleyin
   - Edit butonuyla metadata güncelleyin
   - Delete butonuyla dosya silin

### Desteklenen Dosya Tipleri

| Tip | Uzantılar | İkon |
|-----|-----------|------|
| **PDF** | .pdf | 📄 |
| **Images** | .jpg, .jpeg, .png, .gif, .webp | 🖼️ |
| **Excel** | .xls, .xlsx | 📊 |
| **Word** | .doc, .docx | 📝 |
| **PowerPoint** | .ppt, .pptx | 📊 |

## 🔒 Güvenlik Özellikleri

### Upload Güvenliği
- **Dosya Tipi Kontrolü**: Sadece izin verilen uzantılar
- **Dosya Adı Sanitization**: Güvenli dosya adları
- **Unique Naming**: Timestamp ile çakışma önleme
- **Directory Traversal Protection**: Güvenli path handling

### Erişim Kontrolü
- **Admin Only**: Sadece admin rolü upload yapabilir
- **Authentication Check**: Her API çağrısında doğrulama
- **Session Management**: Güvenli oturum yönetimi

## 📊 Analytics Entegrasyonu

### Tracked Events
```typescript
// Upload aktiviteleri
trackEvent('file_upload', {
  fileName: string,
  fileType: string,
  fileSize: number,
  category: string
})

// Dosya yönetimi aktiviteleri
trackEvent('file_edit', { fileId: string })
trackEvent('file_delete', { fileId: string })
```

### Dashboard Metrikleri
- **Total Uploads**: Toplam yüklenen dosya sayısı
- **Upload Activity**: Zaman bazlı upload grafiği
- **File Type Distribution**: Dosya tipi dağılımı
- **Storage Usage**: Kullanılan depolama alanı

## 🚀 Deployment Notları

### Production Hazırlık
1. **Environment Variables**
   ```bash
   UPLOAD_MAX_SIZE=10MB
   UPLOAD_DIR=/var/uploads
   ```

2. **File Permissions**
   ```bash
   chmod 755 public/uploads
   chown www-data:www-data public/uploads
   ```

3. **Nginx Configuration**
   ```nginx
   client_max_body_size 10M;
   ```

### Backup Stratejisi
- **Dosya Backup**: `public/uploads/` dizini
- **Metadata Backup**: `public/inventory.json`
- **Automated Backup**: Günlük backup scripti önerilir

## 🔧 Troubleshooting

### Yaygın Sorunlar

1. **Upload Başarısız**
   - Dosya boyutu kontrolü
   - Dosya tipi kontrolü
   - Disk alanı kontrolü

2. **API Hataları**
   - Network connectivity
   - Server permissions
   - File system access

3. **UI Sorunları**
   - Browser compatibility
   - JavaScript errors
   - CSS conflicts

### Debug Modu
```typescript
// Console'da upload detayları
localStorage.setItem('debug_uploads', 'true')
```

## 📈 Gelecek Geliştirmeler

### Planlanan Özellikler
- [ ] **Bulk Upload**: Çoklu dosya upload
- [ ] **File Versioning**: Dosya versiyonlama
- [ ] **Advanced Search**: Gelişmiş arama filtreleri
- [ ] **File Preview**: Daha fazla dosya tipi önizleme
- [ ] **Cloud Storage**: S3/CloudFlare R2 entegrasyonu
- [ ] **File Compression**: Otomatik dosya sıkıştırma
- [ ] **Access Logs**: Detaylı erişim logları

### Performance İyileştirmeleri
- [ ] **Chunked Upload**: Büyük dosyalar için parçalı upload
- [ ] **Progress Tracking**: Detaylı progress gösterimi
- [ ] **Background Processing**: Arka plan dosya işleme
- [ ] **CDN Integration**: Hızlı dosya erişimi

---

**🎯 Admin dosya upload ve yönetim sistemi başarıyla entegre edildi!**

