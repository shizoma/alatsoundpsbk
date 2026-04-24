import { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Inventaris from './pages/Inventaris'
import TransaksiPage from './pages/Transaksi'
import Riwayat from './pages/Riwayat'
import { useStore } from './store/useStore'

type Page = 'dashboard' | 'inventaris' | 'transaksi' | 'riwayat'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const { alat, transaksi, tambahAlat, updateAlat, hapusAlat, keluarkanAlat, kembalikanAlat } = useStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active={page} onNavigate={setPage} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6">
        {page === 'dashboard' && (
          <Dashboard alat={alat} transaksi={transaksi} onNavigate={setPage} />
        )}
        {page === 'inventaris' && (
          <Inventaris alat={alat} onTambah={tambahAlat} onUpdate={updateAlat} onHapus={hapusAlat} />
        )}
        {page === 'transaksi' && (
          <TransaksiPage alat={alat} transaksi={transaksi} onKeluar={keluarkanAlat} onKembali={kembalikanAlat} />
        )}
        {page === 'riwayat' && (
          <Riwayat transaksi={transaksi} />
        )}
      </main>
    </div>
  )
}
