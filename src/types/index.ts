export const KATEGORI_ALAT = [
  'Mixer',
  'Amplifier',
  'Speaker',
  'Microphone',
  'Kabel',
  'Efek',
  'Lainnya',
] as const

export type KategoriAlat = (typeof KATEGORI_ALAT)[number]

export const STATUS_ALAT = ['Tersedia', 'Dipinjam', 'Rusak', 'Maintenance'] as const

export type StatusAlat = (typeof STATUS_ALAT)[number]

export const KONDISI_ALAT = ['Baik', 'Perlu Perbaikan', 'Rusak Ringan', 'Rusak Berat'] as const

export type KondisiAlat = (typeof KONDISI_ALAT)[number]

export interface Alat {
  id: string
  nama: string
  kode: string
  kategori: KategoriAlat
  merek: string
  jumlah: number
  jumlahTersedia: number
  status: StatusAlat
  kondisi: KondisiAlat
  keterangan?: string
  createdAt: string
}

export type StatusTransaksi = 'Keluar' | 'Kembali'

export interface Transaksi {
  id: string
  alatId: string
  namaAlat: string
  kodeAlat: string
  jumlah: number
  peminjam: string
  instansi?: string
  keperluan: string
  tanggalKeluar: string
  tanggalKembaliRencana: string
  tanggalKembaliAktual?: string
  status: StatusTransaksi
  catatan?: string
  petugasKeluar: string
  petugasKembali?: string
  createdAt: string
}
