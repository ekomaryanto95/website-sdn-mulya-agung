import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  Database,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Image,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  Newspaper,
  Plus,
  RefreshCw,
  Save,
  School,
  Search,
  Shield,
  Trash2,
  Trophy,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  downloadTemplateDapodikXlsx,
  exportSiswaDapodikXlsx,
  parseDapodikExcelFile,
  type DapodikParseResult,
} from '../utils/dapodikExcel.ts';
import type {
  AdminUser,
  AgendaItem,
  Berita,
  BeritaKategori,
  DokumenItem,
  DokumenKategori,
  Ekstrakurikuler,
  GaleriItem,
  GaleriKategori,
  Guru,
  Kelas,
  PageRoute,
  Pengumuman,
  PesanKontak,
  PpdbPendaftar,
  Prestasi,
  SekolahProfile,
  Siswa,
  VisitorStats,
} from '../types/school.ts';
import { formatAngka, formatTanggalIndonesia } from '../utils/format.ts';

type AdminTab =
  | 'ringkasan'
  | 'profil'
  | 'guru'
  | 'siswa'
  | 'berita'
  | 'pengumuman'
  | 'prestasi'
  | 'ekstrakurikuler'
  | 'galeri'
  | 'dokumen'
  | 'ppdb'
  | 'agenda'
  | 'pesan'
  | 'backup';

interface AdminOverviewData {
  sekolah: SekolahProfile;
  guru: Guru[];
  kelas: Kelas[];
  siswa: Siswa[];
  berita: Berita[];
  pengumuman: Pengumuman[];
  prestasi: Prestasi[];
  ekstrakurikuler: Ekstrakurikuler[];
  galeri: GaleriItem[];
  dokumen: DokumenItem[];
  ppdb: PpdbPendaftar[];
  agenda: AgendaItem[];
  pesanKontak: PesanKontak[];
  pengunjung: VisitorStats;
}

interface AdminDashboardProps {
  token: string | null;
  adminUser: AdminUser | null;
  onLoginSuccess: (token: string, user: AdminUser) => void;
  onLogout: () => void;
  onDataChanged: () => void;
  onNavigate: (route: PageRoute) => void;
}

