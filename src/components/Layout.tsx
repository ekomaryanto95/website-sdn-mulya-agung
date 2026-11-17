import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Menu,
  X,
  Search,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Lock,
  Bell,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type {
  PageRoute,
  Pengumuman,
  SekolahProfile,
  VisitorStats,
} from '../types/school.ts';
import { SchoolEmblem } from './SchoolLogo.tsx';
import { buildWhatsappUrl, formatAngka } from '../utils/format.ts';

interface LayoutProps {
  activeRoute: PageRoute;
  onNavigate: (route: PageRoute, query?: string) => void;
  sekolah: SekolahProfile;
  pengumumanPenting?: Pengumuman;
  pengunjung: VisitorStats;
  isAdminLoggedIn: boolean;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeRoute,
  onNavigate,
  sekolah,
  pengumumanPenting,
  pengunjung,
  isAdminLoggedIn,
  children,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifBar, setShowNotifBar] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGo = (route: PageRoute) => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setShowSearchModal(false);
    setMobileMenuOpen(false);
    onNavigate('pencarian', searchInput.trim());
  };

  const profilLinks: { label: string; route: PageRoute }[] = [
    { label: 'Profil Sekolah', route: 'profil' },
    { label: 'Visi & Misi', route: 'visi-misi' },
    { label: 'Kepala Sekolah & Guru', route: 'guru' },
    { label: 'Kurikulum', route: 'kurikulum' },
    { label: 'Data Siswa (Admin)', route: 'siswa' },
  ];

  const akademikLinks: { label: string; route: PageRoute }[] = [
    { label: 'Prestasi', route: 'prestasi' },
    { label: 'Ekstrakurikuler', route: 'ekstrakurikuler' },
    { label: 'Galeri', route: 'galeri' },
    { label: 'Kalender Kegiatan', route: 'agenda' },
  ];

  const informasiLinks: { label: string; route: PageRoute }[] = [
    { label: 'Berita & Kegiatan', route: 'berita' },
    { label: 'Pengumuman', route: 'pengumuman' },
    { label: 'Download Dokumen', route: 'download' },
    { label: 'Pencarian Konten', route: 'pencarian' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Notifikasi Pengumuman Penting (opsional dapat ditutup) */}
      {showNotifBar && pengumumanPenting && activeRoute !== 'admin' && (
        <div className="bg-blue-950 text-white text-xs py-2 px-4 border-b border-blue-900">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleGo('pengumuman')}
              className="flex items-center gap-2 text-left hover:text-amber-300 transition-colors truncate"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-amber-300 shrink-0">Pengumuman:</span>
              <span className="truncate">{pengumumanPenting.judul}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
            </button>
            <button
              type="button"
              onClick={() => setShowNotifBar(false)}
              aria-label="Tutup notifikasi pengumuman"
              className="p-1 text-blue-200 hover:text-white shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header 3-Zone Contract */}
      <header
        ref={navRef}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Logo & Wordmark */}
          <button
            type="button"
            onClick={() => handleGo('beranda')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-700 rounded-md"
          >
            <SchoolEmblem className="w-8 h-8 shrink-0" />
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              SDN Mulya Agung
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700"
          >
            <button
              type="button"
              onClick={() => handleGo('beranda')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeRoute === 'beranda'
                  ? 'border-blue-700 text-blue-800 font-semibold'
                  : 'border-transparent hover:text-blue-700'
              }`}
            >
              Beranda
            </button>

            {/* Dropdown Profil */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'profil' ? null : 'profil')
                }
                className={`flex items-center gap-1 py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                  ['profil', 'visi-misi', 'guru', 'kurikulum', 'siswa'].includes(activeRoute)
                    ? 'border-blue-700 text-blue-800 font-semibold'
                    : 'border-transparent hover:text-blue-700'
                }`}
              >
                <span>Profil</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openDropdown === 'profil' && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                  {profilLinks.map((item) => (
                    <button
                      key={item.route}
                      type="button"
                      onClick={() => handleGo(item.route)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                        activeRoute === item.route
                          ? 'bg-blue-50 text-blue-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.route === 'siswa' && (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown Kesiswaan & Akademik */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'akademik' ? null : 'akademik')
                }
                className={`flex items-center gap-1 py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                  ['prestasi', 'ekstrakurikuler', 'galeri', 'agenda'].includes(activeRoute)
                    ? 'border-blue-700 text-blue-800 font-semibold'
                    : 'border-transparent hover:text-blue-700'
                }`}
              >
                <span>Kesiswaan</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openDropdown === 'akademik' && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                  {akademikLinks.map((item) => (
                    <button
                      key={item.route}
                      type="button"
                      onClick={() => handleGo(item.route)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        activeRoute === item.route
                          ? 'bg-blue-50 text-blue-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown Informasi */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'informasi' ? null : 'informasi')
                }
                className={`flex items-center gap-1 py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                  ['berita', 'pengumuman', 'download', 'pencarian'].includes(activeRoute)
                    ? 'border-blue-700 text-blue-800 font-semibold'
                    : 'border-transparent hover:text-blue-700'
                }`}
              >
                <span>Berita & Info</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openDropdown === 'informasi' && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                  {informasiLinks.map((item) => (
                    <button
                      key={item.route}
                      type="button"
                      onClick={() => handleGo(item.route)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        activeRoute === item.route
                          ? 'bg-blue-50 text-blue-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleGo('kontak')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeRoute === 'kontak'
                  ? 'border-blue-700 text-blue-800 font-semibold'
                  : 'border-transparent hover:text-blue-700'
              }`}
            >
              Kontak
            </button>
          </nav>

          {/* Zone 3: 1 Primary CTA (plus mobile toggle on small viewports) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleGo('ppdb')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              PPDB Online
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Buka menu navigasi"
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white max-h-[80vh] overflow-y-auto px-4 py-4 space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari berita, guru, pengumuman..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
              >
                Cari
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: 'Beranda', route: 'beranda' as PageRoute },
                { label: 'Profil Sekolah', route: 'profil' as PageRoute },
                { label: 'Visi & Misi', route: 'visi-misi' as PageRoute },
                { label: 'Kepala Sekolah & Guru', route: 'guru' as PageRoute },
                { label: 'Data Siswa', route: 'siswa' as PageRoute },
                { label: 'Kurikulum', route: 'kurikulum' as PageRoute },
                { label: 'Berita & Kegiatan', route: 'berita' as PageRoute },
                { label: 'Prestasi', route: 'prestasi' as PageRoute },
                { label: 'Ekstrakurikuler', route: 'ekstrakurikuler' as PageRoute },
                { label: 'Galeri', route: 'galeri' as PageRoute },
                { label: 'Pengumuman', route: 'pengumuman' as PageRoute },
                { label: 'Download', route: 'download' as PageRoute },
                { label: 'Kalender Kegiatan', route: 'agenda' as PageRoute },
                { label: 'PPDB Online', route: 'ppdb' as PageRoute },
                { label: 'Kontak', route: 'kontak' as PageRoute },
                {
                  label: isAdminLoggedIn ? 'Dashboard Admin' : 'Login Admin',
                  route: 'admin' as PageRoute,
                },
              ].map((item) => (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleGo(item.route)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-sm font-medium ${
                    activeRoute === item.route
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Global Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-24 px-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Pencarian Website SDN Mulya Agung
              </h3>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ketik kata kunci: PPDB, Pramuka, OSN, Guru..."
                className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg"
              >
                Cari
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      {activeRoute !== 'admin' && (
        <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* Identitas Sekolah */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <SchoolEmblem className="w-9 h-9 shrink-0" />
                  <div>
                    <p className="font-display text-base font-bold text-white tracking-wide">
                      SDN MULYA AGUNG
                    </p>
                    <p className="text-xs text-slate-400">NPSN: {sekolah.npsn} · Akreditasi {sekolah.akreditasi}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {sekolah.kecamatan}, {sekolah.kabupaten}, {sekolah.provinsi}. Mewujudkan peserta didik yang berkarakter, berprestasi, mandiri, dan berwawasan lingkungan.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSearchModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Pencarian</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGo('admin')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isAdminLoggedIn ? 'Dashboard Admin' : 'Login Admin'}</span>
                  </button>
                </div>
              </div>

              {/* Navigasi Cepat 1 */}
              <div>
                <h4 className="font-display text-sm font-semibold text-white mb-4">
                  Navigasi Sekolah
                </h4>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: 'Beranda', route: 'beranda' as PageRoute },
                    { label: 'Profil Sekolah', route: 'profil' as PageRoute },
                    { label: 'Visi & Misi', route: 'visi-misi' as PageRoute },
                    { label: 'Kepala Sekolah & Guru', route: 'guru' as PageRoute },
                    { label: 'Kurikulum', route: 'kurikulum' as PageRoute },
                    { label: 'Data Siswa (Admin)', route: 'siswa' as PageRoute },
                    { label: 'PPDB Online', route: 'ppdb' as PageRoute },
                  ].map((item) => (
                    <li key={item.route}>
                      <button
                        type="button"
                        onClick={() => handleGo(item.route)}
                        className="hover:text-white transition-colors text-left"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Navigasi Cepat 2 */}
              <div>
                <h4 className="font-display text-sm font-semibold text-white mb-4">
                  Layanan & Kesiswaan
                </h4>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: 'Berita & Kegiatan', route: 'berita' as PageRoute },
                    { label: 'Prestasi Siswa', route: 'prestasi' as PageRoute },
                    { label: 'Ekstrakurikuler', route: 'ekstrakurikuler' as PageRoute },
                    { label: 'Galeri Foto & Video', route: 'galeri' as PageRoute },
                    { label: 'Pengumuman Sekolah', route: 'pengumuman' as PageRoute },
                    { label: 'Pusat Download', route: 'download' as PageRoute },
                    { label: 'Kalender Kegiatan', route: 'agenda' as PageRoute },
                  ].map((item) => (
                    <li key={item.route}>
                      <button
                        type="button"
                        onClick={() => handleGo(item.route)}
                        className="hover:text-white transition-colors text-left"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kontak Sekolah & Statistik Pengunjung */}
              <div className="space-y-4">
                <h4 className="font-display text-sm font-semibold text-white">
                  Kontak Sekolah
                </h4>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      {sekolah.alamat}, {sekolah.kecamatan}, {sekolah.kabupaten},{' '}
                      {sekolah.provinsi} {sekolah.kodePos}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                    <a
                      href={`mailto:${sekolah.email}`}
                      className="hover:text-white transition-colors"
                    >
                      {sekolah.email}
                    </a>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                    <a
                      href={buildWhatsappUrl(
                        sekolah.whatsapp,
                        'Halo Admin SDN Mulya Agung, saya ingin bertanya mengenai informasi sekolah.'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors tabular-nums"
                    >
                      WhatsApp: +{sekolah.whatsapp}
                    </a>
                  </li>
                </ul>

                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-400 mb-2">Media Sosial Resmi</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <a
                      href={sekolah.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      <span>Instagram</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={sekolah.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      <span>Facebook</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={sekolah.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 tabular-nums">
                  <span>Kunjungan Hari Ini: {formatAngka(pengunjung.kunjunganHariIni)}</span>
                  <span>Total: {formatAngka(pengunjung.totalKunjungan)}</span>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <p>
                © {new Date().getFullYear()} SDN Mulya Agung · Kecamatan Lalan, Kabupaten Musi Banyuasin, Sumatera Selatan. Hak Cipta Dilindungi.
              </p>
              <button
                type="button"
                onClick={() => handleGo('kontak')}
                className="hover:text-white transition-colors"
              >
                Hubungi Sekolah & Peta Lokasi
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Floating WhatsApp Quick Button */}
      {activeRoute !== 'admin' && (
        <a
          href={buildWhatsappUrl(
            sekolah.whatsapp,
            'Assalamu’alaikum Admin SDN Mulya Agung, saya ingin menanyakan informasi sekolah / PPDB.'
          )}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hubungi WhatsApp SDN Mulya Agung"
          className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Chat WhatsApp</span>
        </a>
      )}
    </div>
  );
};
