export type KategoriAlat =
  | 'Mixer'
  | 'Amplifier'
  | 'Speaker'
  | 'Microphone'
  | 'Kabel'
  | 'Efek'
  | 'Lainnya'

export type StatusAlat = 'Tersedia' | 'Dipinjam' | 'Rusak' | 'Maintenance'

export interface Alat {
  id: string
  nama: string
  kode: string
  kategori: KategoriAlat
  merek: string
  jumlah: number
  jumlahTersedia: number
  status: StatusAlat
  kondisi: string
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