const IMAGE_PRESETS = [
  { label: 'Foto Gedung & Upacara Sekolah', url: '/src/assets/images/hero_sdn_mulya_agung_1794929626952.jpg' },
  { label: 'Foto Kepala Sekolah', url: '/src/assets/images/kepala_sekolah_portrait_1794929628049.jpg' },
  { label: 'Pembelajaran Kelas SD', url: '/src/assets/images/pembelajaran_kelas_sd_1794929628086.jpg' },
  { label: 'Kegiatan Pramuka', url: '/src/assets/images/pramuka_ekskul_sd_1794929628284.jpg' },
  { label: 'Prestasi & Piala Lomba', url: '/src/assets/images/prestasi_lomba_sd_1794929627712.jpg' },
  { label: 'Seni Tari & Pencak Silat', url: '/src/assets/images/seni_silat_sd_1794929628136.jpg' },
  { label: 'Taman Baca & Lingkungan Hijau', url: '/src/assets/images/lingkungan_sekolah_asri_1794929629703.jpg' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  adminUser,
  onLoginSuccess,
  onLogout,
  onDataChanged,
  onNavigate,
}) => {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('ringkasan');
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string>('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      if (res.ok) {
        setOverview(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    if (token) {
      fetchOverview();
    }
  }, [token, fetchOverview]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const json = await res.json();
      if (!res.ok) {
        setLoginError(json.error || 'Login gagal.');
      } else {
        onLoginSuccess(json.token, json.user);
      }
    } catch {
      setLoginError('Gagal menghubungi server.');
    } finally {
      setLoggingIn(false);
    }
  };

  // --- LOGIN VIEW ---
  if (!token || !adminUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Login Administrator Sekolah
            </h1>
            <p className="text-sm text-slate-600">
              Masuk untuk mengelola profil SDN Mulya Agung, data guru, data siswa, berita, galeri, pengumuman, dan PPDB.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg px-4 py-3">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username atau Email Admin
              </label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              {loggingIn ? 'Memverifikasi...' : 'Masuk ke Dashboard Admin'}
            </button>
          </form>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Akun Administrator Bawaan:</p>
            <p>
              Username: <span className="font-mono font-semibold text-slate-900">admin</span>
            </p>
            <p>
              Kata Sandi:{' '}
              <span className="font-mono font-semibold text-slate-900">MulyaAgung2026!</span>
            </p>
            <button
              type="button"
              onClick={() =>
                setLoginForm({ username: 'admin', password: 'MulyaAgung2026!' })
              }
              className="mt-1.5 text-blue-700 font-semibold hover:underline"
            >
              Isi otomatis kredensial admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const refreshAll = async () => {
    await fetchOverview();
    onDataChanged();
  };

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'ringkasan', label: 'Ringkasan & Pengunjung', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'profil', label: 'Profil & Visi Misi', icon: <School className="w-4 h-4" /> },
    { id: 'guru', label: 'Kepala Sekolah & Guru', icon: <Users className="w-4 h-4" /> },
    { id: 'siswa', label: 'Data Siswa (Privat)', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'berita', label: 'Berita & Kegiatan', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'pengumuman', label: 'Pengumuman', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'prestasi', label: 'Prestasi', icon: <Trophy className="w-4 h-4" /> },
    { id: 'ekstrakurikuler', label: 'Ekstrakurikuler', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'galeri', label: 'Galeri Foto & Video', icon: <Image className="w-4 h-4" /> },
    { id: 'dokumen', label: 'Dokumen Download', icon: <FileText className="w-4 h-4" /> },
    { id: 'ppdb', label: 'Pendaftar PPDB', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'agenda', label: 'Kalender Kegiatan', icon: <Calendar className="w-4 h-4" /> },
    { id: 'pesan', label: 'Pesan Kontak', icon: <Mail className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup & Keamanan', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Admin Header Strip */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-blue-700">Portal Administrator SDN Mulya Agung</p>
            <h1 className="font-display text-xl font-bold text-slate-900">
              Selamat datang, {adminUser.namaLengkap}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('beranda')}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Lihat Website Publik
            </button>
            <button
              type="button"
              onClick={refreshAll}
              className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              title="Muat ulang data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </aside>

          {/* Main Admin Workspace */}
          <div className="lg:col-span-9 space-y-6">
            {!overview ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
                Memuat data administrator...
              </div>
            ) : (
              <>
                {activeTab === 'ringkasan' && (
                  <AdminOverviewPanel
                    overview={overview}
                    onSelectTab={setActiveTab}
                  />
                )}
                {activeTab === 'profil' && (
                  <AdminProfilPanel
                    token={token}
                    sekolah={overview.sekolah}
                    onSaved={() => {
                      showToast('Profil sekolah berhasil diperbarui.');
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'guru' && (
                  <AdminGuruPanel
                    token={token}
                    guru={overview.guru}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'siswa' && (
                  <AdminSiswaPanel
                    token={token}
                    siswa={overview.siswa}
                    kelas={overview.kelas}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'berita' && (
                  <AdminBeritaPanel
                    token={token}
                    berita={overview.berita}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'pengumuman' && (
                  <AdminPengumumanPanel
                    token={token}
                    pengumuman={overview.pengumuman}
                    dokumen={overview.dokumen}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'prestasi' && (
                  <AdminPrestasiPanel
                    token={token}
                    prestasi={overview.prestasi}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'ekstrakurikuler' && (
                  <AdminEkskulPanel
                    token={token}
                    ekskul={overview.ekstrakurikuler}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'galeri' && (
                  <AdminGaleriPanel
                    token={token}
                    galeri={overview.galeri}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'dokumen' && (
                  <AdminDokumenPanel
                    token={token}
                    dokumen={overview.dokumen}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'ppdb' && (
                  <AdminPpdbPanel
                    token={token}
                    ppdb={overview.ppdb}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'agenda' && (
                  <AdminAgendaPanel
                    token={token}
                    agenda={overview.agenda}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'pesan' && (
                  <AdminPesanPanel
                    token={token}
                    pesan={overview.pesanKontak}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
                {activeTab === 'backup' && (
                  <AdminBackupPanel
                    token={token}
                    onSaved={(msg) => {
                      showToast(msg);
                      refreshAll();
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-PANELS ---

const AdminOverviewPanel: React.FC<{
  overview: AdminOverviewData;
  onSelectTab: (tab: AdminTab) => void;
}> = ({ overview, onSelectTab }) => {
  const maxVisit = Math.max(...overview.pengunjung.harian.map((h) => h.jumlah), 1);
  const unreadPesan = overview.pesanKontak.filter((p) => !p.statusDibaca).length;
  const pendingPpdb = overview.ppdb.filter(
    (p) => p.statusVerifikasi === 'Menunggu Verifikasi'
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Siswa Terdata</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {formatAngka(overview.siswa.length)}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Guru & Staf</p>
          <p className="font-display text-2xl font-bold text-blue-700 mt-1 tabular-nums">
            {formatAngka(overview.guru.length)}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Pendaftar PPDB</p>
          <p className="font-display text-2xl font-bold text-amber-700 mt-1 tabular-nums">
            {formatAngka(overview.ppdb.length)}
          </p>
          <p className="text-[11px] text-slate-500">{pendingPpdb} perlu verifikasi</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Pengunjung</p>
          <p className="font-display text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
            {formatAngka(overview.pengunjung.totalKunjungan)}
          </p>
          <p className="text-[11px] text-slate-500">
            Hari ini: {formatAngka(overview.pengunjung.kunjunganHariIni)}
          </p>
        </div>
      </div>

      {/* Grafik Pengunjung 7 Hari */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Statistik Pengunjung Website (7 Hari Terakhir)
            </h2>
            <p className="text-xs text-slate-500">
              Pemantauan trafik kunjungan publik secara langsung dari server
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
            Hari ini: {overview.pengunjung.kunjunganHariIni} kunjungan
          </span>
        </div>
        <div className="grid grid-cols-7 gap-3 items-end h-40 pt-4">
          {overview.pengunjung.harian.slice(-7).map((h) => {
            const pct = Math.max(12, Math.round((h.jumlah / maxVisit) * 100));
            return (
              <div key={h.tanggal} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="font-mono text-[11px] text-slate-600 tabular-nums">
                  {h.jumlah}
                </span>
                <div
                  style={{ height: `${pct}%` }}
                  className="w-full max-w-[42px] bg-blue-700 rounded-t-md transition-all"
                />
                <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                  {h.tanggal.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aksi Cepat */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900">Aksi Cepat Pengelolaan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <button
            type="button"
            onClick={() => onSelectTab('siswa')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 text-left space-y-1"
          >
            <p className="font-semibold text-slate-900">Kelola Data Siswa</p>
            <p className="text-xs text-slate-500">Tambah, edit NIS/NISN, kelas & wali murid</p>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('ppdb')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 text-left space-y-1"
          >
            <p className="font-semibold text-slate-900">Verifikasi PPDB ({pendingPpdb})</p>
            <p className="text-xs text-slate-500">Konfirmasi penerimaan calon siswa baru</p>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('pesan')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 text-left space-y-1"
          >
            <p className="font-semibold text-slate-900">Pesan Kontak ({unreadPesan} baru)</p>
            <p className="text-xs text-slate-500">Baca pertanyaan masyarakat & orang tua</p>
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminProfilPanel: React.FC<{
  token: string;
  sekolah: SekolahProfile;
  onSaved: () => void;
}> = ({ token, sekolah, onSaved }) => {
  const [form, setForm] = useState<SekolahProfile>(sekolah);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/sekolah', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Edit Profil Sekolah, Sambutan & Visi Misi
        </h2>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Sekolah</label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">NPSN</label>
          <input
            type="text"
            value={form.npsn}
            onChange={(e) => setForm({ ...form, npsn: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Kepala Sekolah</label>
          <input
            type="text"
            value={form.kepalaSekolahNama}
            onChange={(e) => setForm({ ...form, kepalaSekolahNama: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Akreditasi</label>
          <input
            type="text"
            value={form.akreditasi}
            onChange={(e) => setForm({ ...form, akreditasi: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor WhatsApp (628...)</label>
          <input
            type="text"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Sekolah</label>
          <input
            type="text"
            value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Visi Sekolah</label>
          <textarea
            rows={2}
            value={form.visi}
            onChange={(e) => setForm({ ...form, visi: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Misi Sekolah (1 baris per poin)
          </label>
          <textarea
            rows={4}
            value={form.misi.join('\n')}
            onChange={(e) =>
              setForm({
                ...form,
                misi: e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Sambutan Kepala Sekolah
          </label>
          <textarea
            rows={4}
            value={form.sambutanKepalaSekolah}
            onChange={(e) => setForm({ ...form, sambutanKepalaSekolah: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Sejarah Sekolah
          </label>
          <textarea
            rows={3}
            value={form.sejarah}
            onChange={(e) => setForm({ ...form, sejarah: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3 pt-1">
          <input
            id="ppdbOpenCheck"
            type="checkbox"
            checked={form.ppdbStatusBuka}
            onChange={(e) => setForm({ ...form, ppdbStatusBuka: e.target.checked })}
            className="w-4 h-4 accent-blue-700"
          />
          <label htmlFor="ppdbOpenCheck" className="text-sm font-medium text-slate-800">
            Status Pendaftaran PPDB Online Dibuka ({form.ppdbTahunAjaran})
          </label>
        </div>
      </div>
    </form>
  );
};

async function uploadImageFile(token: string, file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });

  const res = await fetch('/api/admin/upload-foto', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename: file.name,
      dataUrl,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Gagal mengunggah foto.');
  }
  return String(json.url);
}

const AdminGuruPanel: React.FC<{
  token: string;
  guru: Guru[];
  onSaved: (msg: string) => void;
}> = ({ token, guru, onSaved }) => {
  const emptyForm = {
    id: 0,
    nama: '',
    jabatan: '',
    kategori: 'Guru Kelas' as Guru['kategori'],
    mataPelajaran: '',
    nipNuptk: '',
    statusKepegawaian: 'PNS' as NonNullable<Guru['statusKepegawaian']>,
    pendidikan: 'S1 PGSD',
    jenisKelamin: 'Laki-laki' as NonNullable<Guru['jenisKelamin']>,
    tempatLahir: 'Musi Banyuasin',
    tanggalLahir: '',
    noTelepon: '',
    email: '',
    alamat: 'Desa Mulya Agung, Kec. Lalan',
    urutan: guru.length + 1,
    foto: IMAGE_PRESETS[2].url,
  };
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [uploadingRowId, setUploadingRowId] = useState<number | null>(null);
  const [uploadingForm, setUploadingForm] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFormFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploadingForm(true);
    try {
      const url = await uploadImageFile(token, file);
      setForm((prev) => ({ ...prev, foto: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Gagal mengunggah foto.');
    } finally {
      setUploadingForm(false);
      e.target.value = '';
    }
  };

  const handleRowPhotoUpload = async (
    g: Guru,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploadingRowId(g.id);
    try {
      const uploadedUrl = await uploadImageFile(token, file);
      const res = await fetch(`/api/admin/guru/${g.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ foto: uploadedUrl }),
      });
      if (!res.ok) {
        throw new Error('Gagal menyimpan foto ke profil guru.');
      }
      if (editing && form.id === g.id) {
        setForm((prev) => ({ ...prev, foto: uploadedUrl }));
      }
      onSaved(`Foto ${g.nama} berhasil diunggah & diperbarui.`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Gagal mengunggah foto.');
    } finally {
      setUploadingRowId(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    const url = editing ? `/api/admin/guru/${form.id}` : '/api/admin/guru';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ ...emptyForm, urutan: guru.length + 2 });
      setEditing(false);
      onSaved(
        editing
          ? 'Data lengkap guru/kepala sekolah diperbarui.'
          : 'Guru/pegawai baru berhasil ditambahkan.'
      );
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/guru/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Data guru dihapus.');
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <h2 className="font-display text-lg font-bold text-slate-900">
            {editing
              ? 'Edit Data Lengkap Kepala Sekolah / Guru / Staf'
              : 'Tambah Kepala Sekolah / Guru / Tenaga Kependidikan'}
          </h2>
          <span className="text-xs text-slate-500">
            Lengkapi biodata dan unggah foto resmi
          </span>
        </div>

        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg px-3.5 py-2.5">
            {uploadError}
          </div>
        )}

        {/* Foto Preview + Upload di Form */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
            <img
              src={form.foto}
              alt={form.nama || 'Pratinjau foto'}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold text-slate-800">
              Foto Profil (JPG, PNG, WEBP · Maks. 5 MB)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingForm ? 'Mengunggah...' : 'Upload Foto dari Perangkat'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFormFileChange}
                  disabled={uploadingForm}
                  className="hidden"
                />
              </label>
              <select
                value={
                  IMAGE_PRESETS.some((p) => p.url === form.foto) ? form.foto : ''
                }
                onChange={(e) => {
                  if (e.target.value) setForm({ ...form, foto: e.target.value });
                }}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Atau pilih foto bawaan...</option>
                {IMAGE_PRESETS.map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd."
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jabatan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Guru Kelas II A"
              value={form.jabatan}
              onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori *
            </label>
            <select
              value={form.kategori}
              onChange={(e) =>
                setForm({ ...form, kategori: e.target.value as Guru['kategori'] })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Kepala Sekolah">Kepala Sekolah</option>
              <option value="Guru Kelas">Guru Kelas</option>
              <option value="Guru Mata Pelajaran">Guru Mata Pelajaran</option>
              <option value="Tenaga Kependidikan">Tenaga Kependidikan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mata Pelajaran / Bidang Tugas *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Tematik / PJOK / Tata Usaha"
              value={form.mataPelajaran}
              onChange={(e) => setForm({ ...form, mataPelajaran: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIP / NUPTK
            </label>
            <input
              type="text"
              placeholder="NIP. ... / NUPTK. ..."
              value={form.nipNuptk}
              onChange={(e) => setForm({ ...form, nipNuptk: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Kepegawaian
            </label>
            <select
              value={form.statusKepegawaian}
              onChange={(e) =>
                setForm({
                  ...form,
                  statusKepegawaian: e.target.value as NonNullable<
                    Guru['statusKepegawaian']
                  >,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="PNS">PNS</option>
              <option value="PPPK">PPPK</option>
              <option value="Guru Honorer">Guru Honorer</option>
              <option value="Tenaga Honorer">Tenaga Honorer</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pendidikan Terakhir
            </label>
            <input
              type="text"
              placeholder="Contoh: S1 PGSD"
              value={form.pendidikan}
              onChange={(e) => setForm({ ...form, pendidikan: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Kelamin
            </label>
            <select
              value={form.jenisKelamin}
              onChange={(e) =>
                setForm({
                  ...form,
                  jenisKelamin: e.target.value as NonNullable<Guru['jenisKelamin']>,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tempat Lahir
            </label>
            <input
              type="text"
              placeholder="Contoh: Musi Banyuasin"
              value={form.tempatLahir}
              onChange={(e) => setForm({ ...form, tempatLahir: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={form.tanggalLahir}
              onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              No. HP / WhatsApp
            </label>
            <input
              type="tel"
              placeholder="0812..."
              value={form.noTelepon}
              onChange={(e) => setForm({ ...form, noTelepon: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Sekolah / Pribadi
            </label>
            <input
              type="email"
              placeholder="nama@sdnmulyaagung.sch.id"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Tempat Tinggal
            </label>
            <input
              type="text"
              placeholder="Dusun, Desa Mulya Agung, Kec. Lalan"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Urutan Tampil
            </label>
            <input
              type="number"
              min={1}
              value={form.urutan}
              onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
          >
            <Plus className="w-4 h-4" />
            <span>{editing ? 'Simpan Perubahan Data' : 'Tambah Data Guru'}</span>
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setEditing(false);
              }}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
            >
              Batal Edit
            </button>
          )}
        </div>
      </form>

      {/* Tabel Data Lengkap + Tombol Upload Foto di masing-masing nama */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Daftar Kepala Sekolah, Guru & Tenaga Kependidikan ({guru.length})
            </h3>
            <p className="text-xs text-slate-500">
              Gunakan tombol “Upload Foto” pada masing-masing nama untuk memperbarui foto profil secara langsung.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Foto & Nama Lengkap</th>
                <th className="py-3 px-4 font-semibold">Jabatan & Mapel</th>
                <th className="py-3 px-4 font-semibold">NIP/NUPTK & Status</th>
                <th className="py-3 px-4 font-semibold">Biodata & Kontak</th>
                <th className="py-3 px-4 font-semibold text-right">Upload Foto & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {guru.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50 align-top">
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={g.foto}
                        alt={g.nama}
                        className="w-12 h-12 rounded-lg object-cover object-top border border-slate-200 bg-slate-100 shrink-0"
                      />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900 text-sm">{g.nama}</p>
                        <p className="text-blue-700 font-medium">{g.kategori}</p>
                        <p className="text-[11px] text-slate-500">
                          Pendidikan: {g.pendidikan}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 space-y-0.5">
                    <p className="font-medium text-slate-800">{g.jabatan}</p>
                    <p className="text-slate-500">{g.mataPelajaran}</p>
                  </td>
                  <td className="py-3.5 px-4 space-y-0.5">
                    <p className="font-mono text-slate-800 tabular-nums">{g.nipNuptk}</p>
                    <p className="font-semibold text-emerald-700">
                      {g.statusKepegawaian || 'PNS'}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 space-y-0.5 text-slate-600">
                    <p>
                      {g.jenisKelamin || '-'} · {g.tempatLahir || '-'}
                      {g.tanggalLahir && g.tanggalLahir !== '-'
                        ? `, ${g.tanggalLahir}`
                        : ''}
                    </p>
                    <p className="font-mono text-[11px] text-slate-700">
                      {g.noTelepon || '-'}
                      {g.email ? ` · ${g.email}` : ''}
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs">{g.alamat || '-'}</p>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <label
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                          uploadingRowId === g.id
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
                        }`}
                        title={`Upload foto untuk ${g.nama}`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {uploadingRowId === g.id ? 'Mengunggah...' : 'Upload Foto'}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          disabled={uploadingRowId === g.id}
                          onChange={(e) => handleRowPhotoUpload(g, e)}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            id: g.id,
                            nama: g.nama,
                            jabatan: g.jabatan,
                            kategori: g.kategori,
                            mataPelajaran: g.mataPelajaran,
                            nipNuptk: g.nipNuptk,
                            statusKepegawaian: g.statusKepegawaian || 'PNS',
                            pendidikan: g.pendidikan,
                            jenisKelamin: g.jenisKelamin || 'Laki-laki',
                            tempatLahir: g.tempatLahir || 'Musi Banyuasin',
                            tanggalLahir: g.tanggalLahir || '',
                            noTelepon: g.noTelepon || '',
                            email: g.email || '',
                            alamat: g.alamat || '',
                            urutan: g.urutan,
                            foto: g.foto,
                          });
                          setEditing(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"
                        title="Edit data lengkap"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(g.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
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
    </div>
  );
};

const AdminSiswaPanel: React.FC<{
  token: string;
  siswa: Siswa[];
  kelas: Kelas[];
  onSaved: (msg: string) => void;
}> = ({ token, siswa, kelas, onSaved }) => {
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('Semua');

  const createEmptyForm = () => ({
    id: 0,
    nama: '',
    nis: '',
    nisn: '',
    kelasId: kelas[0]?.id || 1,
    rombelDapodik: kelas[0]?.namaKelas || 'Kelas 1A',
    jenisKelamin: 'Laki-laki' as Siswa['jenisKelamin'],
    tempatLahir: 'Musi Banyuasin',
    tanggalLahir: '2016-05-01',
    nik: '',
    noKk: '',
    noAktaLahir: '',
    agama: 'Islam',
    kewarganegaraan: 'WNI',
    alamat: 'Desa Mulya Agung, Kec. Lalan',
    rt: '',
    rw: '',
    dusun: '',
    kelurahan: 'Mulya Agung',
    kecamatan: 'Kec. Lalan',
    kodePos: '30758',
    jenisTinggal: 'Bersama orang tua',
    alatTransportasi: 'Jalan kaki',
    noTelepon: '',
    email: '',
    penerimaKps: 'Tidak',
    noKps: '',
    penerimaKip: 'Tidak',
    noKip: '',
    namaDiKip: '',
    noKks: '',
    layakPip: 'Tidak',
    alasanLayakPip: '',
    kebutuhanKhusus: 'Tidak ada',
    sekolahAsal: '',
    anakKe: '',
    jumlahSaudara: '',
    beratBadan: '',
    tinggiBadan: '',
    lingkarKepala: '',
    jarakSekolahKm: '',
    namaAyah: '',
    tahunLahirAyah: '',
    pendidikanAyah: '',
    pekerjaanAyah: '',
    penghasilanAyah: '',
    nikAyah: '',
    namaIbu: '',
    tahunLahirIbu: '',
    pendidikanIbu: '',
    pekerjaanIbu: '',
    penghasilanIbu: '',
    nikIbu: '',
    namaWali: '',
    tahunLahirWali: '',
    pendidikanWali: '',
    pekerjaanWali: '',
    penghasilanWali: '',
    nikWali: '',
    namaOrangTua: '',
    noHpOrangTua: '',
    statusSiswa: 'Aktif' as Siswa['statusSiswa'],
  });

  const [form, setForm] = useState(createEmptyForm);
  const [editing, setEditing] = useState(false);
  const [showDapodikFields, setShowDapodikFields] = useState(false);
  const [detailSiswa, setDetailSiswa] = useState<Siswa | null>(null);

  // Dapodik Excel Import states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<DapodikParseResult | null>(null);
  const [parsingExcel, setParsingExcel] = useState(false);
  const [importingExcel, setImportingExcel] = useState(false);
  const [importMode, setImportMode] = useState<'upsert' | 'append_only' | 'replace'>('upsert');
  const [importError, setImportError] = useState('');

  const kelasMap = new Map(kelas.map((k) => [k.id, k.namaKelas]));

  const filtered = siswa.filter((s) => {
    const matchKelas =
      filterKelas === 'Semua' || String(s.kelasId) === filterKelas;
    const q = search.toLowerCase().trim();
    const matchQ =
      !q ||
      s.nama.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      s.nisn.toLowerCase().includes(q) ||
      (s.nik || '').toLowerCase().includes(q) ||
      (s.namaAyah || '').toLowerCase().includes(q) ||
      (s.namaIbu || '').toLowerCase().includes(q);
    return matchKelas && matchQ;
  });

  const handleSelectDapodikFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setParsingExcel(true);
    try {
      const parsed = await parseDapodikExcelFile(file, kelas);
      setUploadedFile(file);
      setParseResult(parsed);
    } catch (err) {
      setParseResult(null);
      setUploadedFile(null);
      setImportError(
        err instanceof Error
          ? err.message
          : 'Gagal membaca file Excel Dapodik. Pastikan format file valid (.xlsx/.xls).'
      );
    } finally {
      setParsingExcel(false);
      e.target.value = '';
    }
  };

  const handleChangeSheet = async (sheetName: string) => {
    if (!uploadedFile) return;
    setImportError('');
    setParsingExcel(true);
    try {
      const parsed = await parseDapodikExcelFile(uploadedFile, kelas, sheetName);
      setParseResult(parsed);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Gagal membaca sheet Excel.'
      );
    } finally {
      setParsingExcel(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.rows.length === 0) return;
    setImportError('');
    setImportingExcel(true);
    try {
      const res = await fetch('/api/admin/siswa/import-dapodik', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode: importMode,
          rows: parseResult.rows,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setImportError(json.error || 'Gagal mengimpor data Dapodik.');
        return;
      }
      setParseResult(null);
      setUploadedFile(null);
      onSaved(
        `Impor Dapodik selesai: ${json.importedCount} baru, ${json.updatedCount} diperbarui${
          json.createdClassesCount > 0 ? `, ${json.createdClassesCount} kelas baru dibuat` : ''
        }.`
      );
    } catch {
      setImportError('Terjadi gangguan koneksi saat menyimpan hasil impor Dapodik.');
    } finally {
      setImportingExcel(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/admin/siswa/${form.id}` : '/api/admin/siswa';
    const method = editing ? 'PUT' : 'POST';
    const payload = {
      ...form,
      namaOrangTua:
        form.namaOrangTua || form.namaIbu || form.namaAyah || form.namaWali || '-',
    };
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setForm(createEmptyForm());
      setEditing(false);
      onSaved(editing ? 'Data lengkap siswa diperbarui.' : 'Siswa baru berhasil ditambahkan.');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/siswa/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Data siswa dihapus.');
  };

  return (
    <div className="space-y-6">
      {/* Impor Excel Data Lengkap Download dari Dapodik */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-700">
              <FileSpreadsheet className="w-5 h-5" />
              <h2 className="font-display text-lg font-bold text-slate-900">
                Impor Excel Data Lengkap Siswa dari Dapodik
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl">
              Unggah langsung file Excel <span className="font-semibold">Daftar Peserta Didik (.xlsx / .xls / .csv)</span> hasil unduhan dari aplikasi Dapodik. Sistem otomatis mengenali header bertingkat Dapodik (Identitas, NIK, No. KK, Alamat RT/RW, KIP/PIP, Data Ayah, Data Ibu, Data Wali, & Rombel Saat Ini).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>{parsingExcel ? 'Membaca Excel...' : 'Pilih File Excel Dapodik'}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleSelectDapodikFile}
                disabled={parsingExcel}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={downloadTemplateDapodikXlsx}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              <Download className="w-4 h-4 text-blue-700" />
              <span>Template Dapodik (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => exportSiswaDapodikXlsx(siswa, kelas)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export Excel ({siswa.length})</span>
            </button>
          </div>
        </div>

        {importError && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg px-4 py-3">
            {importError}
          </div>
        )}

        {parseResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  Pratinjau File: {uploadedFile?.name}
                </p>
                <p className="text-xs text-slate-600">
                  Terdeteksi <span className="font-semibold text-emerald-700">{parseResult.rows.length} siswa</span> ·{' '}
                  Header di baris ke-{parseResult.detectedHeaderRow} ·{' '}
                  <span className="font-semibold">{parseResult.mappedColumns.length} kolom Dapodik</span> terbaca
                  {parseResult.skippedRows > 0 ? ` · ${parseResult.skippedRows} baris kosong/judul dilewati` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {parseResult.sheetNames.length > 1 && (
                  <select
                    value={parseResult.selectedSheet}
                    onChange={(e) => handleChangeSheet(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {parseResult.sheetNames.map((sn) => (
                      <option key={sn} value={sn}>
                        Sheet: {sn}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  value={importMode}
                  onChange={(e) =>
                    setImportMode(e.target.value as 'upsert' | 'append_only' | 'replace')
                  }
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="upsert">Mode: Perbarui NISN/NIS yang ada & Tambah Baru</option>
                  <option value="append_only">Mode: Hanya Tambah Siswa Baru (Lewati Duplikat)</option>
                  <option value="replace">Mode: Ganti Seluruh Data Siswa dengan File Ini</option>
                </select>
              </div>
            </div>

            {parseResult.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg px-3.5 py-2.5 space-y-1">
                {parseResult.warnings.map((w, i) => (
                  <p key={i}>• {w}</p>
                ))}
              </div>
            )}

            <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg max-h-72">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 sticky top-0">
                  <tr>
                    <th className="py-2 px-3 font-semibold">No</th>
                    <th className="py-2 px-3 font-semibold">Nama Lengkap & Agama</th>
                    <th className="py-2 px-3 font-semibold">NIPD / NISN / NIK</th>
                    <th className="py-2 px-3 font-semibold">Rombel</th>
                    <th className="py-2 px-3 font-semibold">JK · TTL</th>
                    <th className="py-2 px-3 font-semibold">Alamat Domisili</th>
                    <th className="py-2 px-3 font-semibold">Data Ayah & Ibu</th>
                    <th className="py-2 px-3 font-semibold">KIP / Asal Sekolah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {parseResult.rows.slice(0, 30).map((r, idx) => (
                    <tr key={`${r.nisn}-${r.nis}-${idx}`} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <p className="font-semibold text-slate-900">{r.nama}</p>
                        <p className="text-slate-500">{r.agama || 'Islam'}</p>
                      </td>
                      <td className="py-2 px-3 font-mono tabular-nums">
                        <p>NIPD: {r.nis}</p>
                        <p>NISN: {r.nisn}</p>
                        {r.nik && <p className="text-slate-500">NIK: {r.nik}</p>}
                      </td>
                      <td className="py-2 px-3 font-semibold text-blue-700">
                        {r.rombelDapodik}
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        <p>{r.jenisKelamin}</p>
                        <p className="text-slate-500">
                          {r.tempatLahir}, {r.tanggalLahir}
                        </p>
                      </td>
                      <td className="py-2 px-3 text-slate-600 max-w-[200px]">
                        <p className="line-clamp-2">{r.alamat}</p>
                        {r.noHpOrangTua !== '-' && (
                          <p className="font-mono text-slate-700">{r.noHpOrangTua}</p>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        <p>Ayah: {r.namaAyah || '-'}</p>
                        <p>Ibu: {r.namaIbu || '-'}</p>
                        {r.namaWali && <p className="text-slate-500">Wali: {r.namaWali}</p>}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        <p>KIP: {r.penerimaKip || '-'}</p>
                        <p className="text-slate-500">{r.sekolahAsal || '-'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parseResult.rows.length > 30 && (
              <p className="text-[11px] text-slate-500">
                Menampilkan 30 siswa pertama dari total {parseResult.rows.length} siswa siap diimpor.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setParseResult(null);
                  setUploadedFile(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal Pratinjau
              </button>
              <button
                type="button"
                disabled={importingExcel || parseResult.rows.length === 0}
                onClick={handleConfirmImport}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-xs font-semibold"
              >
                <Check className="w-4 h-4" />
                <span>
                  {importingExcel
                    ? 'Mengimpor ke Database...'
                    : `Konfirmasi & Impor ${parseResult.rows.length} Siswa Dapodik`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Tambah / Edit Biodata Siswa Lengkap */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-slate-900">
            {editing ? 'Edit Biodata Lengkap Siswa' : 'Tambah Siswa Baru (Data Terproteksi Admin)'}
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDapodikFields((v) => !v)}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              {showDapodikFields
                ? 'Sembunyikan Kolom Tambahan Dapodik'
                : 'Tampilkan Semua Kolom Lengkap Dapodik (NIK, KK, Ayah/Ibu, KIP)'}
            </button>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tidak tampil publik</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Siswa *
            </label>
            <input
              type="text"
              required
              placeholder="Nama Lengkap Siswa"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIS / NIPD *
            </label>
            <input
              type="text"
              required
              placeholder="NIS / NIPD"
              value={form.nis}
              onChange={(e) => setForm({ ...form, nis: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NISN *
            </label>
            <input
              type="text"
              required
              placeholder="NISN"
              value={form.nisn}
              onChange={(e) => setForm({ ...form, nisn: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kelas / Rombel
            </label>
            <select
              value={form.kelasId}
              onChange={(e) => {
                const nextId = Number(e.target.value);
                setForm({
                  ...form,
                  kelasId: nextId,
                  rombelDapodik: kelasMap.get(nextId) || form.rombelDapodik,
                });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Kelamin
            </label>
            <select
              value={form.jenisKelamin}
              onChange={(e) =>
                setForm({
                  ...form,
                  jenisKelamin: e.target.value as Siswa['jenisKelamin'],
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Siswa
            </label>
            <select
              value={form.statusSiswa}
              onChange={(e) =>
                setForm({
                  ...form,
                  statusSiswa: e.target.value as Siswa['statusSiswa'],
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Aktif">Status: Aktif</option>
              <option value="Lulus">Status: Lulus</option>
              <option value="Pindah">Status: Pindah</option>
              <option value="Cuti">Status: Cuti</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tempat Lahir
            </label>
            <input
              type="text"
              placeholder="Tempat Lahir"
              value={form.tempatLahir}
              onChange={(e) => setForm({ ...form, tempatLahir: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={form.tanggalLahir}
              onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap
            </label>
            <input
              type="text"
              placeholder="Alamat Lengkap"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Orang Tua / Wali *
            </label>
            <input
              type="text"
              required
              placeholder="Nama Orang Tua / Wali"
              value={form.namaOrangTua}
              onChange={(e) => setForm({ ...form, namaOrangTua: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              No. HP Orang Tua / Wali
            </label>
            <input
              type="text"
              placeholder="No. HP Orang Tua / Wali"
              value={form.noHpOrangTua}
              onChange={(e) => setForm({ ...form, noHpOrangTua: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIK Siswa
            </label>
            <input
              type="text"
              placeholder="16 digit NIK"
              value={form.nik}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>
        </div>

        {(showDapodikFields || editing) && (
          <div className="pt-3 border-t border-slate-200 space-y-4">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Data Lengkap Dapodik (Kependudukan, Orang Tua/Wali & KIP)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. KK</label>
                <input
                  type="text"
                  value={form.noKk}
                  onChange={(e) => setForm({ ...form, noKk: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Akta Lahir</label>
                <input
                  type="text"
                  value={form.noAktaLahir}
                  onChange={(e) => setForm({ ...form, noAktaLahir: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agama</label>
                <input
                  type="text"
                  value={form.agama}
                  onChange={(e) => setForm({ ...form, agama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sekolah Asal (TK/PAUD)</label>
                <input
                  type="text"
                  value={form.sekolahAsal}
                  onChange={(e) => setForm({ ...form, sekolahAsal: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dusun / RT / RW</label>
                <input
                  type="text"
                  placeholder="Dusun"
                  value={form.dusun}
                  onChange={(e) => setForm({ ...form, dusun: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Tinggal</label>
                <input
                  type="text"
                  value={form.jenisTinggal}
                  onChange={(e) => setForm({ ...form, jenisTinggal: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transportasi</label>
                <input
                  type="text"
                  value={form.alatTransportasi}
                  onChange={(e) => setForm({ ...form, alatTransportasi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Penerima KIP</label>
                <select
                  value={form.penerimaKip}
                  onChange={(e) => setForm({ ...form, penerimaKip: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Tidak">Tidak</option>
                  <option value="Ya">Ya</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ayah</label>
                <input
                  type="text"
                  value={form.namaAyah}
                  onChange={(e) => setForm({ ...form, namaAyah: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pekerjaan Ayah</label>
                <input
                  type="text"
                  value={form.pekerjaanAyah}
                  onChange={(e) => setForm({ ...form, pekerjaanAyah: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ibu Kandung</label>
                <input
                  type="text"
                  value={form.namaIbu}
                  onChange={(e) => setForm({ ...form, namaIbu: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pekerjaan Ibu</label>
                <input
                  type="text"
                  value={form.pekerjaanIbu}
                  onChange={(e) => setForm({ ...form, pekerjaanIbu: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
          >
            <Plus className="w-4 h-4" />
            <span>{editing ? 'Simpan Biodata Siswa' : 'Tambah Siswa'}</span>
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setForm(createEmptyForm());
                setEditing(false);
              }}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Filter & Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NIS, NISN, NIK, atau orang tua..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
          </div>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="Semua">Semua Kelas ({siswa.length} siswa)</option>
            {kelas.map((k) => (
              <option key={k.id} value={String(k.id)}>
                {k.namaKelas}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Siswa</th>
                <th className="py-3 px-4 font-semibold">NIS / NISN / NIK</th>
                <th className="py-3 px-4 font-semibold">Kelas</th>
                <th className="py-3 px-4 font-semibold">L/P · TTL · Agama</th>
                <th className="py-3 px-4 font-semibold">Orang Tua (Ayah / Ibu)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div>{s.nama}</div>
                    <div className="font-normal text-[11px] text-slate-500 max-w-xs">
                      {s.alamat}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    <div>NIS: {s.nis}</div>
                    <div className="text-slate-600">NISN: {s.nisn}</div>
                    {s.nik && <div className="text-[11px] text-slate-500">NIK: {s.nik}</div>}
                  </td>
                  <td className="py-3 px-4 font-medium text-blue-700">
                    {kelasMap.get(s.kelasId) || s.rombelDapodik || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>
                      {s.jenisKelamin} · {s.agama || 'Islam'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {s.tempatLahir}, {s.tanggalLahir}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>
                      {s.namaAyah || s.namaIbu
                        ? `${s.namaAyah || '-'} / ${s.namaIbu || '-'}`
                        : s.namaOrangTua}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">{s.noHpOrangTua}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-emerald-700">{s.statusSiswa}</div>
                    {s.penerimaKip === 'Ya' && (
                      <div className="text-[11px] font-semibold text-blue-700">Penerima KIP</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setDetailSiswa(s)}
                      className="p-1.5 text-slate-700 hover:bg-slate-100 rounded"
                      title="Lihat Detail Lengkap Dapodik"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...createEmptyForm(), ...s });
                        setEditing(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"
                      title="Edit Biodata Siswa"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Lengkap Dapodik */}
      {detailSiswa && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold text-blue-700">
                  Data Lengkap Peserta Didik (Format Dapodik)
                </p>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {detailSiswa.nama}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  NIS/NIPD: {detailSiswa.nis} · NISN: {detailSiswa.nisn} · Kelas:{' '}
                  {kelasMap.get(detailSiswa.kelasId) || detailSiswa.rombelDapodik || '-'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailSiswa(null)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <p className="font-bold text-slate-900 mb-2">1. Identitas & Kependudukan</p>
                <p>NIK: <span className="font-mono">{detailSiswa.nik || '-'}</span></p>
                <p>No. KK: <span className="font-mono">{detailSiswa.noKk || '-'}</span></p>
                <p>No. Akta Lahir: <span className="font-mono">{detailSiswa.noAktaLahir || '-'}</span></p>
                <p>Jenis Kelamin: {detailSiswa.jenisKelamin}</p>
                <p>TTL: {detailSiswa.tempatLahir}, {detailSiswa.tanggalLahir}</p>
                <p>Agama: {detailSiswa.agama || 'Islam'}</p>
                <p>Kewarganegaraan: {detailSiswa.kewarganegaraan || 'WNI'}</p>
                <p>Kebutuhan Khusus: {detailSiswa.kebutuhanKhusus || 'Tidak ada'}</p>
                <p>Sekolah Asal: {detailSiswa.sekolahAsal || '-'}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <p className="font-bold text-slate-900 mb-2">2. Alamat, Kontak & Kesejahteraan</p>
                <p>Alamat: {detailSiswa.alamat}</p>
                <p>RT/RW: {detailSiswa.rt || '-'} / {detailSiswa.rw || '-'}</p>
                <p>Dusun/Kel/Kec: {detailSiswa.dusun || '-'} · {detailSiswa.kelurahan || '-'} · {detailSiswa.kecamatan || '-'}</p>
                <p>Kode Pos: {detailSiswa.kodePos || '-'}</p>
                <p>Jenis Tinggal: {detailSiswa.jenisTinggal || '-'}</p>
                <p>Transportasi: {detailSiswa.alatTransportasi || '-'}</p>
                <p>No. HP/WA: <span className="font-mono">{detailSiswa.noHpOrangTua}</span></p>
                <p>Penerima KIP / No. KIP: {detailSiswa.penerimaKip || 'Tidak'} {detailSiswa.noKip ? `(${detailSiswa.noKip})` : ''}</p>
                <p>Layak PIP / KPS: {detailSiswa.layakPip || 'Tidak'} / {detailSiswa.penerimaKps || 'Tidak'}</p>
                <p>BB / TB / Jarak: {detailSiswa.beratBadan || '-'} kg / {detailSiswa.tinggiBadan || '-'} cm / {detailSiswa.jarakSekolahKm || '-'} km</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <p className="font-bold text-slate-900 mb-2">3. Data Ayah Kandung</p>
                <p>Nama Ayah: {detailSiswa.namaAyah || detailSiswa.namaOrangTua || '-'}</p>
                <p>NIK Ayah: <span className="font-mono">{detailSiswa.nikAyah || '-'}</span></p>
                <p>Tahun Lahir: {detailSiswa.tahunLahirAyah || '-'}</p>
                <p>Pendidikan: {detailSiswa.pendidikanAyah || '-'}</p>
                <p>Pekerjaan: {detailSiswa.pekerjaanAyah || '-'}</p>
                <p>Penghasilan: {detailSiswa.penghasilanAyah || '-'}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <p className="font-bold text-slate-900 mb-2">4. Data Ibu Kandung & Wali</p>
                <p>Nama Ibu: {detailSiswa.namaIbu || '-'}</p>
                <p>NIK Ibu: <span className="font-mono">{detailSiswa.nikIbu || '-'}</span></p>
                <p>Tahun Lahir: {detailSiswa.tahunLahirIbu || '-'}</p>
                <p>Pendidikan / Pekerjaan: {detailSiswa.pendidikanIbu || '-'} / {detailSiswa.pekerjaanIbu || '-'}</p>
                <p>Penghasilan Ibu: {detailSiswa.penghasilanIbu || '-'}</p>
                {detailSiswa.namaWali && (
                  <p className="pt-1 border-t border-slate-200">
                    Wali: {detailSiswa.namaWali} ({detailSiswa.pekerjaanWali || '-'})
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminBeritaPanel: React.FC<{
  token: string;
  berita: Berita[];
  onSaved: (msg: string) => void;
}> = ({ token, berita, onSaved }) => {
  const emptyForm = {
    id: 0,
    judul: '',
    kategori: 'Kegiatan Sekolah' as BeritaKategori,
    foto: IMAGE_PRESETS[0].url,
    ringkasan: '',
    isi: '',
    penulis: 'Humas SDN Mulya Agung',
    tanggal: new Date().toISOString().slice(0, 10),
  };
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/admin/berita/${form.id}` : '/api/admin/berita';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(emptyForm);
      setEditing(false);
      onSaved(editing ? 'Berita berhasil diperbarui.' : 'Berita baru diterbitkan.');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/berita/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Berita dihapus.');
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <h2 className="font-display text-lg font-bold text-slate-900">
          {editing ? 'Edit Artikel Berita' : 'Tulis Berita & Kegiatan Baru'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <input
            type="text"
            required
            placeholder="Judul Berita"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
          />
          <select
            value={form.kategori}
            onChange={(e) =>
              setForm({ ...form, kategori: e.target.value as BeritaKategori })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            {[
              'Kegiatan Sekolah',
              'Prestasi',
              'Pengumuman',
              'Pramuka',
              'Olahraga',
              'Seni',
              'Pendidikan',
              'Kegiatan Guru',
            ].map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            value={form.foto}
            onChange={(e) => setForm({ ...form, foto: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            {IMAGE_PRESETS.map((p) => (
              <option key={p.url} value={p.url}>
                Foto: {p.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Penulis"
            value={form.penulis}
            onChange={(e) => setForm({ ...form, penulis: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="date"
            value={form.tanggal}
            onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <textarea
            rows={2}
            required
            placeholder="Ringkasan singkat berita"
            value={form.ringkasan}
            onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
            className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
          />
          <textarea
            rows={4}
            required
            placeholder="Isi lengkap berita..."
            value={form.isi}
            onChange={(e) => setForm({ ...form, isi: e.target.value })}
            className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
          >
            {editing ? 'Simpan Perubahan' : 'Terbitkan Berita'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setEditing(false);
              }}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
        {berita.map((b) => (
          <div key={b.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-blue-700 font-semibold">
                {b.kategori} · {formatTanggalIndonesia(b.tanggal)}
              </p>
              <p className="font-display font-bold text-sm text-slate-900 truncate">{b.judul}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    id: b.id,
                    judul: b.judul,
                    kategori: b.kategori,
                    foto: b.foto,
                    ringkasan: b.ringkasan,
                    isi: b.isi,
                    penulis: b.penulis,
                    tanggal: b.tanggal,
                  });
                  setEditing(true);
                }}
                className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(b.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminPengumumanPanel: React.FC<{
  token: string;
  pengumuman: Pengumuman[];
  dokumen: DokumenItem[];
  onSaved: (msg: string) => void;
}> = ({ token, pengumuman, dokumen, onSaved }) => {
  const [form, setForm] = useState({
    judul: '',
    kategori: 'Akademik',
    prioritas: 'Penting' as 'Penting' | 'Reguler',
    tanggal: new Date().toISOString().slice(0, 10),
    isi: '',
    fileLampiranDokumenId: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const doc = dokumen.find((d) => String(d.id) === form.fileLampiranDokumenId);
    const res = await fetch('/api/admin/pengumuman', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        fileLampiranNama: doc ? doc.judul : '',
        fileLampiranDokumenId: doc ? doc.id : null,
      }),
    });
    if (res.ok) {
      setForm({
        judul: '',
        kategori: 'Akademik',
        prioritas: 'Penting',
        tanggal: new Date().toISOString().slice(0, 10),
        isi: '',
        fileLampiranDokumenId: '',
      });
      onSaved('Pengumuman baru diterbitkan.');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/pengumuman/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Pengumuman dihapus.');
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-sm"
      >
        <h2 className="font-display text-lg font-bold text-slate-900">Buat Pengumuman Sekolah</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            placeholder="Judul Pengumuman"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            className="sm:col-span-3 px-3 py-2 border border-slate-300 rounded-lg"
          />
          <select
            value={form.prioritas}
            onChange={(e) =>
              setForm({ ...form, prioritas: e.target.value as 'Penting' | 'Reguler' })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="Penting">Prioritas: Penting (Banner Atas)</option>
            <option value="Reguler">Prioritas: Reguler</option>
          </select>
          <input
            type="text"
            placeholder="Kategori"
            value={form.kategori}
            onChange={(e) => setForm({ ...form, kategori: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <select
            value={form.fileLampiranDokumenId}
            onChange={(e) => setForm({ ...form, fileLampiranDokumenId: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="">Tanpa Lampiran</option>
            {dokumen.map((d) => (
              <option key={d.id} value={String(d.id)}>
                Lampiran: {d.judul}
              </option>
            ))}
          </select>
          <textarea
            rows={3}
            required
            placeholder="Isi pengumuman..."
            value={form.isi}
            onChange={(e) => setForm({ ...form, isi: e.target.value })}
            className="sm:col-span-3 px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
        >
          Terbitkan Pengumuman
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
        {pengumuman.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-red-700">
                {p.prioritas} · {formatTanggalIndonesia(p.tanggal)}
              </p>
              <p className="font-display font-bold text-sm text-slate-900">{p.judul}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(p.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminPrestasiPanel: React.FC<{
  token: string;
  prestasi: Prestasi[];
  onSaved: (msg: string) => void;
}> = ({ token, prestasi, onSaved }) => {
  const [form, setForm] = useState({
    judul: '',
    tingkat: 'Kabupaten' as Prestasi['tingkat'],
    kategori: 'Akademik' as Prestasi['kategori'],
    peraih: '',
    pembina: '',
    tahun: '2026',
    peringkat: 'Juara 1',
    deskripsi: '',
    foto: IMAGE_PRESETS[4].url,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/prestasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({
        ...form,
        judul: '',
        peraih: '',
        pembina: '',
        deskripsi: '',
      });
      onSaved('Prestasi baru ditambahkan.');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/prestasi/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Prestasi dihapus.');
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-sm"
      >
        <h2 className="font-display text-lg font-bold text-slate-900">Tambah Catatan Prestasi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            placeholder="Judul Prestasi / Lomba"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            required
            placeholder="Peringkat (mis. Juara 1)"
            value={form.peringkat}
            onChange={(e) => setForm({ ...form, peringkat: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <select
            value={form.tingkat}
            onChange={(e) =>
              setForm({ ...form, tingkat: e.target.value as Prestasi['tingkat'] })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="Kecamatan">Tingkat Kecamatan</option>
            <option value="Kabupaten">Tingkat Kabupaten</option>
            <option value="Provinsi">Tingkat Provinsi</option>
            <option value="Nasional">Tingkat Nasional</option>
          </select>
          <input
            type="text"
            required
            placeholder="Nama Peraih (Siswa/Tim)"
            value={form.peraih}
            onChange={(e) => setForm({ ...form, peraih: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Tahun"
            value={form.tahun}
            onChange={(e) => setForm({ ...form, tahun: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg font-mono"
          />
          <textarea
            rows={2}
            placeholder="Deskripsi singkat prestasi..."
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            className="sm:col-span-3 px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
        >
          Simpan Prestasi
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
        {prestasi.map((pr) => (
          <div key={pr.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-amber-700">
                {pr.peringkat} · Tingkat {pr.tingkat} · {pr.tahun}
              </p>
              <p className="font-display font-bold text-sm text-slate-900">{pr.judul}</p>
              <p className="text-xs text-slate-500">Peraih: {pr.peraih}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(pr.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminEkskulPanel: React.FC<{
  token: string;
  ekskul: Ekstrakurikuler[];
  onSaved: (msg: string) => void;
}> = ({ token, ekskul, onSaved }) => {
  const [form, setForm] = useState({
    nama: '',
    kategori: 'Olahraga',
    jadwal: '',
    tempat: 'Lapangan Sekolah',
    pembina: '',
    deskripsi: '',
    foto: IMAGE_PRESETS[3].url,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/ekstrakurikuler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ ...form, nama: '', jadwal: '', pembina: '', deskripsi: '' });
      onSaved('Ekstrakurikuler baru ditambahkan.');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/ekstrakurikuler/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Ekstrakurikuler dihapus.');
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-sm"
      >
        <h2 className="font-display text-lg font-bold text-slate-900">
          Tambah Kegiatan Ekstrakurikuler
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            placeholder="Nama Ekstrakurikuler"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            required
            placeholder="Jadwal (mis. Sabtu 14.00 WIB)"
            value={form.jadwal}
            onChange={(e) => setForm({ ...form, jadwal: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            required
            placeholder="Nama Pembina"
            value={form.pembina}
            onChange={(e) => setForm({ ...form, pembina: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <select
            value={form.foto}
            onChange={(e) => setForm({ ...form, foto: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            {IMAGE_PRESETS.map((p) => (
              <option key={p.url} value={p.url}>
                Foto: {p.label}
              </option>
            ))}
          </select>
          <textarea
            rows={2}
            required
            placeholder="Deskripsi kegiatan..."
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
        >
          Tambah Ekstrakurikuler
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
        {ekskul.map((e) => (
          <div key={e.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-display font-bold text-sm text-slate-900">{e.nama}</p>
              <p className="text-xs text-slate-500">
                {e.jadwal} · Pembina: {e.pembina}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(e.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminGaleriPanel: React.FC<{
  token: string;
  galeri: GaleriItem[];
  onSaved: (msg: string) => void;
}> = ({ token, galeri, onSaved }) => {
  const [form, setForm] = useState({
    judul: '',
    tipe: 'foto' as 'foto' | 'video',
    kategori: 'Kegiatan Sekolah' as GaleriKategori,
    url: IMAGE_PRESETS[0].url,
    keterangan: '',
    tanggal: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/galeri', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ ...form, judul: '', keterangan: '' });
      onSaved('Item galeri ditambahkan.');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/galeri/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Item galeri dihapus.');
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-sm"
      >
        <h2 className="font-display text-lg font-bold text-slate-900">Tambah Foto / Video Galeri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            placeholder="Judul Dokumentasi"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <select
            value={form.kategori}
            onChange={(e) =>
              setForm({ ...form, kategori: e.target.value as GaleriKategori })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            {[
              'Kegiatan Pembelajaran',
              'Upacara',
              'Pramuka',
              'Olahraga',
              'Perlombaan',
              'Kegiatan Guru',
              'Kegiatan Sekolah',
              'Lingkungan Sekolah',
            ].map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            {IMAGE_PRESETS.map((p) => (
              <option key={p.url} value={p.url}>
                Gambar: {p.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Keterangan singkat"
            value={form.keterangan}
            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
        >
          Tambah ke Galeri
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {galeri.map((g) => (
          <div
            key={g.id}
            className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-blue-700">{g.kategori}</p>
              <p className="font-semibold text-sm text-slate-900 truncate">{g.judul}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(g.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDokumenPanel: React.FC<{
  token: string;
  dokumen: DokumenItem[];
  onSaved: (msg: string) => void;
}> = ({ token, dokumen, onSaved }) => {
  const [form, setForm] = useState({
    judul: '',
    kategori: 'Surat Edaran' as DokumenKategori,
    deskripsi: '',
    kontenDokumen: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/dokumen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ judul: '', kategori: 'Surat Edaran', deskripsi: '', kontenDokumen: '' });
      onSaved('Dokumen baru berhasil diunggah ke pusat unduhan.');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/dokumen/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Dokumen dihapus.');
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-sm"
      >
        <h2 className="font-display text-lg font-bold text-slate-900">
          Tambah Dokumen Pusat Download
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            placeholder="Judul Dokumen"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <select
            value={form.kategori}
            onChange={(e) =>
              setForm({ ...form, kategori: e.target.value as DokumenKategori })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="Formulir">Formulir</option>
            <option value="Surat Edaran">Surat Edaran</option>
            <option value="Kalender Pendidikan">Kalender Pendidikan</option>
            <option value="Informasi PPDB">Informasi PPDB</option>
            <option value="Dokumen Lainnya">Dokumen Lainnya</option>
          </select>
          <input
            type="text"
            required
            placeholder="Deskripsi singkat"
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
          />
          <textarea
            rows={4}
            required
            placeholder="Isi teks dokumen resmi yang dapat diunduh..."
            value={form.kontenDokumen}
            onChange={(e) => setForm({ ...form, kontenDokumen: e.target.value })}
            className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
        >
          Simpan Dokumen
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
        {dokumen.map((d) => (
          <div key={d.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-700">
                {d.kategori} · {d.jumlahUnduhan}x diunduh
              </p>
              <p className="font-display font-bold text-sm text-slate-900">{d.judul}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(d.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminPpdbPanel: React.FC<{
  token: string;
  ppdb: PpdbPendaftar[];
  onSaved: (msg: string) => void;
}> = ({ token, ppdb, onSaved }) => {
  const handleUpdateStatus = async (
    id: number,
    statusVerifikasi: PpdbPendaftar['statusVerifikasi']
  ) => {
    const res = await fetch(`/api/admin/ppdb/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        statusVerifikasi,
        catatanPanitia: `Status diperbarui panitia menjadi ${statusVerifikasi}.`,
      }),
    });
    if (res.ok) onSaved(`Status pendaftar diperbarui menjadi ${statusVerifikasi}.`);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/ppdb/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Data pendaftar PPDB dihapus.');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-200">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Daftar Pendaftar PPDB Online ({ppdb.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="py-3 px-4 font-semibold">No. Daftar</th>
              <th className="py-3 px-4 font-semibold">Calon Siswa & NIK</th>
              <th className="py-3 px-4 font-semibold">Orang Tua & WA</th>
              <th className="py-3 px-4 font-semibold">Jalur</th>
              <th className="py-3 px-4 font-semibold">Verifikasi Panitia</th>
              <th className="py-3 px-4 font-semibold text-right">Hapus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {ppdb.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-blue-800">
                  {p.nomorPendaftaran}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900">{p.namaCalonSiswa}</div>
                  <div className="font-mono text-[11px] text-slate-500">NIK: {p.nik}</div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    {p.namaAyah} / {p.namaIbu}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">{p.noWhatsappOrtu}</div>
                </td>
                <td className="py-3 px-4 font-medium">{p.jalurPendaftaran}</td>
                <td className="py-3 px-4">
                  <select
                    value={p.statusVerifikasi}
                    onChange={(e) =>
                      handleUpdateStatus(
                        p.id,
                        e.target.value as PpdbPendaftar['statusVerifikasi']
                      )
                    }
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-semibold"
                  >
                    <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                    <option value="Diterima">Diterima</option>
                    <option value="Cadangan">Cadangan</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminAgendaPanel: React.FC<{
  token: string;
  agenda: AgendaItem[];
  onSaved: (msg: string) => void;
}> = ({ token, agenda, onSaved }) => {
  const [form, setForm] = useState({
    judul: '',
    tanggalMulai: new Date().toISOString().slice(0, 10),
    tanggalSelesai: new Date().toISOString().slice(0, 10),
    waktu: '08.00 – 11.00 WIB',
    lokasi: 'SDN Mulya Agung',
    kategori: 'Akademik' as AgendaItem['kategori'],
    keterangan: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ ...form, judul: '', keterangan: '' });
      onSaved('Agenda kegiatan ditambahkan.');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/agenda/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Agenda dihapus.');
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-sm"
      >
        <h2 className="font-display text-lg font-bold text-slate-900">
          Tambah Kalender Kegiatan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            placeholder="Nama Kegiatan"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
          />
          <select
            value={form.kategori}
            onChange={(e) =>
              setForm({ ...form, kategori: e.target.value as AgendaItem['kategori'] })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="Akademik">Akademik</option>
            <option value="Kesiswaan">Kesiswaan</option>
            <option value="Rapat Guru">Rapat Guru</option>
            <option value="Peringatan Hari Besar">Peringatan Hari Besar</option>
            <option value="PPDB">PPDB</option>
          </select>
          <input
            type="date"
            value={form.tanggalMulai}
            onChange={(e) =>
              setForm({ ...form, tanggalMulai: e.target.value, tanggalSelesai: e.target.value })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Waktu"
            value={form.waktu}
            onChange={(e) => setForm({ ...form, waktu: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Lokasi"
            value={form.lokasi}
            onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Keterangan"
            value={form.keterangan}
            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
            className="sm:col-span-3 px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
        >
          Simpan Agenda
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
        {agenda.map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-700">
                {formatTanggalIndonesia(a.tanggalMulai)} · {a.kategori}
              </p>
              <p className="font-display font-bold text-sm text-slate-900">{a.judul}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(a.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminPesanPanel: React.FC<{
  token: string;
  pesan: PesanKontak[];
  onSaved: (msg: string) => void;
}> = ({ token, pesan, onSaved }) => {
  const handleMarkRead = async (id: number) => {
    const res = await fetch(`/api/admin/pesan/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Pesan ditandai sudah dibaca.');
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/pesan/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSaved('Pesan dihapus.');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
      <div className="p-5">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Kotak Masuk Formulir Kontak ({pesan.length})
        </h2>
      </div>
      {pesan.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">Belum ada pesan masuk.</div>
      ) : (
        pesan.map((m) => (
          <div key={m.id} className="p-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-900">{m.nama}</span> · {m.email} · {m.noHp}
              </div>
              <div className="flex items-center gap-2">
                {!m.statusDibaca && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(m.id)}
                    className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold"
                  >
                    Tandai Dibaca
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="font-display font-bold text-sm text-slate-900">{m.subjek}</p>
            <p className="text-sm text-slate-700">{m.pesan}</p>
          </div>
        ))
      )}
    </div>
  );
};

const AdminBackupPanel: React.FC<{
  token: string;
  onSaved: (msg: string) => void;
}> = ({ token, onSaved }) => {
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });
  const [passMsg, setPassMsg] = useState('');

  const handleDownloadBackup = async (type: 'json' | 'sql') => {
    const res = await fetch(`/api/admin/backup/${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `backup-sdn-mulya-agung-${stamp}.${type}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onSaved(`Backup ${type.toUpperCase()} berhasil diunduh.`);
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        onSaved('Database berhasil dipulihkan dari file backup.');
      }
    } catch {
      setPassMsg('File JSON tidak valid.');
    }
  };

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passForm),
    });
    const json = await res.json();
    if (!res.ok) {
      setPassMsg(json.error || 'Gagal mengganti kata sandi.');
    } else {
      setPassForm({ currentPassword: '', newPassword: '' });
      onSaved(json.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Backup & Restore Database Sekolah
        </h2>
        <p className="text-sm text-slate-600">
          Unduh salinan cadangan seluruh tabel relasional (sekolah, guru, kelas, siswa, berita, pengumuman, prestasi, ekstrakurikuler, galeri, dokumen, PPDB, dan agenda) dalam format JSON atau SQL Dump (kompatibel PostgreSQL/MySQL).
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleDownloadBackup('json')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Backup JSON</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownloadBackup('sql')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            <Database className="w-4 h-4" />
            <span>Unduh SQL Dump (.sql)</span>
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Restore dari File JSON</span>
            <input
              type="file"
              accept="application/json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <form
        onSubmit={handleChangePass}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-sm"
      >
        <h2 className="font-display text-lg font-bold text-slate-900">
          Keamanan Akun Administrator
        </h2>
        {passMsg && <p className="text-xs text-red-700">{passMsg}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          <input
            type="password"
            required
            placeholder="Kata sandi saat ini"
            value={passForm.currentPassword}
            onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Kata sandi baru (min. 6 karakter)"
            value={passForm.newPassword}
            onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
        >
          Perbarui Kata Sandi
        </button>
      </form>
    </div>
  );
};
