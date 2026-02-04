# BAB IV: HASIL DAN PEMBAHASAN

## 4.1 Hasil Pengembangan Sistem (Evidence of Implementation)

Berdasarkan metodologi *Evolutionary Prototyping* yang diterapkan, sistem SIMA-ELBAN telah berhasil dibangun dan dideploy secara publik melalui Vercel. Berikut adalah uraian bukti nyata pengerjaan sistem:

### 4.1.1 Arsitektur dan Teknologi Sistem (Backend Evidence)
Implementasi sistem tidak hanya pada tampilan, tetapi juga pada struktur basis data di awan (*cloud*). Berikut adalah salah satu implementasi tabel utama dalam basis data SIMA-ELBAN:

![Gambar 4.1: Struktur Tabel Akun pada Database Supabase](./images/tabel_akun_db.png)
*Gambar 4.1: Struktur Tabel Akun pada Database Supabase*

> **INSTRUKSI SCREENSHOT TAMBAHAN:**
> Silakan tambahkan tangkapan layar untuk tabel lainnya (peralatan, log, tugas) dalam menu Table Editor Supabase untuk melengkapi bukti pengerjaan basis data.

### 4.1.2 Implementasi Antarmuka Utama (Frontend Evidence)
Aplikasi menggunakan desain *Glassmorphism* untuk meningkatkan pengalaman pengguna (UX).

1.  **Dashboard Utama**: Menampilkan indikator statistik peralatan bandara.
    > **INSTRUKSI SCREENSHOT:**
    > Ambil tangkapan layar halaman **Dashboard** setelah Anda login. Pastikan widget angka peralatan dan grafik terlihat jelas.
    >
    > **[Gambar 4.2: Antarmuka Dashboard Utama SIMA-ELBAN]**

2.  **Manajemen Peralatan & QR Code**:
    > **INSTRUKSI SCREENSHOT:**
    > Buka menu **Peralatan**, lalu pilih salah satu alat untuk melihat detailnya. Ambil tangkapan layar yang menampilkan profil alat dan **QR Code** yang digenerate otomatis oleh sistem.
    >
    > **[Gambar 4.3: Detail Peralatan dan Generator QR Code Otomatis]**

3.  **Log Performance (Riwayat Pemeliharaan)**:
    > **INSTRUKSI SCREENSHOT:**
    > Ambil tangkapan layar pada halaman **Log Peralatan**. Pastikan riwayat pengisian data teknisi terlihat dalam tabel yang rapi.
    >
    > **[Gambar 4.4: Rekam Jejak Pemeliharaan Peralatan secara Digital]**

4.  **Jadwal Matrix View (Duty Roster)**:
    > **INSTRUKSI SCREENSHOT:**
    > Buka menu **Jadwal**, lalu aktifkan tampilan **Matrix View**. Ambil tangkapan layar yang menunjukkan grid jadwal personel selama satu bulan.
    >
    > **[Gambar 4.5: Tampilan Matrix View Jadwal Dinas Personel ELBAN]**

5.  **Interactive ERD View**:
    > **INSTRUKSI SCREENSHOT:**
    > Ambil tangkapan layar halaman **ERD View** yang baru saja kita simpulkan. Pastikan relasi *Crow's Foot* antar tabel terlihat presisi dan tidak menimpa teks.
    >
    > **[Gambar 4.6: Visualisasi Entity Relationship Diagram (ERD) Sistem]**

## 4.2 Tahap Iterasi dan Perbaikan (Hasil Evaluasi)

Selama proses *prototyping*, dilakukan perbaikan berdasarkan evaluasi mandiri maupun pengguna. Berikut adalah bukti perbaikan teknis pada komponen sistem:

> **INSTRUKSI TAMBAHAN:**
> Jika Anda ingin menunjukkan "kerja keras" di sisi pemrograman, Anda bisa menyisipkan potongan kode (snippet) di sini. Misalnya kode komponen `ConnectionLine` yang menangani simbol kaki gagak.

**Bukti Kode 4.1: Implementasi Simbol Crow's Foot Terpusat**
```tsx
// Cuplikan kode pada app/erd-view/page.tsx
<div className="absolute w-5 h-[2px] bg-slate-400 rotate-[-30deg] origin-left" />
<div className="absolute w-5 h-[2px] bg-slate-400 rotate-[30deg] origin-left" />
```

## 4.3 Pengujian Sistem (Testing Evidence)

Pengujian dilakukan menggunakan metode *Black Box Testing*. Tabel berikut merangkum hasil pengujian nyata terhadap fungsionalitas aplikasi:

| Fitur Kritikal | Input/Aksi | Hasil Nyata pada Sistem | Status |
| :--- | :--- | :--- | :--- |
| **Login Security** | Percobaan login akun belum disetujui | Sistem menampilkan pesan "Tunggu Konfirmasi Admin" | BERHASIL |
| **QR Scan Logic** | Akses via URL unik QR Code | Langsung membuka data alat yang bersangkutan | BERHASIL |
| **Task Workflow** | Input tugas baru oleh Kanit | Muncul notifikasi di dashboard teknisi tujuan | BERHASIL |
| **Pengaduan Unit** | Kirim laporan dari unit luar | Data tersimpan dan masuk ke daftar antrean tugas | BERHASIL |

## 4.4 Pembahasan Hasil Pengerjaan

Transformasi digital melalui SIMA-ELBAN memberikan dampak nyata:
1.  **Aksesibilitas**: Data alat kini bisa diakses < 3 detik melalui HP di lapangan.
2.  **Integritas Laporan**: Menghilangkan risiko data hilang akibat kertas rusak/basah.
3.  **Objektivitas**: Pimpinan memiliki data riwayat kerja yang transparan untuk evaluasi periode audit.
