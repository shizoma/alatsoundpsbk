import { useState, useEffect } from 'react'
import { KATEGORI_ALAT, KONDISI_ALAT, STATUS_ALAT, type Alat, type KategoriAlat, type KondisiAlat, type StatusAlat, type Transaksi } from '../types'
import { importedAlat } from '../data/importedAlat'

const ALAT_KEY = 'psbk_alat'
const TRANSAKSI_KEY = 'psbk_transaksi'

const defaultAlat: Alat[] = importedAlat

const kategoriSet = new Set<KategoriAlat>(KATEGORI_ALAT)
const kondisiSet = new Set<KondisiAlat>(KONDISI_ALAT)
const statusSet = new Set<StatusAlat>(STATUS_ALAT)

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

function shouldReplaceWithImported(data: Alat[]): boolean {
  if (data.length === 0) return true
  const demoCodes = new Set(['MX-001', 'AMP-001', 'SPK-001', 'MIC-001', 'MIC-002', 'KBL-001', 'EFX-001', 'SPK-002'])
  const hasDemoData = data.every(item => demoCodes.has(item.kode.toUpperCase()))
  return hasDemoData
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function normalizeKode(value: string): string {
  return normalizeText(value).toUpperCase()
}

function normalizeDate(value?: string): string | undefined {
  const raw = normalizeText(value || '')
  if (!raw) return undefined
  return raw
}

function deriveStatus(jumlahTersedia: number, status: StatusAlat): StatusAlat {
  if (status === 'Rusak' || status === 'Maintenance') {
    return status
  }
  return jumlahTersedia <= 0 ? 'Dipinjam' : 'Tersedia'
}

type KeluarPayload = Omit<Transaksi, 'id' | 'createdAt' | 'status' | 'tanggalKembaliAktual' | 'petugasKembali'>

function normalizeAlatInput(
  raw: Omit<Alat, 'id' | 'createdAt'>,
  existing: Alat[],
  editingId?: string
): Omit<Alat, 'id' | 'createdAt'> {
  const nama = normalizeText(raw.nama)
  const kode = normalizeKode(raw.kode)
  const merek = normalizeText(raw.merek)
  const keterangan = normalizeText(raw.keterangan || '')
  const catatanMaintenance = normalizeText(raw.catatanMaintenance || '')
  const tanggalServisTerakhir = normalizeDate(raw.tanggalServisTerakhir)
  const tanggalServisBerikutnya = normalizeDate(raw.tanggalServisBerikutnya)
  const jumlah = Number(raw.jumlah)
  const jumlahTersedia = Number(raw.jumlahTersedia)

  if (!nama) throw new Error('Nama alat wajib diisi.')
  if (!kode) throw new Error('Kode alat wajib diisi.')
  if (!merek) throw new Error('Merek alat wajib diisi.')
  if (!kategoriSet.has(raw.kategori)) throw new Error('Kategori alat tidak valid.')
  if (!kondisiSet.has(raw.kondisi)) throw new Error('Kondisi alat tidak valid.')
  if (!statusSet.has(raw.status)) throw new Error('Status alat tidak valid.')
  if (!Number.isFinite(jumlah) || jumlah < 1) throw new Error('Jumlah total minimal 1.')
  if (!Number.isFinite(jumlahTersedia) || jumlahTersedia < 0) throw new Error('Jumlah tersedia tidak boleh negatif.')
  if (jumlahTersedia > jumlah) throw new Error('Jumlah tersedia tidak boleh melebihi jumlah total.')
  if (tanggalServisTerakhir && Number.isNaN(new Date(tanggalServisTerakhir).getTime())) {
    throw new Error('Tanggal servis terakhir tidak valid.')
  }
  if (tanggalServisBerikutnya && Number.isNaN(new Date(tanggalServisBerikutnya).getTime())) {
    throw new Error('Tanggal servis berikutnya tidak valid.')
  }
  if (tanggalServisTerakhir && tanggalServisBerikutnya) {
    const lastDate = new Date(tanggalServisTerakhir).getTime()
    const nextDate = new Date(tanggalServisBerikutnya).getTime()
    if (nextDate < lastDate) {
      throw new Error('Tanggal servis berikutnya tidak boleh lebih awal dari servis terakhir.')
    }
  }

  const duplicate = existing.find(a => a.id !== editingId && a.kode.toUpperCase() === kode)
  if (duplicate) throw new Error(`Kode alat "${kode}" sudah digunakan.`)

  const nextStatus = deriveStatus(jumlahTersedia, raw.status)

  return {
    ...raw,
    nama,
    kode,
    merek,
    keterangan,
    catatanMaintenance,
    tanggalServisTerakhir,
    tanggalServisBerikutnya,
    jumlah,
    jumlahTersedia,
    status: nextStatus,
    kondisi: raw.kondisi,
  }
}

function sanitizeAlat(raw: unknown): Alat | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Partial<Alat>
  if (!source.id || !source.createdAt) return null

  const kategori = kategoriSet.has(source.kategori as KategoriAlat) ? (source.kategori as KategoriAlat) : 'Lainnya'
  const kondisi = kondisiSet.has(source.kondisi as KondisiAlat) ? (source.kondisi as KondisiAlat) : 'Baik'
  const status = statusSet.has(source.status as StatusAlat) ? (source.status as StatusAlat) : 'Tersedia'

  const jumlah = Math.max(1, Math.floor(Number(source.jumlah) || 0))
  const jumlahTersediaRaw = Math.floor(Number(source.jumlahTersedia) || 0)
  const jumlahTersedia = Math.max(0, Math.min(jumlah, jumlahTersediaRaw))
  const tanggalServisTerakhir = normalizeDate(source.tanggalServisTerakhir)
  const tanggalServisBerikutnya = normalizeDate(source.tanggalServisBerikutnya)

  return {
    id: source.id,
    createdAt: source.createdAt,
    nama: normalizeText(source.nama || 'Tanpa Nama'),
    kode: normalizeKode(source.kode || source.id),
    kategori,
    merek: normalizeText(source.merek || '-'),
    jumlah,
    jumlahTersedia,
    status: deriveStatus(jumlahTersedia, status),
    kondisi,
    keterangan: normalizeText(source.keterangan || ''),
    tanggalServisTerakhir,
    tanggalServisBerikutnya,
    catatanMaintenance: normalizeText(source.catatanMaintenance || ''),
  }
}

