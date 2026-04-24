import { useState } from 'react'
import { ArrowUpRight, ArrowDownLeft, X, CheckCircle2, Search, AlertTriangle } from 'lucide-react'
import type { Alat, Transaksi } from '../types'

interface TransaksiPageProps {
  alat: Alat[]
  transaksi: Transaksi[]
  onKeluarBatch: (
    data: Omit<Transaksi, 'id' | 'createdAt' | 'status' | 'tanggalKembaliAktual' | 'petugasKembali' | 'alatId' | 'namaAlat' | 'kodeAlat' | 'jumlah'>,
    items: Array<{ alatId: string; jumlah: number }>
  ) => void
  onKembaliBatch: (transaksiIds: string[], petugas: string, catatan?: string) => void
}

const today = () => new Date().toISOString().split('T')[0]
const tomorrow = () => {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]
}

const emptyKeluar = () => ({
  peminjam: '', instansi: '', keperluan: '',
  tanggalKeluar: today(), tanggalKembaliRencana: tomorrow(),
  petugasKeluar: '', catatan: ''
})

export default function TransaksiPage({ alat, transaksi, onKeluarBatch, onKembaliBatch }: TransaksiPageProps) {
  const [tab, setTab] = useState<'keluar' | 'kembali'>('keluar')

  // Form Keluar
  const [formKeluar, setFormKeluar] = useState(emptyKeluar())
  const [searchAlat, setSearchAlat] = useState('')
  const [showPilihAlat, setShowPilihAlat] = useState(false)
  const [successKeluar, setSuccessKeluar] = useState(false)
  const [errorKeluar, setErrorKeluar] = useState('')
  const [selectedItems, setSelectedItems] = useState<Array<{ alatId: string; jumlah: number }>>([])

  // Form Kembali
  const [searchTrx, setSearchTrx] = useState('')
  const [selectedTrxIds, setSelectedTrxIds] = useState<string[]>([])
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
    setSelectedItems(prev => {
      if (prev.some(i => i.alatId === a.id)) {
        return prev.filter(i => i.alatId !== a.id)
      }
      return [...prev, { alatId: a.id, jumlah: 1 }]
    })
  }

  function updateItemQty(alatId: string, jumlah: number) {
    const qty = Math.max(1, Math.floor(jumlah || 1))
    setSelectedItems(prev => prev.map(item => item.alatId === alatId ? { ...item, jumlah: qty } : item))
  }

  function removeItem(alatId: string) {
    setSelectedItems(prev => prev.filter(item => item.alatId !== alatId))
  }

  function handleSubmitKeluar(e: React.FormEvent) {
    e.preventDefault()
    setErrorKeluar('')
    if (selectedItems.length === 0) {
      setErrorKeluar('Pilih minimal satu alat untuk dipinjam.')
      return
    }
    try {
      const { peminjam, instansi, keperluan, tanggalKeluar, tanggalKembaliRencana, petugasKeluar, catatan } = formKeluar
      onKeluarBatch({ peminjam, instansi, keperluan, tanggalKeluar, tanggalKembaliRencana, petugasKeluar, catatan }, selectedItems)
      setFormKeluar(emptyKeluar())
      setSelectedItems([])
      setShowPilihAlat(false)
      setSearchAlat('')
      setSuccessKeluar(true)
      setTimeout(() => setSuccessKeluar(false), 3000)
    } catch (error) {
      setErrorKeluar(error instanceof Error ? error.message : 'Gagal menyimpan transaksi keluar.')
    }
  }

  function toggleTrx(trxId: string) {
    setSelectedTrxIds(prev => prev.includes(trxId) ? prev.filter(id => id !== trxId) : [...prev, trxId])
  }

  function handleSubmitKembali(e: React.FormEvent) {
    e.preventDefault()
    if (selectedTrxIds.length === 0) return
    onKembaliBatch(selectedTrxIds, petugasKembali, catatanKembali)
    setSelectedTrxIds([])
    setPetugasKembali('')
    setCatatanKembali('')
    setSearchTrx('')
    setSuccessKembali(true)
    setTimeout(() => setSuccessKembali(false), 3000)
  }

  const selectedDetail = selectedItems
    .map(item => {
      const found = alat.find(a => a.id === item.alatId)
      return found ? { alat: found, jumlah: item.jumlah } : null
    })
    .filter((value): value is { alat: Alat; jumlah: number } => Boolean(value))
  const totalItemDipinjam = selectedDetail.reduce((sum, item) => sum + item.jumlah, 0)
  const isTerlambat = (t: Transaksi) => new Date(t.tanggalKembaliRencana) < new Date()
  const selectedTrxList = trxAktif.filter(t => selectedTrxIds.includes(t.id))
  const totalKembaliUnit = selectedTrxList.reduce((sum, t) => sum + t.jumlah, 0)

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
                {selectedDetail.length > 0 ? (
                  <div>
                    <span className="font-medium text-gray-800">{selectedDetail.length} alat dipilih</span>
                    <span className="text-gray-400 ml-2 text-xs">{totalItemDipinjam} unit total</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Klik untuk pilih alat...</span>
                )}
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-emerald-600 mt-1">Pilih banyak item sekaligus, lalu atur jumlah per item.</p>
            </div>

            {selectedDetail.length > 0 && (
              <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                <p className="text-xs font-medium text-gray-600">Daftar item dipinjam</p>
                {selectedDetail.map(({ alat: itemAlat, jumlah }) => (
                  <div key={itemAlat.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{itemAlat.nama}</p>
                      <p className="text-xs text-gray-500">{itemAlat.kode} · Tersedia {itemAlat.jumlahTersedia}</p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={itemAlat.jumlahTersedia}
                      value={jumlah}
                      onChange={e => updateItemQty(itemAlat.id, Math.min(+e.target.value || 1, itemAlat.jumlahTersedia))}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(itemAlat.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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
            {errorKeluar && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {errorKeluar}
              </div>
            )}

            <button type="submit" disabled={selectedItems.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Catat Alat Keluar (Multi Item)
            </button>
          </form>
        </div>
      )}

      {/* === FORM KEMBALI === */}
      {tab === 'kembali' && (
        <div className="space-y-4">
          {/* Cari transaksi aktif */}
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
                      onClick={() => toggleTrx(t.id)}
                      className={`p-4 rounded-xl border cursor-pointer hover:border-emerald-400 transition-colors ${
                        selectedTrxIds.includes(t.id)
                          ? 'border-emerald-300 bg-emerald-50'
                          : isTerlambat(t) ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
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
                          {selectedTrxIds.includes(t.id) && (
                            <div className="text-xs text-emerald-700 mt-1">Terpilih</div>
                          )}
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

          {/* Form Konfirmasi Kembali */}
          {selectedTrxIds.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                  Konfirmasi Pengembalian
                </h3>
                <button onClick={() => setSelectedTrxIds([])} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Detail Transaksi */}
              <div className="p-4 rounded-xl mb-5 bg-gray-50 border border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Jumlah Transaksi</p>
                    <p className="font-semibold text-gray-800">{selectedTrxList.length} transaksi</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Unit</p>
                    <p className="font-semibold text-gray-800">{totalKembaliUnit} unit</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Peminjam</p>
                    <p className="font-medium text-gray-700">{selectedTrxList[0]?.peminjam || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Terlambat</p>
                    <p className="font-medium text-gray-700">{selectedTrxList.filter(isTerlambat).length} transaksi</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedTrxList.map(t => (
                    <div key={t.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t.namaAlat}</p>
                        <p className="text-xs text-gray-500">{t.kodeAlat}</p>
                      </div>
                      <span className="text-xs font-medium text-indigo-700">{t.jumlah} unit</span>
                    </div>
                  ))}
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
                <button type="submit" disabled={selectedTrxIds.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Alat Kembali ({selectedTrxIds.length})
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Modal Pilih Alat */}
      {showPilihAlat && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPilihAlat(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
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
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left ${
                      selectedItems.some(item => item.alatId === a.id) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-indigo-50'
                    }`}>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{a.nama}</p>
                      <p className="text-xs text-gray-500">{a.kode} · {a.kategori} · {a.merek}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        {a.jumlahTersedia} unit
                      </span>
                      {selectedItems.some(item => item.alatId === a.id) && (
                        <p className="text-[11px] text-indigo-600 mt-1">Terpilih</p>
                      )}
                    </div>
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
