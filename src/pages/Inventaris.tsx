import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, X, CheckCircle2, Package } from 'lucide-react'
import type { Alat, KategoriAlat, StatusAlat } from '../types'

const KATEGORI: KategoriAlat[] = ['Mixer', 'Amplifier', 'Speaker', 'Microphone', 'Kabel', 'Efek', 'Lainnya']
const STATUS_LIST: StatusAlat[] = ['Tersedia', 'Dipinjam', 'Rusak', 'Maintenance']

const statusColor: Record<StatusAlat, string> = {
  Tersedia: 'bg-emerald-100 text-emerald-700',
  Dipinjam: 'bg-amber-100 text-amber-700',
  Rusak: 'bg-red-100 text-red-700',
  Maintenance: 'bg-orange-100 text-orange-700',
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

  const filtered = alat.filter(a => {
    const matchSearch = a.nama.toLowerCase().includes(search.toLowerCase()) || a.kode.toLowerCase().includes(search.toLowerCase())
    const matchKategori = filterKategori === 'Semua' || a.kategori === filterKategori
    return matchSearch && matchKategori
  })

  function openTambah() {
    setEditId(null)
    setForm(emptyForm())
    setShowModal(true)
  }

  function openEdit(a: Alat) {
    setEditId(a.id)
    setForm({ nama: a.nama, kode: a.kode, kategori: a.kategori, merek: a.merek, jumlah: a.jumlah, jumlahTersedia: a.jumlahTersedia, status: a.status, kondisi: a.kondisi, keterangan: a.keterangan || '' })
    setShowModal(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) {
      onUpdate(editId, form)
    } else {
      onTambah(form)
    }
    setShowModal(false)
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
          {KATEGORI.map(k => <option key={k}>{k}</option>)}
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
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Kode</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Nama Alat</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Kategori</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Tersedia</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold">{a.kode}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{a.nama}</p>
                      <p className="text-xs text-gray-400">{a.merek} · {a.kondisi}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{a.kategori}</td>
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
                    {KATEGORI.map(k => <option key={k}>{k}</option>)}
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
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Tersedia</label>
                  <input type="number" min={0} max={form.jumlah} value={form.jumlahTersedia} onChange={e => setForm(f => ({ ...f, jumlahTersedia: +e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as StatusAlat }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kondisi</label>
                  <input value={form.kondisi} onChange={e => setForm(f => ({ ...f, kondisi: e.target.value }))}
                    placeholder="Baik / Perlu perbaikan"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Keterangan</label>
                <textarea rows={2} value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2">
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
              <button onClick={() => { onHapus(confirmHapus); setConfirmHapus(null) }}
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
