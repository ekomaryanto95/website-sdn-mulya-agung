import { useState, useEffect, useCallback } from 'react';
import type {
  AdminUser,
  Berita,
  PageRoute,
  PublicBootstrapData,
} from './types/school.ts';
import { Layout } from './components/Layout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import {
  GuruPage,
  KurikulumPage,
  ProfilSekolahPage,
  SiswaPublicGatePage,
  VisiMisiPage,
} from './pages/SchoolProfilePages.tsx';
import {
  AgendaPage,
  BeritaPage,
  DownloadPage,
  EkstrakurikulerPage,
  GaleriPage,
  PengumumanPage,
  PrestasiPage,
  SearchPage,
} from './pages/InformationPages.tsx';
import { KontakPage, PpdbPage } from './pages/PpdbAndContactPages.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';

const VALID_ROUTES: PageRoute[] = [
  'beranda',
  'profil',
  'visi-misi',
  'guru',
  'siswa',
  'kurikulum',
  'berita',
  'prestasi',
  'ekstrakurikuler',
  'galeri',
  'pengumuman',
  'download',
  'ppdb',
  'agenda',
  'kontak',
  'pencarian',
  'admin',
];

function parseRouteFromHash(): PageRoute {
  const hash = window.location.hash.replace(/^#/, '');
  if (VALID_ROUTES.includes(hash as PageRoute)) {
    return hash as PageRoute;
  }
  return 'beranda';
}

export default function App() {
  const [route, setRoute] = useState<PageRoute>(parseRouteFromHash);
  const [data, setData] = useState<PublicBootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBerita, setSelectedBerita] = useState<Berita | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('sdn_mulya_agung_token');
    } catch {
      return null;
    }
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const loadBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/public/bootstrap');
      if (!res.ok) throw new Error('Gagal memuat data sekolah');
      const json = (await res.json()) as PublicBootstrapData;
      setData(json);
      setError('');
    } catch (err) {
      setError('Tidak dapat memuat data website SDN Mulya Agung. Silakan muat ulang halaman.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBootstrap();
    // Record visitor once per session
    if (!sessionStorage.getItem('sdn_visit_recorded')) {
      sessionStorage.setItem('sdn_visit_recorded', '1');
      fetch('/api/public/visit', { method: 'POST' }).catch(() => {});
    }
  }, [loadBootstrap]);

  useEffect(() => {
    if (!adminToken) {
      setAdminUser(null);
      return;
    }
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user) {
          setAdminUser(user);
        } else {
          setAdminToken(null);
          sessionStorage.removeItem('sdn_mulya_agung_token');
        }
      })
      .catch(() => {});
  }, [adminToken]);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRouteFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (nextRoute: PageRoute, query?: string) => {
    if (nextRoute !== 'berita') {
      setSelectedBerita(null);
    }
    if (typeof query === 'string') {
      setSearchQuery(query);
    }
    setRoute(nextRoute);
    window.location.hash = nextRoute;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBerita = (b: Berita) => {
    setSelectedBerita(b);
    setRoute('berita');
    window.location.hash = 'berita';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (token: string, user: AdminUser) => {
    setAdminToken(token);
    setAdminUser(user);
    try {
      sessionStorage.setItem('sdn_mulya_agung_token', token);
    } catch {
      // ignore storage failure
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    try {
      sessionStorage.removeItem('sdn_mulya_agung_token');
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">
            Memuat Website Resmi SDN Mulya Agung...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md text-center space-y-4">
          <p className="font-display font-bold text-slate-900">Terjadi Gangguan Koneksi</p>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  const pengumumanPenting = data.pengumuman.find((p) => p.prioritas === 'Penting');

  return (
    <Layout
      activeRoute={route}
      onNavigate={navigate}
      sekolah={data.sekolah}
      pengumumanPenting={pengumumanPenting}
      pengunjung={data.pengunjung}
      isAdminLoggedIn={Boolean(adminToken && adminUser)}
    >
      {route === 'beranda' && (
        <HomePage
          data={data}
          onNavigate={navigate}
          onSelectBerita={handleSelectBerita}
        />
      )}
      {route === 'profil' && (
        <ProfilSekolahPage sekolah={data.sekolah} onNavigate={navigate} />
      )}
      {route === 'visi-misi' && <VisiMisiPage sekolah={data.sekolah} />}
      {route === 'guru' && <GuruPage guru={data.guru} />}
      {route === 'kurikulum' && <KurikulumPage sekolah={data.sekolah} />}
      {route === 'siswa' && (
        <SiswaPublicGatePage
          kelasSummary={data.kelasSummary}
          totalSiswa={data.statistik.jumlahSiswa}
          isAdminLoggedIn={Boolean(adminToken && adminUser)}
          onNavigate={navigate}
        />
      )}
      {route === 'berita' && (
        <BeritaPage
          berita={data.berita}
          selectedBerita={selectedBerita}
          onSelectBerita={setSelectedBerita}
        />
      )}
      {route === 'prestasi' && <PrestasiPage prestasi={data.prestasi} />}
      {route === 'ekstrakurikuler' && (
        <EkstrakurikulerPage ekstrakurikuler={data.ekstrakurikuler} />
      )}
      {route === 'galeri' && <GaleriPage galeri={data.galeri} />}
      {route === 'pengumuman' && <PengumumanPage pengumuman={data.pengumuman} />}
      {route === 'download' && <DownloadPage dokumen={data.dokumen} />}
      {route === 'agenda' && <AgendaPage agenda={data.agenda} />}
      {route === 'ppdb' && (
        <PpdbPage
          sekolah={data.sekolah}
          jumlahPendaftar={data.statistik.jumlahPendaftarPpdb}
          onRegistered={loadBootstrap}
        />
      )}
      {route === 'kontak' && <KontakPage sekolah={data.sekolah} />}
      {route === 'pencarian' && (
        <SearchPage
          initialQuery={searchQuery}
          onNavigate={navigate}
          onSelectBerita={handleSelectBerita}
        />
      )}
      {route === 'admin' && (
        <AdminDashboard
          token={adminToken}
          adminUser={adminUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          onDataChanged={loadBootstrap}
          onNavigate={navigate}
        />
      )}
    </Layout>
  );
}
