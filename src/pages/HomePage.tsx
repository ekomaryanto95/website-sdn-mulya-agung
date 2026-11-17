import React from 'react';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Trophy,
  Download,
  ChevronRight,
  Award,
  BookOpen,
} from 'lucide-react';
import type {
  Berita,
  PageRoute,
  PublicBootstrapData,
} from '../types/school.ts';
import { SafeImage } from '../components/SchoolLogo.tsx';
import { buildWhatsappUrl, formatAngka, formatTanggalIndonesia } from '../utils/format.ts';

interface HomePageProps {
  data: PublicBootstrapData;
  onNavigate: (route: PageRoute) => void;
  onSelectBerita: (berita: Berita) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  data,
  onNavigate,
  onSelectBerita,
}) => {
  const { sekolah, berita, pengumuman, prestasi, ekstrakurikuler, galeri, agenda, statistik } =
    data;

  const beritaUtama = berita[0];
  const beritaLainnya = berita.slice(1, 4);

  return (
    <div>
      {/* 1. Hero Banner Besar */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src={sekolah.heroFoto}
            alt="Gedung dan halaman upacara SDN Mulya Agung Kecamatan Lalan"
            className="w-full h-full object-cover opacity-75"
            fallbackTitle="SDN Mulya Agung"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-900/35" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs sm:text-sm font-medium text-amber-300 tracking-wide">
              {sekolah.kecamatan} · {sekolah.kabupaten} · {sekolah.provinsi}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white leading-[1.15] tracking-tight text-balance">
              Selamat Datang di Website Resmi SDN Mulya Agung
            </h1>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl">
              Mewujudkan Peserta Didik yang Berkarakter, Berprestasi, Mandiri, dan Berwawasan Lingkungan.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('profil')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <span>Profil Sekolah</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('ppdb')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-700 text-white font-semibold text-sm hover:bg-blue-600 transition-colors whitespace-nowrap"
              >
                <span>PPDB Online {sekolah.ppdbTahunAjaran}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Strip 4-Kolom Statistik Sekolah (Full-width row) */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="pt-2 sm:pt-0 sm:pr-6">
              <p className="text-xs font-medium text-slate-500">Jumlah Siswa Aktif</p>
              <p className="font-display text-3xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatAngka(statistik.jumlahSiswa)}
              </p>
              <p className="text-xs text-slate-500 mt-1">6 Rombongan Belajar (Kelas I–VI)</p>
            </div>
            <div className="pt-4 sm:pt-0 sm:px-6">
              <p className="text-xs font-medium text-slate-500">Jumlah Guru Pendidik</p>
              <p className="font-display text-3xl font-bold text-blue-800 mt-1 tabular-nums">
                {formatAngka(statistik.jumlahGuru)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Guru Kelas & Guru Mata Pelajaran</p>
            </div>
            <div className="pt-4 sm:pt-0 sm:px-6">
              <p className="text-xs font-medium text-slate-500">Tenaga Kependidikan</p>
              <p className="font-display text-3xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatAngka(statistik.jumlahTenagaKependidikan)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Tata Usaha, Operator & Pustakawan</p>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-6">
              <p className="text-xs font-medium text-slate-500">Prestasi Siswa & Sekolah</p>
              <p className="font-display text-3xl font-bold text-amber-700 mt-1 tabular-nums">
                {formatAngka(statistik.jumlahPrestasi)}+
              </p>
              <p className="text-xs text-slate-500 mt-1">Tingkat Kecamatan hingga Kabupaten</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sambutan Kepala Sekolah & Profil Singkat Sekolah */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col">
              <div className="aspect-square sm:aspect-[4/3] lg:flex-1 relative bg-slate-100 overflow-hidden">
                <SafeImage
                  src={sekolah.kepalaSekolahFoto}
                  alt={sekolah.kepalaSekolahNama}
                  className="w-full h-full object-cover object-top"
                  fallbackTitle={sekolah.kepalaSekolahNama}
                />
              </div>
              <div className="p-5 border-t border-slate-200 bg-white">
                <p className="text-xs text-slate-500">Kepala SDN Mulya Agung</p>
                <p className="font-display text-base font-bold text-slate-900 mt-0.5">
                  {sekolah.kepalaSekolahNama}
                </p>
                <p className="font-mono text-xs text-slate-500 mt-0.5 tabular-nums">
                  NIP. {sekolah.kepalaSekolahNip}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-blue-700 tracking-wide">
                Sambutan Kepala Sekolah
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
                Membentuk Generasi Berkarakter, Cerdas, dan Cinta Lingkungan di Lalan
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {sekolah.sambutanKepalaSekolah}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Profil Singkat Sekolah
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {sekolah.profilSingkat}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-slate-500 block">NPSN</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {sekolah.npsn}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Akreditasi</span>
                  <span className="font-semibold text-slate-900">{sekolah.akreditasi}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kurikulum</span>
                  <span className="font-semibold text-slate-900">{sekolah.kurikulumAktif}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tahun Berdiri</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {sekolah.tahunBerdiri}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => onNavigate('profil')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  <span>Selengkapnya tentang Profil & Sejarah</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('visi-misi')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  <span>Lihat Visi & Misi</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Berita Terbaru & Pengumuman Terbaru + Kalender Kegiatan */}
      <section className="bg-white border-y border-slate-200 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Berita Terbaru (8 kolom) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-end justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-semibold text-blue-700">Kabar Sekolah</p>
                  <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">
                    Berita & Kegiatan Terbaru
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('berita')}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <span>Semua Berita</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {beritaUtama && (
                <article
                  onClick={() => onSelectBerita(beritaUtama)}
                  className="group cursor-pointer bg-slate-50 border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch hover:border-blue-300 transition-colors"
                >
                  <div className="md:col-span-6 aspect-[4/3] md:aspect-auto bg-slate-200 overflow-hidden">
                    <SafeImage
                      src={beritaUtama.foto}
                      alt={beritaUtama.judul}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      fallbackTitle={beritaUtama.judul}
                    />
                  </div>
                  <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-blue-700">{beritaUtama.kategori}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {formatTanggalIndonesia(beritaUtama.tanggal)}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                        {beritaUtama.judul}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {beritaUtama.ringkasan}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                      <span>Oleh {beritaUtama.penulis}</span>
                      <span className="font-semibold text-blue-700 inline-flex items-center gap-1">
                        Baca artikel <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {beritaLainnya.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => onSelectBerita(item)}
                    className="group cursor-pointer bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-blue-300 transition-colors"
                  >
                    <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                      <SafeImage
                        src={item.foto}
                        alt={item.judul}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        fallbackTitle={item.judul}
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="font-medium text-blue-700">{item.kategori}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {formatTanggalIndonesia(item.tanggal)}
                          </span>
                        </div>
                        <h4 className="font-display text-sm font-bold text-slate-900 group-hover:text-blue-800 line-clamp-2 leading-snug">
                          {item.judul}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-blue-700 inline-flex items-center gap-1">
                        Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Pengumuman & Kalender Kegiatan (4 kolom) */}
            <div className="lg:col-span-4 space-y-8">
              {/* Pengumuman Terbaru */}
              <div className="space-y-4">
                <div className="flex items-end justify-between border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-xs font-semibold text-red-700">Informasi Resmi</p>
                    <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
                      Pengumuman Terbaru
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('pengumuman')}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-slate-50">
                  {pengumuman.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span
                          className={
                            p.prioritas === 'Penting'
                              ? 'font-semibold text-red-700'
                              : 'font-medium text-slate-600'
                          }
                        >
                          {p.prioritas}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{formatTanggalIndonesia(p.tanggal)}</span>
                      </div>
                      <h3 className="font-display text-sm font-bold text-slate-900 leading-snug">
                        {p.judul}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{p.isi}</p>
                      {p.fileLampiranDokumenId && (
                        <a
                          href={`/api/public/dokumen/${p.fileLampiranDokumenId}/download`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 pt-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh Lampiran</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Kalender Kegiatan */}
              <div className="space-y-4">
                <div className="flex items-end justify-between border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-xs font-semibold text-blue-700">Jadwal Sekolah</p>
                    <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
                      Kalender Kegiatan
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('agenda')}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Kalender Penuh
                  </button>
                </div>

                <div className="space-y-3">
                  {agenda.slice(0, 3).map((ag) => (
                    <div
                      key={ag.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-blue-700 tabular-nums">
                          {formatTanggalIndonesia(ag.tanggalMulai)} · {ag.waktu}
                        </p>
                        <p className="font-display text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                          {ag.judul}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{ag.lokasi}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Prestasi Siswa & Ekstrakurikuler */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 space-y-14">
        {/* Prestasi */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-semibold text-amber-700">Rekam Jejak Keunggulan</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Prestasi Siswa & Sekolah
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('prestasi')}
              className="text-sm font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>Lihat Semua Prestasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {prestasi.slice(0, 3).map((pr) => (
              <div
                key={pr.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  <SafeImage
                    src={pr.foto}
                    alt={pr.judul}
                    className="w-full h-full object-cover"
                    fallbackTitle={pr.judul}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-semibold text-amber-700">{pr.peringkat}</span>
                      <span aria-hidden="true">·</span>
                      <span>Tingkat {pr.tingkat}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{pr.tahun}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                      {pr.judul}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{pr.deskripsi}</p>
                  </div>
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                    Peraih: <span className="font-medium text-slate-800">{pr.peraih}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ekstrakurikuler */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-semibold text-blue-700">Pengembangan Bakat & Karakter</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Kegiatan Ekstrakurikuler
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ekstrakurikuler')}
              className="text-sm font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>Jelajahi Ekstrakurikuler</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ekstrakurikuler.slice(0, 4).map((ek) => (
              <div
                key={ek.id}
                onClick={() => onNavigate('ekstrakurikuler')}
                className="cursor-pointer bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  <SafeImage
                    src={ek.foto}
                    alt={ek.nama}
                    className="w-full h-full object-cover"
                    fallbackTitle={ek.nama}
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <p className="text-xs font-medium text-blue-700">{ek.kategori}</p>
                    <h3 className="font-display text-sm font-bold text-slate-900 mt-1">
                      {ek.nama}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{ek.deskripsi}</p>
                  </div>
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                    {ek.jadwal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Galeri Foto & Lingkungan Sekolah */}
      <section className="bg-white border-y border-slate-200 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-semibold text-blue-700">Dokumentasi Visual</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Galeri Kegiatan & Lingkungan Sekolah
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('galeri')}
              className="text-sm font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>Buka Galeri Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galeri.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('galeri')}
                className="group cursor-pointer relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
              >
                <SafeImage
                  src={item.url}
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  fallbackTitle={item.judul}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-3.5">
                  <span className="text-[11px] font-medium text-amber-300">{item.kategori}</span>
                  <p className="text-xs sm:text-sm font-semibold text-white line-clamp-2 mt-0.5">
                    {item.judul}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Akses Cepat Layanan & Kontak Sekolah */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 bg-blue-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-amber-300 tracking-wide">
                Penerimaan Peserta Didik Baru {sekolah.ppdbTahunAjaran}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-balance">
                Daftarkan Putra-Putri Anda di SDN Mulya Agung Secara Online & Gratis
              </h2>
              <p className="text-sm text-blue-100 leading-relaxed max-w-xl">
                {sekolah.ppdbPengumuman}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('ppdb')}
                className="px-5 py-2.5 rounded-lg bg-white text-blue-900 font-semibold text-sm hover:bg-blue-50 transition-colors"
              >
                Daftar PPDB Sekarang
              </button>
              <button
                type="button"
                onClick={() => onNavigate('download')}
                className="px-5 py-2.5 rounded-lg bg-blue-800 border border-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Pusat Download Dokumen</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
                <Award className="w-4 h-4" />
                <span>Layanan Informasi & Kontak Sekolah</span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                Hubungi SDN Mulya Agung
              </h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>
                    {sekolah.alamat}, {sekolah.kecamatan}, {sekolah.kabupaten}, {sekolah.provinsi}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-700 shrink-0" />
                  <span className="tabular-nums">
                    {sekolah.telepon} / WA +{sekolah.whatsapp}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>{sekolah.email}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('kontak')}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors text-center"
              >
                Peta & Formulir Kontak
              </button>
              <a
                href={buildWhatsappUrl(
                  sekolah.whatsapp,
                  'Halo Admin SDN Mulya Agung, saya ingin bertanya tentang informasi sekolah.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg border border-emerald-600 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors text-center"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