function sanitizeAlatCollection(raw: Alat[]): Alat[] {
  const seen = new Set<string>()
  const result: Alat[] = []

  for (const item of raw) {
    const alat = sanitizeAlat(item)
    if (!alat) continue
    const kodeKey = alat.kode.toUpperCase()
    if (seen.has(kodeKey)) continue
    seen.add(kodeKey)
    result.push(alat)
  }

  return result.length > 0 ? result : defaultAlat
}

export function useStore() {
  const [alat, setAlatState] = useState<Alat[]>(() => {
    const loaded = sanitizeAlatCollection(loadData(ALAT_KEY, defaultAlat))
    return shouldReplaceWithImported(loaded) ? sanitizeAlatCollection(defaultAlat) : loaded
  })
  const [transaksi, setTransaksiState] = useState<Transaksi[]>(() => loadData(TRANSAKSI_KEY, []))

  useEffect(() => { saveData(ALAT_KEY, alat) }, [alat])
  useEffect(() => { saveData(TRANSAKSI_KEY, transaksi) }, [transaksi])

  function tambahAlat(data: Omit<Alat, 'id' | 'createdAt'>) {
    const normalized = normalizeAlatInput(data, alat)
    const baru: Alat = { ...normalized, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setAlatState(prev => [...prev, baru])
    return baru
  }

  function updateAlat(id: string, data: Partial<Alat>) {
    const existing = alat.find(a => a.id === id)
    if (!existing) throw new Error('Data alat tidak ditemukan.')

    const merged: Omit<Alat, 'id' | 'createdAt'> = {
      nama: data.nama ?? existing.nama,
      kode: data.kode ?? existing.kode,
      kategori: data.kategori ?? existing.kategori,
      merek: data.merek ?? existing.merek,
      jumlah: data.jumlah ?? existing.jumlah,
      jumlahTersedia: data.jumlahTersedia ?? existing.jumlahTersedia,
      status: data.status ?? existing.status,
      kondisi: data.kondisi ?? existing.kondisi,
      keterangan: data.keterangan ?? existing.keterangan ?? '',
      tanggalServisTerakhir: data.tanggalServisTerakhir ?? existing.tanggalServisTerakhir,
      tanggalServisBerikutnya: data.tanggalServisBerikutnya ?? existing.tanggalServisBerikutnya,
      catatanMaintenance: data.catatanMaintenance ?? existing.catatanMaintenance ?? '',
    }

    const sedangDipinjam = transaksi
      .filter(t => t.alatId === id && t.status === 'Keluar')
      .reduce((sum, t) => sum + t.jumlah, 0)
    const minimalTersedia = Math.max(0, sedangDipinjam)

    if ((merged.jumlah ?? existing.jumlah) < sedangDipinjam) {
      throw new Error(`Jumlah total tidak boleh kurang dari ${sedangDipinjam} unit yang masih dipinjam.`)
    }

    if ((merged.jumlahTersedia ?? existing.jumlahTersedia) < minimalTersedia) {
      throw new Error(`Jumlah tersedia tidak boleh kurang dari ${minimalTersedia} unit selama ada pinjaman aktif.`)
    }

    const normalized = normalizeAlatInput(merged, alat, id)
    setAlatState(prev => prev.map(a => a.id === id ? { ...a, ...normalized } : a))
  }

  function hapusAlat(id: string) {
    const hasActive = transaksi.some(t => t.alatId === id && t.status === 'Keluar')
    if (hasActive) {
      throw new Error('Alat tidak bisa dihapus karena masih ada transaksi peminjaman aktif.')
    }
    setAlatState(prev => prev.filter(a => a.id !== id))
  }

  function keluarkanAlat(data: KeluarPayload) {
    const targetAlat = alat.find(a => a.id === data.alatId)
    if (!targetAlat) throw new Error('Alat tidak ditemukan.')
    if (data.jumlah < 1) throw new Error('Jumlah pinjam minimal 1.')
    if (data.jumlah > targetAlat.jumlahTersedia) {
      throw new Error(`Stok ${targetAlat.nama} tidak mencukupi.`)
    }

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
          ? (() => {
            const nextTersedia = a.jumlahTersedia - data.jumlah
            return {
              ...a,
              jumlahTersedia: nextTersedia,
              status: deriveStatus(nextTersedia, a.status),
            }
          })()
          : a
      )
    )
    return trx
  }

  function keluarkanBanyakAlat(
    data: Omit<KeluarPayload, 'alatId' | 'namaAlat' | 'kodeAlat' | 'jumlah'>,
    items: Array<{ alatId: string; jumlah: number }>
  ) {
    if (items.length === 0) {
      throw new Error('Pilih minimal satu alat.')
    }

    const merged = new Map<string, number>()
    for (const item of items) {
      const qty = Math.floor(Number(item.jumlah))
      if (!item.alatId || qty < 1) {
        throw new Error('Jumlah semua item harus minimal 1.')
      }
      merged.set(item.alatId, (merged.get(item.alatId) || 0) + qty)
    }

    const createdAt = new Date().toISOString()
    const nextTrx: Transaksi[] = []

    for (const [alatId, jumlah] of merged.entries()) {
      const targetAlat = alat.find(a => a.id === alatId)
      if (!targetAlat) throw new Error('Ada item alat yang tidak ditemukan.')
      if (jumlah > targetAlat.jumlahTersedia) {
        throw new Error(`Stok ${targetAlat.nama} hanya ${targetAlat.jumlahTersedia} unit.`)
      }

      nextTrx.push({
        ...data,
        alatId,
        jumlah,
        namaAlat: targetAlat.nama,
        kodeAlat: targetAlat.kode,
        id: crypto.randomUUID(),
        status: 'Keluar',
        createdAt,
      })
    }

    setTransaksiState(prev => [...prev, ...nextTrx])
    setAlatState(prev =>
      prev.map(a => {
        const keluarQty = merged.get(a.id) || 0
        if (keluarQty === 0) return a
        const nextTersedia = a.jumlahTersedia - keluarQty
        return {
          ...a,
          jumlahTersedia: nextTersedia,
          status: deriveStatus(nextTersedia, a.status),
        }
      })
    )

    return nextTrx
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
            ? (() => {
              const nextTersedia = Math.min(a.jumlah, a.jumlahTersedia + trx.jumlah)
              return {
                ...a,
                jumlahTersedia: nextTersedia,
                status: deriveStatus(nextTersedia, a.status),
              }
            })()
            : a
        )
      )
    }
  }

  function kembalikanBanyakAlat(transaksiIds: string[], petugasKembali: string, catatan?: string) {
    if (transaksiIds.length === 0) {
      throw new Error('Pilih minimal satu transaksi untuk dikembalikan.')
    }

    const idSet = new Set(transaksiIds)
    const aktifDipilih = transaksi.filter(t => idSet.has(t.id) && t.status === 'Keluar')
    if (aktifDipilih.length === 0) {
      throw new Error('Tidak ada transaksi aktif yang dipilih.')
    }

    const now = new Date().toISOString()
    setTransaksiState(prev =>
      prev.map(t =>
        idSet.has(t.id) && t.status === 'Keluar'
          ? { ...t, status: 'Kembali', tanggalKembaliAktual: now, petugasKembali, catatan: catatan || t.catatan }
          : t
      )
    )

    const kembaliByAlat = new Map<string, number>()
    for (const trx of aktifDipilih) {
      kembaliByAlat.set(trx.alatId, (kembaliByAlat.get(trx.alatId) || 0) + trx.jumlah)
    }

    setAlatState(prev =>
      prev.map(a => {
        const kembaliQty = kembaliByAlat.get(a.id) || 0
        if (kembaliQty === 0) return a
        const nextTersedia = Math.min(a.jumlah, a.jumlahTersedia + kembaliQty)
        return {
          ...a,
          jumlahTersedia: nextTersedia,
          status: deriveStatus(nextTersedia, a.status),
        }
      })
    )
  }

  function resetRiwayatTransaksi() {
    setTransaksiState([])
    setAlatState(prev =>
      prev.map(a => {
        const nextTersedia = a.jumlah
        return {
          ...a,
          jumlahTersedia: nextTersedia,
          status: deriveStatus(nextTersedia, a.status),
        }
      })
    )
  }

  function jadwalkanMaintenance(
    id: string,
    data: { tanggalServisTerakhir?: string; tanggalServisBerikutnya: string; catatanMaintenance?: string }
  ) {
    const target = alat.find(a => a.id === id)
    if (!target) throw new Error('Data alat tidak ditemukan.')

    const nextDate = normalizeDate(data.tanggalServisBerikutnya)
    const lastDate = normalizeDate(data.tanggalServisTerakhir)
    if (!nextDate) throw new Error('Tanggal servis berikutnya wajib diisi.')
    if (Number.isNaN(new Date(nextDate).getTime())) throw new Error('Tanggal servis berikutnya tidak valid.')
    if (lastDate && Number.isNaN(new Date(lastDate).getTime())) throw new Error('Tanggal servis terakhir tidak valid.')
    if (lastDate && new Date(nextDate).getTime() < new Date(lastDate).getTime()) {
      throw new Error('Tanggal servis berikutnya tidak boleh lebih awal dari servis terakhir.')
    }

    setAlatState(prev =>
      prev.map(a =>
        a.id === id
          ? {
            ...a,
            tanggalServisTerakhir: lastDate,
            tanggalServisBerikutnya: nextDate,
            catatanMaintenance: normalizeText(data.catatanMaintenance || ''),
            status: 'Maintenance',
          }
          : a
      )
    )
  }

  return {
    alat,
    transaksi,
    tambahAlat,
    updateAlat,
    hapusAlat,
    keluarkanAlat,
    keluarkanBanyakAlat,
    kembalikanAlat,
    kembalikanBanyakAlat,
    resetRiwayatTransaksi,
    jadwalkanMaintenance,
  }
}
