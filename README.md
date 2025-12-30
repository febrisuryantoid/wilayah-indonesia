# Wilayah Indonesia V.1.0

Aplikasi eksplorasi data administratif wilayah Indonesia yang lengkap, modern, dan responsif. Platform ini menyajikan data hierarkis mulai dari Provinsi, Kabupaten/Kota, Kecamatan, hingga Desa/Kelurahan dengan antarmuka yang ramah pengguna.

## 🌟 Fitur Utama

### 1. Eksplorasi Wilayah Hierarkis
- **Dropdown Cerdas:** Pencarian dan pemilihan wilayah bertingkat (Provinsi > Kabupaten > Kecamatan > Desa).
- **Searchable:** Kemampuan mencari nama wilayah dengan cepat di dalam dropdown.
- **Indikator Loading:** Visualisasi status saat memuat data dari API.

### 2. Integrasi Peta & Geolokasi
- **Google Maps Embed:** Menampilkan peta interaktif berdasarkan wilayah yang dipilih secara otomatis.
- **Navigasi Langsung:** Tombol pintas untuk membuka lokasi di Google Maps eksternal untuk rute dan detail lebih lanjut.
- **Informasi Kode Wilayah:** Menampilkan Kode Kemendagri (ID Wilayah) untuk setiap tingkatan.

### 3. Performa & Penyimpanan Lokal (Offline-First)
- **IndexedDB Caching:** Aplikasi menggunakan teknologi IndexedDB untuk menyimpan data yang pernah diakses secara lokal di browser pengguna.
- **Efisiensi Bandwidth:** Data hanya diunduh sekali dari server, akses selanjutnya diambil dari penyimpanan lokal (cache) sehingga sangat cepat dan hemat kuota.
- **Manajemen Database:** Panel kontrol untuk melihat statistik jumlah data yang tersimpan dan fitur untuk menghapus/reset database lokal.

### 4. Antarmuka Modern (UI/UX)
- **Glassmorphism Design:** Tampilan visual estetik dengan efek kaca (blur) dan gradasi warna yang halus.
- **Full Responsive:** Tata letak yang beradaptasi sempurna untuk Desktop, Tablet, dan Mobile (Standar Dunia).
- **Animasi Halus:** Transisi antar halaman dan elemen menggunakan animasi yang nyaman di mata.

### 5. Open API Documentation
- **API Explorer:** Menyediakan dokumentasi endpoint untuk pengembang yang ingin mengakses data raw JSON (Provinsi, Regency, District, Village).
- **Copy Code:** Fitur salin cepat contoh kode fetch untuk implementasi di aplikasi lain.

## 🚀 Cara Penggunaan

1. **Buka Aplikasi:** Akses halaman utama aplikasi melalui browser.
2. **Pilih Lokasi:**
   - Mulai dengan memilih **Provinsi** pada panel sebelah kiri (desktop) atau atas (mobile).
   - Setelah Provinsi terpilih, dropdown **Kabupaten/Kota** akan aktif.
   - Lanjutkan hingga tingkat **Desa/Kelurahan**.
3. **Lihat Detail:** Panel informasi akan menampilkan Peta, Kode Wilayah, dan Nama Lengkap lokasi.
4. **Mode API:** Klik tombol "API" di pojok kanan atas untuk melihat dokumentasi teknis data.
5. **Cek Database:** Klik tombol "DB Aktif/Kosong" di pojok kanan bawah untuk melihat status penyimpanan lokal.

## 🛠 Teknologi

Aplikasi ini dibangun menggunakan teknologi web modern:
- **React 19:** Library UI utama.
- **Tailwind CSS:** Framework styling utility-first.
- **Lucide React:** Koleksi ikon vektor yang ringan.
- **IndexedDB:** Penyimpanan database sisi klien (Client-side storage).
- **ES Modules (ESM):** Penggunaan modul modern tanpa bundler kompleks (via importmap).

## 👨‍💻 Informasi Pengembang

Aplikasi ini dikembangkan dan diriset datanya oleh **Febri Suryanto**.

Untuk informasi lebih lanjut, riset data lengkap, dan portofolio pengembangan, silakan kunjungi tautan berikut:

<a href="https://febrisuryanto.com" rel="sponsored dofollow">https://febrisuryanto.com</a>

---
*© Wilayah Indonesia - Data untuk Semua.*
