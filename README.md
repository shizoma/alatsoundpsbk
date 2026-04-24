# Alat Sound System PSBK

Aplikasi manajemen alat sound system **Padepokan Seni Bagong Kusudiardja (PSBK)** — untuk mencatat keluar masuk alat, inventaris, dan riwayat peminjaman.

## Fitur

- **Dashboard** — ringkasan kondisi alat, transaksi hari ini, dan peringatan terlambat
- **Inventaris** — daftar semua alat, tambah/edit/hapus, filter per kategori
- **Alat Keluar** — form pencatatan peminjaman alat keluar
- **Alat Kembali** — konfirmasi pengembalian alat dari daftar aktif
- **Riwayat** — log semua transaksi dengan filter status & bulan

Data disimpan di **localStorage** browser (tidak memerlukan server/database).

## Teknologi

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- Lucide React (icons)

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173).

## Build Produksi

```bash
npm run build
npm run preview
```
