import { useState } from 'react'
import { Package, ArrowUpRight, ArrowDownLeft, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react'
import type { Alat, Transaksi } from '../types'

interface DashboardProps {
  alat: Alat[]
  transaksi: Transaksi[]
  onNavigate: (page: 'inventaris' | 'transaksi' | 'riwayat') => void
}

export default function Dashboard({ alat, transaksi, onNavigate }: DashboardProps) {
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null)
  const totalAlat = alat.reduce((s, a) => s + a.jumlah, 0)
  const totalTersedia = alat.reduce((s, a) => s + a.jumlahTersedia, 0)
  const totalDipinjam = totalAlat - totalTersedia
  const alatBermasalah = alat.filter(a => a.status === 'Rusak' || a.status === 'Maintenance')

  const sedangKeluar = transaksi.filter(t => t.status === 'Keluar')
  const hariIni = new Date().toDateString()
  const keluarHariIni = transaksi.filter(t => new Date(t.createdAt).toDateString() === hariIni && t.status === 'Keluar').length
  const kembaliHariIni = transaksi.filter(t => t.tanggalKembaliAktual && new Date(t.tanggalKembaliAktual).toDateString() === hariIni).length

  const terlambat = sedangKeluar.filter(t => new Date(t.tanggalKembaliRencana) < new Date())

  const recentTransaksi = [...transaksi]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const groupedRecent = Array.from(
    recentTransaksi.reduce((map, trx) => {
      const key = `${trx.createdAt}|${trx.peminjam}|${trx.status}`
      const current = map.get(key) || {
        key,
        createdAt: trx.createdAt,
        peminjam: trx.peminjam,
        keperluan: trx.keperluan,
        status: trx.status,
        totalItem: 0,
        totalJenis: 0,
        items: [] as Transaksi[],
      }
      current.totalItem += trx.jumlah
      current.items.push(trx)
      current.totalJenis = current.items.length
      map.set(key, current)
      return map
    }, new Map<string, {
      key: string
      createdAt: string
      peminjam: string
      keperluan: string
      status: Transaksi['status']
      totalItem: number
      totalJenis: number
      items: Transaksi[]
    }>())
  )
    .map(([, value]) => value)
    .slice(0, 5)

  const selectedGroup = groupedRecent.find(group => group.key === selectedGroupKey) || null

  const stats = [
    { label: 'Total Item Alat', value: totalAlat, icon: Package, textColor: 'text-blue-600', bgLight: 'bg-blue-50' },
    { label: 'Tersedia', value: totalTersedia, icon: CheckCircle2, textColor: 'text-emerald-600', bgLight: 'bg-emerald-50' },
    { label: 'Sedang Dipinjam', value: totalDipinjam, icon: ArrowUpRight, textColor: 'text-amber-600', bgLight: 'bg-amber-50' },
    { label: 'Terlambat Kembali', value: terlambat.length, icon: AlertTriangle, textColor: 'text-red-600', bgLight: 'bg-red-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Ringkasan kondisi alat sound system hari ini</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, textColor, bgLight }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
            <div className={`${bgLight} p-3 rounded-xl`}>
              <Icon className={`w-5 h-5 ${textColor}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-tight">{label}</p>
              <p className={`text-2xl font-bold ${textColor} mt-0.5`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight className="w-5 h-5 text-indigo-200" />
            <span className="text-sm font-medium text-indigo-100">Keluar Hari Ini</span>
          </div>
          <p className="text-4xl font-bold">{keluarHariIni}</p>
          <p className="text-xs text-indigo-200 mt-1">transaksi peminjaman</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownLeft className="w-5 h-5 text-emerald-200" />
            <span className="text-sm font-medium text-emerald-100">Kembali Hari Ini</span>
          </div>
          <p className="text-4xl font-bold">{kembaliHariIni}</p>
          <p className="text-xs text-emerald-200 mt-1">alat telah dikembalikan</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-orange-200" />
            <span className="text-sm font-medium text-orange-100">Masih Dipinjam</span>
          </div>
          <p className="text-4xl font-bold">{sedangKeluar.length}</p>
          <p className="text-xs text-orange-200 mt-1">transaksi aktif</p>
        </div>
      </div>

      {/* Terlambat & Bermasalah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {terlambat.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5">
            <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              Terlambat Kembali ({terlambat.length})
            </h3>
            <div className="space-y-2">
              {terlambat.slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm bg-red-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="font-medium text-gray-800">{t.namaAlat}</p>
                    <p className="text-xs text-gray-500">{t.peminjam}</p>
                  </div>
                  <span className="text-xs text-red-600 font-medium">
                    {new Date(t.tanggalKembaliRencana).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {alatBermasalah.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
            <h3 className="font-semibold text-amber-700 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              Alat Bermasalah ({alatBermasalah.length})
            </h3>
            <div className="space-y-2">
              {alatBermasalah.map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm bg-amber-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="font-medium text-gray-800">{a.nama}</p>
                    <p className="text-xs text-gray-500">{a.kode}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    a.status === 'Rusak' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transaksi Terbaru */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Transaksi Terbaru</h3>
          <button onClick={() => onNavigate('riwayat')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            Lihat semua →
          </button>
        </div>
        {groupedRecent.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Belum ada transaksi</p>
        ) : (
          <div className="space-y-2">
            {groupedRecent.map(group => (
              <button
                key={group.key}
                onClick={() => setSelectedGroupKey(group.key)}
                className="w-full text-left flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-1"
              >
                <div className={`p-1.5 rounded-lg ${group.status === 'Keluar' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                  {group.status === 'Keluar'
                    ? <ArrowUpRight className="w-4 h-4 text-amber-600" />
                    : <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{group.peminjam} · {group.totalItem} item</p>
                  <p className="text-xs text-gray-500 truncate">{group.totalJenis} jenis alat · {group.keperluan}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    group.status === 'Keluar' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>{group.status}</span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(group.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('transaksi')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-5 text-left transition-colors"
        >
          <ArrowUpRight className="w-6 h-6 mb-2" />
          <p className="font-semibold">Catat Alat Keluar</p>
          <p className="text-xs text-indigo-200 mt-1">Buat peminjaman baru</p>
        </button>
        <button
          onClick={() => onNavigate('inventaris')}
          className="bg-white hover:bg-gray-50 text-gray-800 rounded-2xl p-5 text-left border border-gray-200 transition-colors shadow-sm"
        >
          <Package className="w-6 h-6 mb-2 text-indigo-600" />
          <p className="font-semibold">Kelola Inventaris</p>
          <p className="text-xs text-gray-400 mt-1">Tambah & edit alat</p>
        </button>
      </div>

      {selectedGroup && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedGroupKey(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800">{selectedGroup.peminjam} · {selectedGroup.totalItem} item</h3>
                <p className="text-xs text-gray-500">{selectedGroup.totalJenis} jenis alat · {selectedGroup.keperluan}</p>
              </div>
              <button onClick={() => setSelectedGroupKey(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2">
              {selectedGroup.items.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-3">
                  <p className="text-sm font-medium text-gray-800">{item.namaAlat}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.kodeAlat}</p>
                  <p className="text-xs text-indigo-600 mt-1">{item.jumlah} unit</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
