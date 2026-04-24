import { useState, useEffect } from 'react'
import type { Alat, Transaksi } from '../types'

const ALAT_KEY = 'psbk_alat'
const TRANSAKSI_KEY = 'psbk_transaksi'

const defaultAlat: Alat[] = [
  { id: '1', nama: 'Mixer Allen & Heath', kode: 'MX-001', kategori: 'Mixer', merek: 'Allen & Heath', jumlah: 2, jumlahTersedia: 2, status: 'Tersedia', kondisi: 'Baik', createdAt: new Date().toISOString() },
  { id: '2', nama: 'Amplifier Crown', kode: 'AMP-001', kategori: 'Amplifier', merek: 'Crown', jumlah: 4, jumlahTersedia: 4, status: 'Tersedia', kondisi: 'Baik', createdAt: new Date().toISOString() },
  { id: '3', nama: 'Speaker Aktif JBL 15"', kode: 'SPK-001', kategori: 'Speaker', merek: 'JBL', jumlah: 8, jumlahTersedia: 8, status: 'Tersedia', kondisi: 'Baik', createdAt: new Date().toISOString() },
  { id: '4', nama: 'Microphone Shure SM58', kode: 'MIC-001', kategori: 'Microphone', merek: 'Shure', jumlah: 10, jumlahTersedia: 10, status: 'Tersedia', kondisi: 'Baik', createdAt: new Date().toISOString() },
  { id: '5', nama: 'Microphone Wireless Shure', kode: 'MIC-002', kategori: 'Microphone', merek: 'Shure', jumlah: 6, jumlahTersedia: 6, status: 'Tersedia', kondisi: 'Baik', createdAt: new Date().toISOString() },
  { id: '6', nama: 'Kabel XLR 10m', kode: 'KBL-001', kategori: 'Kabel', merek: 'Canare', jumlah: 20, jumlahTersedia: 20, status: 'Tersedia', kondisi: 'Baik', createdAt: new Date().toISOString() },
  { id: '7', nama: 'DI Box', kode: 'EFX-001', kategori: 'Efek', merek: 'Behringer', jumlah: 4, jumlahTersedia: 4, status: 'Tersedia', kondisi: 'Baik', createdAt: new Date().toISOString() },
  { id: '8', nama: 'Speaker Monitor', kode: 'SPK-002', kategori: 'Speaker', merek: 'Yamaha', jumlah: 4, jumlahTersedia: 4, status: 'Tersedia', kondisi: 'Baik', createdAt: new Date().toISOString() },
]

function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export function useStore() {
  const [alat, setAlatState] = useState<Alat[]>(() => loadData(ALAT_KEY, defaultAlat))
  const [transaksi, setTransaksiState] = useState<Transaksi[]>(() => loadData(TRANSAKSI_KEY, []))

  useEffect(() => { saveData(ALAT_KEY, alat) }, [alat])
  useEffect(() => { saveData(TRANSAKSI_KEY, transaksi) }, [transaksi])

  function tambahAlat(data: Omit<Alat, 'id' | 'createdAt'>) {
    const baru: Alat = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setAlatState(prev => [...prev, baru])
    return baru
  }

  function updateAlat(id: string, data: Partial<Alat>) {
    setAlatState(prev => prev.map(a => a.id === id ? { ...a, ...data } : a))
  }

  function hapusAlat(id: string) {
    setAlatState(prev => prev.filter(a => a.id !== id))
  }

  function keluarkanAlat(data: Omit<Transaksi, 'id' | 'createdAt' | 'status' | 'tanggalKembaliAktual' | 'petugasKembali'>) {
    const trx: Transaksi = {
      ...data,
      id: crypto.randomUUID(),
      status: 'Keluar',
      createdAt: new Date().toISOString(),
    }
    setTransaksiState(prev => [...prev, trx])
    setAlatState(prev =>
      prev.map(a =>
        a.id === data.alatId
          ? { ...a, jumlahTersedia: a.jumlahTersedia - data.jumlah, status: a.jumlahTersedia - data.jumlah <= 0 ? 'Dipinjam' : a.status }
          : a
      )
    )
    return trx
  }

  function kembalikanAlat(transaksiId: string, petugasKembali: string, catatan?: string) {
    let trxFound: Transaksi | undefined
    setTransaksiState(prev =>
      prev.map(t => {
        if (t.id === transaksiId) {
          trxFound = { ...t, status: 'Kembali', tanggalKembaliAktual: new Date().toISOString(), petugasKembali, catatan: catatan || t.catatan }
          return trxFound
        }
        return t
      })
    )
    if (trxFound) {
      const trx = trxFound
      setAlatState(prev =>
        prev.map(a =>
          a.id === trx.alatId
            ? { ...a, jumlahTersedia: Math.min(a.jumlah, a.jumlahTersedia + trx.jumlah), status: 'Tersedia' }
            : a
        )
      )
    }
  }

  return { alat, transaksi, tambahAlat, updateAlat, hapusAlat, keluarkanAlat, kembalikanAlat }
}
