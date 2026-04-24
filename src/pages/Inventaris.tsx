import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, X, CheckCircle2, Package } from 'lucide-react'
import { KATEGORI_ALAT, KONDISI_ALAT, STATUS_ALAT, type Alat, type KategoriAlat, type StatusAlat } from '../types'

const statusColor: Record<StatusAlat, string> = {
  Tersedia: 'bg-emerald-100 text-emerald-700',
  Dipinjam: 'bg-amber-100 text-amber-700',
  Rusak: 'bg-red-100 text-red-700',
  Maintenance: 'bg-orange-100 text-orange-700',
}

const kondisiColor: Record<Alat['kondisi'], string> = {
  Baik: 'bg-emerald-100 text-emerald-700',
  'Perlu Perbaikan': 'bg-amber-100 text-amber-700',
  'Rusak Ringan': 'bg-red-100 text-red-700',
  'Rusak Berat': 'bg-red-200 text-red-800',
}

interface InventarisProps {
  alat: Alat[]
  onTambah: (data: Omit<Alat, 'id' | 'createdAt'>) => void
  onUpdate: (id: string, data: Partial<Alat>) => void
  onHapus: (id: string) => void
}

const emptyForm = (): Omit<Alat, 'id' | 'createdAt'> => ({
  nama: '', kode: '', kategori: 'Mixer', merek: '', jumlah: 1, jumlahTersedia: 1, status: 'Tersedia', kondisi: 'Baik', keterangan: ''
})

export default function Inventaris({ alat, onTambah, onUpdate, onHapus }: InventarisProps) {
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState<KategoriAlat | 'Semua'>('Semua')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [confirmHapus, setConfirmHapus] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const filtered = alat.filter(a => {
    const matchSearch = a.nama.toLowerCase().includes(search.toLowerCase()) || a.kode.toLowerCase().includes(search.toLowerCase())
    const matchKategori = filterKategori === 'Semua' || a.kategori === filterKategori
    return matchSearch && matchKategori
  })

  function openTambah() {
    setEditId(null)
    setForm(emptyForm())
    setErrorMsg('')
    setShowModal(true)
  }

  function openEdit(a: Alat) {
    setEditId(a.id)
    setForm({ nama: a.nama, kode: a.kode, kategori: a.kategori, merek: a.merek, jumlah: a.jumlah, jumlahTersedia: a.jumlahTersedia, status: a.status, kondisi: a.kondisi, keterangan: a.keterangan || '' })
    setErrorMsg('')
    setShowModal(true)
  }

  const normalizedKode = form.kode.trim().toUpperCase()
  const duplicateKode = alat.some(a => a.id !== editId && a.kode.toUpperCase() === normalizedKode)
  const invalidJumlah = !Number.isFinite(form.jumlah) || form.jumlah < 1
  const invalidJumlahTersedia = !Number.isFinite(form.jumlahTersedia) || form.jumlahTersedia < 0 || form.jumlahTersedia > form.jumlah
  const requiredMissing = !form.nama.trim() || !form.kode.trim() || !form.merek.trim()
  const formInvalid = duplicateKode || invalidJumlah || invalidJumlahTersedia || requiredMissing

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    if (formInvalid) {
      setErrorMsg('Periksa kembali form: pastikan data wajib terisi, kode unik, dan jumlah valid.')
      return
    }
    try {
      if (editId) {
        onUpdate(editId, form)
      } else {
        onTambah(form)
      }
      setShowModal(false)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Gagal menyimpan data alat.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventaris Alat</h2>
          <p className="text-gray-500 text-sm mt-1">{alat.length} jenis alat terdaftar</p>
        </div>
        <button
          onClick={openTambah}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Alat
        </button>
      </div>
      {errorMsg && !showModal && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {errorMsg}
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau kode alat..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <select
          value={filterKategori}
          onChange={e => setFilterKategori(e.target.value as KategoriAlat | 'Semua')}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="Semua">Semua Kategori</option>
          {KATEGORI_ALAT.map(k => <option key={k}>{k}</option>)}
        </select>
      </div>

      {/* Table / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Tidak ada alat ditemukan</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 w-12">No</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Kode</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Nama Alat</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Kategori</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Kondisi</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Tersedia</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((a, idx) => (
                  <tr
                    key={a.id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-indigo-50/60 transition-colors`}
                  >
                    <td className="px-4 py-3 text-center text-xs font-semibold text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold">{a.kode}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{a.nama}</p>
                      <p className="text-xs text-gray-400">{a.merek}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{a.kategori}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${kondisiColor[a.kondisi]}`}>
                        {a.kondisi}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">{a.jumlah}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${a.jumlahTersedia === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {a.jumlahTersedia}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(a)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmHapus(a.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{editId ? 'Edit Alat' : 'Tambah Alat Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nama Alat *</label>
                  <input required value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kode Alat *</label>
                  <input required value={form.kode} onChange={e => setForm(f => ({ ...f, kode: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
                  <select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value as KategoriAlat }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {KATEGORI_ALAT.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Merek</label>
                  <input value={form.merek} onChange={e => setForm(f => ({ ...f, merek: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Total</label>
                  <input type="number" min={1} value={form.jumlah} onChange={e => setForm(f => ({ ...f, jumlah: +e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {invalidJumlah && <p className="text-xs text-red-600 mt-1">Jumlah total minimal 1.</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Tersedia</label>
                  <input type="number" min={0} max={form.jumlah} value={form.jumlahTersedia} onChange={e => setForm(f => ({ ...f, jumlahTersedia: +e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {invalidJumlahTersedia && <p className="text-xs text-red-600 mt-1">Jumlah tersedia harus 0 sampai jumlah total.</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as StatusAlat }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {STATUS_ALAT.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kondisi</label>
                  <select value={form.kondisi} onChange={e => setForm(f => ({ ...f, kondisi: e.target.value as Alat['kondisi'] }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {KONDISI_ALAT.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Keterangan</label>
                <textarea rows={2} value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              {duplicateKode && (
                <p className="text-xs text-red-600 -mt-2">Kode alat sudah digunakan oleh data lain.</p>
              )}
              {errorMsg && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {errorMsg}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={formInvalid}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-500 text-white rounded-xl py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {editId ? 'Simpan Perubahan' : 'Tambah Alat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Hapus */}
      {confirmHapus && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 p-2 rounded-xl">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Hapus Alat?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">Data alat dan riwayatnya akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmHapus(null)} className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50">
                Batal
              </button>
              <button onClick={() => {
                try {
                  onHapus(confirmHapus)
                  setConfirmHapus(null)
                } catch (error) {
                  setConfirmHapus(null)
                  setErrorMsg(error instanceof Error ? error.message : 'Gagal menghapus alat.')
                }
              }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
