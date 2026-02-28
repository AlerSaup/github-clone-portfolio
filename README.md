# 🖥️ Portfolio

Kişisel proje portföy sitesi. Projelerinizi görseller, dosya yapısı ve indirme linki ile sergileyin.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)

## ✨ Özellikler

- **Proje Vitrini** — Projelerinizi kart görünümünde listeleyin
- **Detay Sayfası** — GitHub benzeri tab bar ile görseller ve dosya yapısı
- **Dosya Gezgini** — Proje dosyalarını ağaç yapısında görüntüleyin
- **Dosya Önizleme** — Dosyalara tıklayarak satır numaralı içerik görüntüleme
- **Proje İndirme** — Yüklenen dosyalardan otomatik ZIP oluşturma
- **Admin Paneli** — JWT tabanlı kimlik doğrulama ile proje CRUD işlemleri
- **Görsel Yükleme** — Sürükle-bırak ile çoklu görsel yükleme
- **Klasör Yükleme** — Proje klasörünü seçerek dosya yapısını otomatik oluşturma
- **Akıllı Filtreleme** — `node_modules`, `.git`, `dist` gibi klasörler otomatik filtrelenir
- **Responsive Tasarım** — GitHub dark theme ile mobil uyumlu arayüz

## 📸 Ekran Görüntüleri

> Ekran görüntülerini `screenshots/` klasörüne ekleyip burayı güncelleyebilirsiniz.

## 🛠️ Teknolojiler

| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| [Next.js](https://nextjs.org/) | 16.1.6 | React framework (App Router, Turbopack) |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Tip güvenli JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS framework |
| [Prisma](https://www.prisma.io/) | 7.4 | ORM (PostgreSQL adapter) |
| [PostgreSQL](https://www.postgresql.org/) | — | İlişkisel veritabanı |
| [jose](https://github.com/panva/jose) | 6.x | JWT kimlik doğrulama |
| [archiver](https://github.com/archiverjs/node-archiver) | 7.x | ZIP oluşturma |

## 📁 Proje Yapısı

```
portfolio/
├── prisma/
│   ├── schema.prisma          # Veritabanı şeması
│   ├── seed.ts                # Seed verileri
│   └── migrations/            # Migrasyon dosyaları
├── public/
│   └── uploads/               # Yüklenen dosyalar (git-ignored)
│       ├── images/            # Proje görselleri
│       └── projects/          # Proje dosyaları ve ZIP'ler
├── src/
│   ├── app/
│   │   ├── page.tsx           # Ana sayfa
│   │   ├── projects/          # Proje listesi ve detay sayfaları
│   │   ├── admin/             # Admin paneli sayfaları
│   │   └── api/
│   │       ├── auth/          # Login, logout, session
│   │       ├── projects/      # Proje CRUD + dosya içeriği
│   │       ├── upload/        # Görsel ve dosya yükleme
│   │       └── uploads/       # Yüklenen dosya servis
│   ├── components/
│   │   ├── ProjectDetail.tsx  # Proje detay sayfası
│   │   ├── FileExplorer.tsx   # Dosya ağacı gezgini
│   │   ├── FileViewer.tsx     # Dosya içeriği görüntüleyici
│   │   ├── ImageGallery.tsx   # Görsel galerisi
│   │   ├── ProjectForm.tsx    # Proje ekleme/düzenleme formu
│   │   ├── ProjectSidebar.tsx # Yan bilgi paneli
│   │   └── Navbar.tsx         # Navigasyon çubuğu
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   └── auth.ts            # JWT yardımcıları
│   └── types/
│       └── project.ts         # TypeScript tip tanımları
├── .env                       # Ortam değişkenleri
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Kurulum

### Gereksinimler

- **Node.js** 18+
- **PostgreSQL** çalışır durumda
- **npm** veya **pnpm**

### 1. Repoyu klonlayın

```bash
git clone https://github.com/KULLANICI_ADINIZ/portfolio.git
cd portfolio
```

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

### 3. Ortam değişkenlerini ayarlayın

`.env` dosyası oluşturun:

```env
DATABASE_URL="postgresql://postgres:SIFRE@localhost:5432/portfolio?schema=public"
JWT_SECRET="guclu-bir-secret-key-degistirin"
```

### 4. Veritabanını hazırlayın

```bash
# Migrasyonları çalıştır
npx prisma migrate dev

# Prisma client oluştur
npx prisma generate

# (Opsiyonel) Seed verileri ekle
npx prisma db seed
```

### 5. Geliştirme sunucusunu başlatın

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### 6. Production build

```bash
npm run build
npm start
```

## 🔑 Admin Paneli

Admin paneline `/admin/login` adresinden erişebilirsiniz.

**Varsayılan giriş bilgileri** (seed sonrası):

| Alan | Değer |
|------|-------|
| E-posta | `admin@portfolio.com` |
| Şifre | `admin123` |

> ⚠️ Production ortamında şifreyi ve `JWT_SECRET` değerini mutlaka değiştirin.

### Admin İşlemleri

- **Proje Ekleme** — Görsel yükleme, klasör seçerek dosya yapısı oluşturma
- **Proje Düzenleme** — Tüm bilgileri güncelleme
- **Proje Silme** — Projeler ve ilişkili veriler temizlenir

## 📊 Veritabanı Şeması

```
Admin          ─ Yönetici hesapları
Project        ─ Projeler (ana tablo)
├── Owner      ─ Proje sahibi bilgileri
├── Language   ─ Kullanılan diller ve yüzdeleri
├── Tag        ─ Etiketler
├── Image      ─ Proje görselleri
└── File       ─ Dosya ağacı (self-referencing)
```

## 🌐 API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/projects` | Tüm projeleri listele |
| `POST` | `/api/projects` | Yeni proje oluştur 🔒 |
| `GET` | `/api/projects/:id` | Tek proje getir |
| `PUT` | `/api/projects/:id` | Proje güncelle 🔒 |
| `DELETE` | `/api/projects/:id` | Proje sil 🔒 |
| `GET` | `/api/projects/:id/file-content` | Dosya içeriği oku |
| `POST` | `/api/upload` | Görsel yükle 🔒 |
| `POST` | `/api/upload/project-files` | Proje dosyaları yükle 🔒 |
| `POST` | `/api/auth/login` | Admin giriş |
| `POST` | `/api/auth/logout` | Çıkış |
| `GET` | `/api/auth/me` | Oturum kontrolü |

> 🔒 = Admin kimlik doğrulaması gerekli

## 📝 Lisans

MIT

---

<p align="center">
  <sub>Next.js + Prisma + PostgreSQL ile geliştirildi</sub>
</p>
