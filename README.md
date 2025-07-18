# 🔐 Nurederm Advanced Dataroom

Gelişmiş tracking sistemi, kişiye özel hesaplar ve admin dashboard ile donatılmış profesyonel dataroom uygulaması.

## ✨ Özellikler

### 🔒 Güvenlik
- **Kişiye Özel Hesaplar**: Her kullanıcı için benzersiz kullanıcı adı/şifre
- **Rol Bazlı Yetkilendirme**: Admin ve Investor rolleri
- **30 Dakika Oturum Zaman Aşımı**: Otomatik güvenlik çıkışı
- **Robots.txt Koruması**: Arama motorlarından gizleme

### 📊 Gelişmiş Analytics
- **Gerçek Zamanlı Tracking**: Her tıklama, indirme ve arama kaydedilir
- **Kullanıcı Aktivite Logları**: Kim ne zaman ne yaptı
- **Dosya İstatistikleri**: En popüler dosyalar ve indirme sayıları
- **Oturum Takibi**: Giriş/çıkış zamanları ve süreleri

### 👨‍💼 Admin Dashboard
- **Canlı İstatistikler**: Kullanıcı sayısı, indirmeler, önizlemeler
- **Kullanıcı Aktiviteleri**: Detaylı kullanıcı bazlı raporlar
- **Dosya Popülerlik Analizi**: En çok indirilen/görüntülenen dosyalar
- **Rapor Export**: CSV ve JSON formatında rapor çıktısı
- **Zaman Filtresi**: Son 24 saat, 7 gün, 30 gün, tüm zamanlar

### 🎨 Kullanıcı Deneyimi
- **Responsive Tasarım**: Mobil ve desktop uyumlu
- **Canlı Arama**: Dosya adı, açıklama ve etiketlerde arama
- **Dosya Önizleme**: PDF ve resim dosyaları için önizleme
- **Dosya İndirme**: Tüm dosya türleri için indirme desteği
- **Modern UI**: Tailwind CSS ile profesyonel tasarım

## 🚀 Hızlı Başlangıç

### Demo Hesapları

| Rol | Kullanıcı Adı | Şifre |
|-----|---------------|-------|
| **Admin** | `admin` | `NDR-ADMIN-2025` |
| **Investor 1** | `investor1` | `INV-001-2025` |
| **Investor 2** | `investor2` | `INV-002-2025` |

### Yerel Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# http://localhost:3000 adresinde çalışır
```

### Production Build

```bash
# Static build al
npm run build

# out/ klasöründe static dosyalar oluşur
```

## 🌐 Deployment

### 1. Vercel (Önerilen)
```bash
1. vercel.com'a giriş yapın
2. "New Project" → GitHub repo'yu import edin
3. Deploy butonuna tıklayın
```

### 2. Netlify
```bash
1. netlify.com'a giriş yapın
2. "Deploy manually" → out/ klasörünü sürükleyin
3. Site yayında!
```

### 3. Manuel Hosting
```bash
1. out/ klasörünün içeriğini web sunucunuza yükleyin
2. Static hosting destekleyen herhangi bir servis kullanabilirsiniz
```

## ⚙️ Konfigürasyon

### Kullanıcı Yönetimi
Kullanıcıları `public/users.json` dosyasından yönetebilirsiniz:

```json
{
  "users": [
    {
      "id": "admin",
      "username": "admin",
      "password": "NDR-ADMIN-2025",
      "name": "System Administrator",
      "role": "admin"
    }
  ]
}
```

### Dosya İçeriği
Dataroom içeriğini `public/inventory.json` dosyasından güncelleyebilirsiniz.

### Oturum Ayarları
`src/hooks/useAuth.ts` dosyasında:
- `SESSION_TIMEOUT`: Oturum zaman aşımı süresi (ms)

## 📈 Analytics Özellikleri

### Takip Edilen Aktiviteler
- ✅ Dosya indirmeleri
- ✅ Dosya önizlemeleri  
- ✅ Arama sorguları
- ✅ Sayfa görüntülemeleri
- ✅ Oturum başlangıç/bitiş
- ✅ Kullanıcı etkileşimleri

### Admin Dashboard Metrikleri
- **Toplam Kullanıcı Sayısı**
- **Aktif Kullanıcı Sayısı** (son 24 saat)
- **Toplam İndirme Sayısı**
- **Toplam Önizleme Sayısı**
- **Toplam Arama Sayısı**

### Rapor Formatları
- **CSV Export**: Excel'de açılabilir kullanıcı aktivite raporu
- **JSON Export**: Programatik erişim için detaylı veri

## 🔧 Teknik Detaylar

### Teknoloji Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **TypeScript**: Tam tip güvenliği
- **Authentication**: Client-side JWT benzeri sistem
- **Analytics**: LocalStorage tabanlı (production'da backend entegrasyonu önerilir)

### Dosya Yapısı
```
src/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── login/          # Giriş sayfası
│   └── page.tsx        # Ana dataroom sayfası
├── components/
│   └── FilePreviewModal.tsx
├── hooks/
│   ├── useAuth.ts      # Authentication logic
│   └── useAnalytics.ts # Analytics tracking
└── public/
    ├── users.json      # Kullanıcı veritabanı
    ├── analytics.json  # Analytics veritabanı
    └── inventory.json  # Dosya envanteri
```

### Güvenlik Notları
- Şifreler plain text olarak saklanır (demo amaçlı)
- Production'da hash'lenmiş şifreler kullanın
- HTTPS kullanımı zorunludur
- Analytics verileri localStorage'da saklanır

## 🎯 Production Önerileri

### Backend Entegrasyonu
- Kullanıcı authentication için JWT
- Analytics verileri için veritabanı (PostgreSQL/MongoDB)
- Dosya depolama için S3/CloudFlare R2
- API rate limiting

### Güvenlik Geliştirmeleri
- Şifre hash'leme (bcrypt)
- 2FA desteği
- IP bazlı erişim kontrolü
- Audit log sistemi

### Performance Optimizasyonu
- CDN kullanımı
- Image optimization
- Lazy loading
- Caching stratejileri

## 📞 Destek

Herhangi bir sorun veya özellik talebi için lütfen iletişime geçin.

---

**© 2025 Nurederm Dataroom - Gelişmiş Analytics ve Güvenlik ile**

