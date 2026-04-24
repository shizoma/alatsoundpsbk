import { useState } from 'react'
import { Search, ArrowUpRight, ArrowDownLeft, AlertTriangle, FileText, Trash2 } from 'lucide-react'
import type { Transaksi } from '../types'

interface RiwayatProps {
  transaksi: Transaksi[]
  onResetRiwayat: () => void
}

export default function Riwayat({ transaksi, onResetRiwayat }: RiwayatProps) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'Semua' | 'Keluar' | 'Kembali'>('Semua')
  const [filterBulan, setFilterBulan] = useState('')

  const sorted = [...transaksi].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const filtered = sorted.filter(t => {
    const matchSearch =
      t.peminjam.toLowerCase().includes(search.toLowerCase()) ||
      t.namaAlat.toLowerCase().includes(search.toLowerCase()) ||
      t.keperluan.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'Semua' || t.status === filterStatus
    const matchBulan = !filterBulan || t.createdAt.startsWith(filterBulan)
    return matchSearch && matchStatus && matchBulan
  })

  const isTerlambat = (t: Transaksi) =>
    t.status === 'Keluar' && new Date(t.tanggalKembaliRencana) < new Date()

  const isTerlambatKembali = (t: Transaksi) => {
    if (t.status !== 'Kembali' || !t.tanggalKembaliAktual) return false
    return new Date(t.tanggalKembaliAktual) > new Date(t.tanggalKembaliRencana)
  }

  const months = [...new Set(sorted.map(t => t.createdAt.slice(0, 7)))].slice(0, 12)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h2>
        <p className="text-gray-500 text-sm mt-1">{transaksi.length} total transaksi tercatat</p>
        {transaksi.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const ok = window.confirm('Hapus semua riwayat transaksi? Tindakan ini tidak bisa dibatalkan.')
              if (ok) onResetRiwayat()
            }}
            className="mt-3 inline-flex items-center gap-2 text-sm bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Reset Riwayat
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari peminjam, alat, atau keperluan..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="Semua">Semua Status</option>
          <option value="Keluar">Sedang Dipinjam</option>
          <option value="Kembali">Sudah Kembali</option>
        </select>
        <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="">Semua Bulan</option>
          {months.map(m => (
            <option key={m} value={m}>
              {new Date(m + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-medium">
          {transaksi.filter(t => t.status === 'Keluar').length} sedang dipinjam
        </span>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
          {transaksi.filter(t => t.status === 'Kembali').length} sudah kembali
        </span>
        <span className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-medium">
          {transaksi.filter(t => isTerlambat(t)).length} terlambat
        </span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Tidak ada data transaksi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${
              isTerlambat(t) ? 'border-red-200' : isTerlambatKembali(t) ? 'border-orange-200' : 'border-gray-100'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl flex-shrink-0 ${t.status === 'Keluar' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                  {t.status === 'Keluar'
                    ? <ArrowUpRight className="w-5 h-5 text-amber-600" />
                    : <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">{t.namaAlat}
                        <span className="text-gray-400 text-xs font-normal ml-1">({t.kodeAlat})</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">{t.peminjam}{t.instansi ? ` · ${t.instansi}` : ''}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.keperluan}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                        t.status === 'Keluar' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{t.status}</span>
                      <p className="text-lg font-bold text-gray-700 mt-1">{t.jumlah} <span className="text-xs font-normal text-gray-400">unit</span></p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">Tanggal Keluar</p>
                      <p className="text-gray-700 font-medium">
                        {new Date(t.tanggalKeluar).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Rencana Kembali</p>
                      <p className={`font-medium ${isTerlambat(t) ? 'text-red-600' : 'text-gray-700'}`}>
                        {new Date(t.tanggalKembaliRencana).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {t.tanggalKembaliAktual && (
                      <div>
                        <p className="text-gray-400">Kembali Aktual</p>
                        <p className={`font-medium ${isTerlambatKembali(t) ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {new Date(t.tanggalKembaliAktual).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400">Petugas</p>
                      <p className="text-gray-700 font-medium">{t.petugasKembali || t.petugasKeluar}</p>
                    </div>
                  </div>

                  {(isTerlambat(t) || isTerlambatKembali(t)) && (
                    <div className={`mt-2 flex items-center gap-1.5 text-xs ${isTerlambat(t) ? 'text-red-600' : 'text-orange-600'}`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {isTerlambat(t) ? 'Melewati batas waktu pengembalian' : 'Dikembalikan terlambat'}
                    </div>
                  )}

                  {t.catatan && (
                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="font-medium">Catatan:</span> {t.catatan}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
