import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  GraduationCap,
  Lock,
  MapPin,
  ShieldCheck,
  Target,
  Users,
  BookOpen,
} from 'lucide-react';
import type {
  Guru,
  KelasSummary,
  PageRoute,
  SekolahProfile,
} from '../types/school.ts';
import { SafeImage } from '../components/SchoolLogo.tsx';

export const ProfilSekolahPage: React.FC<{
  sekolah: SekolahProfile;
  onNavigate: (route: PageRoute) => void;
}> = ({ sekolah, onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <p className="text-xs font-semibold text-blue-700">Tentang Kami</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Profil Sekolah SDN Mulya Agung
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
          {sekolah.kecamatan}, {sekolah.kabupaten}, {sekolah.provinsi}
        </p>
      </div>

      {/* Foto Lingkungan & Sejarah */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[280px]">
          <SafeImage
            src={sekolah.lingkunganFoto}
            alt="Lingkungan sekolah dan Taman Baca Adiwiyata SDN Mulya Agung"
            className="w-full h-full object-cover"
            fallbackTitle="Lingkungan SDN Mulya Agung"
          />
        </div>
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Sejarah Singkat Sekolah
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {sekolah.sejarah}
          </p>
          <div className="pt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('visi-misi')}
              className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
            >
              Lihat Visi, Misi & Tujuan
            </button>
            <button
              type="button"
              onClick={() => onNavigate('guru')}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Daftar Guru & Staf
            </button>
          </div>
        </div>
      </div>

      {/* Identitas Sekolah & Alamat */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-blue-700" />
          <h2 className="font-display text-xl font-bold text-slate-900">
            Identitas & Alamat Sekolah
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 block">Nama Sekolah</span>
            <span className="font-semibold text-slate-900">{sekolah.nama}</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 block">NPSN / NSS</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {sekolah.npsn} / {sekolah.nss}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 block">Jenjang & Status</span>
            <span className="font-semibold text-slate-900">
              {sekolah.jenjang} ({sekolah.status})
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 block">Akreditasi</span>
            <span className="font-semibold text-slate-900">{sekolah.akreditasi}</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 block">Kurikulum</span>
            <span className="font-semibold text-slate-900">{sekolah.kurikulumAktif}</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 block">SK Pendirian</span>
            <span className="font-semibold text-slate-900">{sekolah.skPendirian}</span>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 pt-3 border-t border-slate-100 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-slate-500 block">Alamat Lengkap</span>
              <span className="font-semibold text-slate-900">
                {sekolah.alamat}, Desa {sekolah.desa}, {sekolah.kecamatan},{' '}
                {sekolah.kabupaten}, {sekolah.provinsi}, Kode Pos {sekolah.kodePos}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Struktur Organisasi */}
      <div className="space-y-5">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-blue-700" />
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Struktur Organisasi Sekolah
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sekolah.strukturOrganisasi.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5"
            >
              <p className="text-xs font-semibold text-blue-700">{item.jabatan}</p>
              <p className="font-display text-base font-bold text-slate-900">{item.nama}</p>
              {item.nip && (
                <p className="font-mono text-xs text-slate-500 tabular-nums">
                  NIP. {item.nip}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fasilitas Sekolah */}
      <div className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Sarana & Fasilitas Sekolah
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Lingkungan belajar yang aman, bersih, ramah anak, dan mendukung kreativitas peserta didik.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sekolah.fasilitas.map((f, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-blue-700">{f.jumlah}</span>
                <span>{f.kondisi}</span>
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">{f.nama}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.deskripsi}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const VisiMisiPage: React.FC<{ sekolah: SekolahProfile }> = ({ sekolah }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <p className="text-xs font-semibold text-blue-700">Arah & Cita-Cita Pendidikan</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Visi, Misi & Tujuan SDN Mulya Agung
        </h1>
      </div>

      {/* Visi */}
      <div className="bg-blue-900 text-white rounded-2xl p-8 sm:p-10 space-y-4">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold tracking-wide">
          <Target className="w-4 h-4" />
          <span>Visi Sekolah</span>
        </div>
        <p className="font-display text-xl sm:text-2xl font-bold leading-snug text-balance">
          “{sekolah.visi}”
        </p>
      </div>

      {/* Misi & Tujuan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
          <h2 className="font-display text-xl font-bold text-slate-900">Misi Sekolah</h2>
          <ol className="space-y-3.5">
            {sekolah.misi.map((m, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
          <h2 className="font-display text-xl font-bold text-slate-900">Tujuan Sekolah</h2>
          <ul className="space-y-3.5">
            {sekolah.tujuan.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const GuruPage: React.FC<{ guru: Guru[] }> = ({ guru }) => {
  const [filter, setFilter] = useState<string>('Semua');
  const categories = [
    'Semua',
    'Kepala Sekolah',
    'Guru Kelas',
    'Guru Mata Pelajaran',
    'Tenaga Kependidikan',
  ];

  const filtered =
    filter === 'Semua' ? guru : guru.filter((g) => g.kategori === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-blue-700">Pendidik & Tenaga Kependidikan</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Kepala Sekolah, Guru & Staf
          </h1>
          <p className="text-sm text-slate-600">
            Tenaga pendidik profesional dan berdedikasi di SDN Mulya Agung, Kecamatan Lalan.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filter === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((g) => (
          <div
            key={g.id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
          >
            <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
              <SafeImage
                src={g.foto}
                alt={g.nama}
                className="w-full h-full object-cover object-top"
                fallbackTitle={g.nama}
              />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-blue-700">{g.kategori}</p>
                <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                  {g.nama}
                </h3>
                <p className="text-xs font-medium text-slate-700">{g.jabatan}</p>
                <p className="text-xs text-slate-500">Bidang: {g.mataPelajaran}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-0.5 text-xs text-slate-500">
                <p className="font-mono tabular-nums truncate">{g.nipNuptk}</p>
                <p>Pendidikan: {g.pendidikan}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const KurikulumPage: React.FC<{ sekolah: SekolahProfile }> = ({ sekolah }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <p className="text-xs font-semibold text-blue-700">Akademik & Pembelajaran</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Kurikulum SDN Mulya Agung
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
          {sekolah.kurikulumRingkasan}
        </p>
      </div>

      {/* 3 Fase Kurikulum Merdeka */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            fase: 'Fase A (Kelas I & II)',
            fokus: 'Fondasi Literasi, Numerasi & Karakter Awal',
            desc: 'Pembelajaran tematik menyenangkan berbasis bermain bermakna, pengenalan membaca menulis permulaan, dan pembiasaan adab harian.',
          },
          {
            fase: 'Fase B (Kelas III & IV)',
            fokus: 'Eksplorasi Sains, Sosial & Kemandirian',
            desc: 'Pengenalan IPAS terpadu, pemecahan masalah matematika kontekstual, serta proyek kolaboratif lingkungan sekitar Lalan.',
          },
          {
            fase: 'Fase C (Kelas V & VI)',
            fokus: 'Bernalar Kritis, Kepemimpinan & Persiapan Jenjang Lanjut',
            desc: 'Penguatan literasi mendalam, literasi digital, proyek riset sederhana, dan kesiapan Asesmen Nasional (ANBK).',
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 space-y-2.5">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>{item.fase}</span>
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">{item.fokus}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Struktur Mata Pelajaran */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-blue-700" />
          <h2 className="font-display text-xl font-bold text-slate-900">
            Struktur Mata Pelajaran & Alokasi Waktu (Per Minggu)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Kelompok</th>
                <th className="py-3.5 px-5 font-semibold">Mata Pelajaran</th>
                <th className="py-3.5 px-5 font-semibold tabular-nums">Fase A (1–2)</th>
                <th className="py-3.5 px-5 font-semibold tabular-nums">Fase B (3–4)</th>
                <th className="py-3.5 px-5 font-semibold tabular-nums">Fase C (5–6)</th>
                <th className="py-3.5 px-5 font-semibold">Fokus Pembelajaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sekolah.kurikulumMapel.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3.5 px-5 text-xs font-medium text-blue-700">{m.kelompok}</td>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">{m.namaMapel}</td>
                  <td className="py-3.5 px-5 font-mono text-xs tabular-nums">{m.faseA}</td>
                  <td className="py-3.5 px-5 font-mono text-xs tabular-nums">{m.faseB}</td>
                  <td className="py-3.5 px-5 font-mono text-xs tabular-nums">{m.faseC}</td>
                  <td className="py-3.5 px-5 text-slate-600">{m.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Program P5 */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-xl font-bold">
          Projek Penguatan Profil Pelajar Pancasila (P5)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sekolah.p5Tema.map((tema, idx) => (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200">
              {tema}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SiswaPublicGatePage: React.FC<{
  kelasSummary: KelasSummary[];
  totalSiswa: number;
  isAdminLoggedIn: boolean;
  onNavigate: (route: PageRoute) => void;
}> = ({ kelasSummary, totalSiswa, isAdminLoggedIn, onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-blue-700">Rekapitulasi & Administrasi Siswa</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Data Peserta Didik SDN Mulya Agung
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Demi melindungi privasi anak sesuai kebijakan perlindungan data pribadi peserta didik, biodata rinci siswa (NIS, NISN, alamat, dan data orang tua) hanya dapat diakses oleh Administrator Sekolah.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('admin')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Lock className="w-4 h-4" />
          <span>
            {isAdminLoggedIn
              ? 'Kelola Data Siswa di Dashboard Admin'
              : 'Login Admin untuk Kelola Data Siswa'}
          </span>
        </button>
      </div>

      {/* Notice Privasi */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-950 space-y-1">
          <p className="font-semibold">Akses Data Pribadi Siswa Terproteksi</p>
          <p className="text-blue-800">
            Halaman publik hanya menampilkan ringkasan jumlah rombongan belajar dan siswa aktif ({totalSiswa} siswa terdaftar). Pengelolaan NIS, NISN, tanggal lahir, alamat, serta data orang tua/wali tersedia melalui login Administrator.
          </p>
        </div>
      </div>

      {/* Ringkasan Rombongan Belajar */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Rekapitulasi Rombongan Belajar Tahun Ajaran 2026/2027
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Nama Kelas</th>
                <th className="py-3.5 px-5 font-semibold">Tingkat</th>
                <th className="py-3.5 px-5 font-semibold">Wali Kelas</th>
                <th className="py-3.5 px-5 font-semibold tabular-nums">Jumlah Siswa Aktif</th>
                <th className="py-3.5 px-5 font-semibold tabular-nums">Kapasitas Rombel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {kelasSummary.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">{k.namaKelas}</td>
                  <td className="py-3.5 px-5 text-slate-600 tabular-nums">Kelas {k.tingkat}</td>
                  <td className="py-3.5 px-5 text-slate-700">{k.waliKelasNama}</td>
                  <td className="py-3.5 px-5 font-mono font-semibold text-blue-800 tabular-nums">
                    {k.jumlahSiswa} siswa
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-600 tabular-nums">
                    {k.kapasitas} kursi
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
