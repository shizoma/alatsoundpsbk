import { useState } from 'react'
import { ArrowUpRight, ArrowDownLeft, X, CheckCircle2, Search, AlertTriangle } from 'lucide-react'
import type { Alat, Transaksi } from '../types'

interface TransaksiPageProps {
  alat: Alat[]
  transaksi: Transaksi[]
  onKeluar: (data: Omit<Transaksi, 'id' | 'createdAt' | 'status' | 'tanggalKembaliAktual' | 'petugasKembali'>) => void
  onKembali: (transaksiId: string, petugas: string, catatan?: string) => void
}

const today = () => new Date().toISOString().split('T')[0]
const tomorrow = () => {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]
}

const emptyKeluar = () => ({
  alatId: '', namaAlat: '', kodeAlat: '', jumlah: 1,
  peminjam: '', instansi: '', keperluan: '',
  tanggalKeluar: today(), tanggalKembaliRencana: tomorrow(),
  petugasKeluar: '', catatan: ''
})

export default function TransaksiPage({ alat, transaksi, onKeluar, onKembali }: TransaksiPageProps) {
  const [tab, setTab] = useState<'keluar' | 'kembali'>('keluar')

  // Form Keluar
  const [formKeluar, setFormKeluar] = useState(emptyKeluar())
  const [searchAlat, setSearchAlat] = useState('')
  const [showPilihAlat, setShowPilihAlat] = useState(false)
  const [successKeluar, setSuccessKeluar] = useState(false)

  // Form Kembali
  const [searchTrx, setSearchTrx] = useState('')
  const [selectedTrx, setSelectedTrx] = useState<Transaksi | null>(null)
  const [petugasKembali, setPetugasKembali] = useState('')
  const [catatanKembali, setCatatanKembali] = useState('')
  const [successKembali, setSuccessKembali] = useState(false)

  const alatTersedia = alat.filter(a => a.jumlahTersedia > 0 && a.status !== 'Rusak')
  const filteredAlat = alatTersedia.filter(a =>
    a.nama.toLowerCase().includes(searchAlat.toLowerCase()) || a.kode.toLowerCase().includes(searchAlat.toLowerCase())
  )

  const trxAktif = transaksi.filter(t => t.status === 'Keluar')
  const filteredTrx = trxAktif.filter(t =>
    t.peminjam.toLowerCase().includes(searchTrx.toLowerCase()) ||
    t.namaAlat.toLowerCase().includes(searchTrx.toLowerCase()) ||
    t.kodeAlat.toLowerCase().includes(searchTrx.toLowerCase())
  )

  function pilihAlat(a: Alat) {
    setFormKeluar(f => ({ ...f, alatId: a.id, namaAlat: a.nama, kodeAlat: a.kode, jumlah: 1 }))
    setShowPilihAlat(false)
    setSearchAlat('')
  }

  function handleSubmitKeluar(e: React.FormEvent) {
    e.preventDefault()
    const { alatId, namaAlat, kodeAlat, jumlah, peminjam, instansi, keperluan, tanggalKeluar, tanggalKembaliRencana, petugasKeluar, catatan } = formKeluar
    onKeluar({ alatId, namaAlat, kodeAlat, jumlah, peminjam, instansi, keperluan, tanggalKeluar, tanggalKembaliRencana, petugasKeluar, catatan })
    setFormKeluar(emptyKeluar())
    setSuccessKeluar(true)
    setTimeout(() => setSuccessKeluar(false), 3000)
  }

  function handleSubmitKembali(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTrx) return
    onKembali(selectedTrx.id, petugasKembali, catatanKembali)
    setSelectedTrx(null)
    setPetugasKembali('')
    setCatatanKembali('')
    setSearchTrx('')
    setSuccessKembali(true)
    setTimeout(() => setSuccessKembali(false), 3000)
  }

  const selectedAlat = alat.find(a => a.id === formKeluar.alatId)
  const isTerlambat = (t: Transaksi) => new Date(t.tanggalKembaliRencana) < new Date()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Transaksi Alat</h2>
        <p className="text-gray-500 text-sm mt-1">Catat keluar & pengembalian alat</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => setTab('keluar')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'keluar' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Alat Keluar
        </button>
        <button
          onClick={() => setTab('kembali')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'kembali' ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Alat Kembali
          {trxAktif.length > 0 && (
            <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{trxAktif.length}</span>
          )}
        </button>
      </div>

      {/* Success Alert */}
      {(successKeluar || successKembali) && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${successKeluar ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
          <CheckCircle2 className={`w-5 h-5 ${successKeluar ? 'text-amber-600' : 'text-emerald-600'}`} />
          <p className={`text-sm font-medium ${successKeluar ? 'text-amber-700' : 'text-emerald-700'}`}>
            {successKeluar ? 'Alat keluar berhasil dicatat!' : 'Pengembalian alat berhasil dicatat!'}
          </p>
        </div>
      )}

      {/* === FORM KELUAR === */}
      {tab === 'keluar' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-5">
            <ArrowUpRight className="w-5 h-5 text-amber-600" />
            Form Alat Keluar
          </h3>
          <form onSubmit={handleSubmitKeluar} className="space-y-4">
            {/* Pilih Alat */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Alat yang Dipinjam *</label>
              <div
                onClick={() => setShowPilihAlat(true)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm cursor-pointer hover:border-indigo-400 transition-colors flex items-center justify-between"
              >
                {formKeluar.alatId ? (
                  <div>
                    <span className="font-medium text-gray-800">{formKeluar.namaAlat}</span>
                    <span className="text-gray-400 ml-2 text-xs">{formKeluar.kodeAlat}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Klik untuk pilih alat...</span>
                )}
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              {selectedAlat && (
                <p className="text-xs text-emerald-600 mt-1">Tersedia: {selectedAlat.jumlahTersedia} unit</p>
              )}
            </div>

            {formKeluar.alatId && selectedAlat && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah *</label>
                <input
                  type="number" required min={1} max={selectedAlat.jumlahTersedia}
                  value={formKeluar.jumlah}
                  onChange={e => setFormKeluar(f => ({ ...f, jumlah: +e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Peminjam *</label>
                <input required value={formKeluar.peminjam} onChange={e => setFormKeluar(f => ({ ...f, peminjam: e.target.value }))}
                  placeholder="Nama lengkap peminjam"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Instansi / Kelompok</label>
                <input value={formKeluar.instansi} onChange={e => setFormKeluar(f => ({ ...f, instansi: e.target.value }))}
                  placeholder="Nama kelompok / komunitas"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Keperluan / Acara *</label>
              <input required value={formKeluar.keperluan} onChange={e => setFormKeluar(f => ({ ...f, keperluan: e.target.value }))}
                placeholder="Misal: Pertunjukan Tari, Latihan, dll."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Keluar *</label>
                <input type="date" required value={formKeluar.tanggalKeluar} onChange={e => setFormKeluar(f => ({ ...f, tanggalKeluar: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rencana Kembali *</label>
                <input type="date" required value={formKeluar.tanggalKembaliRencana} onChange={e => setFormKeluar(f => ({ ...f, tanggalKembaliRencana: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Petugas (yang mencatat) *</label>
              <input required value={formKeluar.petugasKeluar} onChange={e => setFormKeluar(f => ({ ...f, petugasKeluar: e.target.value }))}
                placeholder="Nama petugas"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Catatan Tambahan</label>
              <textarea rows={2} value={formKeluar.catatan} onChange={e => setFormKeluar(f => ({ ...f, catatan: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>

            <button type="submit" disabled={!formKeluar.alatId}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Catat Alat Keluar
            </button>
          </form>
        </div>
      )}

      {/* === FORM KEMBALI === */}
      {tab === 'kembali' && (
        <div className="space-y-4">
          {/* Cari transaksi aktif */}
          {!selectedTrx && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                Pilih Transaksi yang Dikembalikan
              </h3>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={searchTrx} onChange={e => setSearchTrx(e.target.value)}
                  placeholder="Cari nama peminjam / alat..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              {filteredTrx.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Tidak ada alat yang sedang dipinjam</p>
              ) : (
                <div className="space-y-2">
                  {filteredTrx.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTrx(t)}
                      className={`p-4 rounded-xl border cursor-pointer hover:border-emerald-400 transition-colors ${
                        isTerlambat(t) ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{t.namaAlat}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{t.peminjam} · {t.instansi || t.keperluan}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Keluar: {new Date(t.tanggalKeluar).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ·
                            Kembali: {new Date(t.tanggalKembaliRencana).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-gray-700 text-sm">{t.jumlah} unit</span>
                          {isTerlambat(t) && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                              <AlertTriangle className="w-3 h-3" />
                              Terlambat
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Konfirmasi Kembali */}
          {selectedTrx && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                  Konfirmasi Pengembalian
                </h3>
                <button onClick={() => setSelectedTrx(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Detail Transaksi */}
              <div className={`p-4 rounded-xl mb-5 ${isTerlambat(selectedTrx) ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Alat</p>
                    <p className="font-semibold text-gray-800">{selectedTrx.namaAlat}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Jumlah</p>
                    <p className="font-semibold text-gray-800">{selectedTrx.jumlah} unit</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Peminjam</p>
                    <p className="font-medium text-gray-700">{selectedTrx.peminjam}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Rencana Kembali</p>
                    <p className={`font-medium ${isTerlambat(selectedTrx) ? 'text-red-600' : 'text-gray-700'}`}>
                      {new Date(selectedTrx.tanggalKembaliRencana).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                      {isTerlambat(selectedTrx) && ' (TERLAMBAT)'}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitKembali} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Petugas Penerima *</label>
                  <input required value={petugasKembali} onChange={e => setPetugasKembali(e.target.value)}
                    placeholder="Nama petugas yang menerima"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kondisi Alat Saat Kembali</label>
                  <textarea rows={2} value={catatanKembali} onChange={e => setCatatanKembali(e.target.value)}
                    placeholder="Misal: Baik, ada goresan kecil, dll."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                <button type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Alat Kembali
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Modal Pilih Alat */}
      {showPilihAlat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Pilih Alat</h3>
              <button onClick={() => setShowPilihAlat(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input autoFocus value={searchAlat} onChange={e => setSearchAlat(e.target.value)}
                  placeholder="Cari nama atau kode alat..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {filteredAlat.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Tidak ada alat tersedia</p>
              ) : (
                filteredAlat.map(a => (
                  <button key={a.id} onClick={() => pilihAlat(a)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 transition-colors text-left">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{a.nama}</p>
                      <p className="text-xs text-gray-500">{a.kode} · {a.kategori} · {a.merek}</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      {a.jumlahTersedia} unit
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
