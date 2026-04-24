import { Music4, LayoutDashboard, Package, ArrowRightLeft, ClipboardList } from 'lucide-react'

type Page = 'dashboard' | 'inventaris' | 'transaksi' | 'riwayat'

interface NavbarProps {
  active: Page
  onNavigate: (page: Page) => void
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventaris' as Page, label: 'Inventaris', icon: Package },
  { id: 'transaksi' as Page, label: 'Alat Keluar', icon: ArrowRightLeft },
  { id: 'riwayat' as Page, label: 'Riwayat', icon: ClipboardList },
]

export default function Navbar({ active, onNavigate }: NavbarProps) {
  return (
    <header className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl">
              <Music4 className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Sound System PSBK</h1>
              <p className="text-xs text-indigo-300 leading-tight">Padepokan Seni Bagong Kusudiardja</p>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active === id
                    ? 'bg-white text-indigo-900'
                    : 'text-indigo-100 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Mobile bottom nav */}
      <nav className="sm:hidden flex border-t border-indigo-700">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-all ${
              active === id ? 'text-white bg-white/10' : 'text-indigo-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}
