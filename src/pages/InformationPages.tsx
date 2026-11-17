import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Download,
  FileText,
  MapPin,
  Search,
  Share2,
  Trophy,
  User,
  X,
  Check,
  Play,
  ArrowLeft,
} from 'lucide-react';
import type {
  AgendaItem,
  Berita,
  DokumenItem,
  Ekstrakurikuler,
  GaleriItem,
  Guru,
  PageRoute,
  Pengumuman,
  Prestasi,
} from '../types/school.ts';
import { SafeImage } from '../components/SchoolLogo.tsx';
import { formatAngka, formatTanggalIndonesia } from '../utils/format.ts';

// 1. BERITA & KEGIATAN
export const BeritaPage: React.FC<{
  berita: Berita[];
  selectedBerita: Berita | null;
  onSelectBerita: (b: Berita | null) => void;
}> = ({ berita, selectedBerita, onSelectBerita }) => {
  const [kategori, setKategori] = useState<string>('Semua');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const kategoriList = [
    'Semua',
    'Kegiatan Sekolah',
    'Prestasi',
    'Pengumuman',
    'Pramuka',
    'Olahraga',
    'Seni',
    'Pendidikan',
    'Kegiatan Guru',
  ];

  const filtered = berita.filter((b) => {
    const matchKat = kategori === 'Semua' || b.kategori === kategori;
    const matchQ =
      !query.trim() ||
      b.judul.toLowerCase().includes(query.toLowerCase()) ||
      b.ringkasan.toLowerCase().includes(query.toLowerCase());
    return matchKat && matchQ;
  });

  const handleOpenArticle = async (b: Berita) => {
    onSelectBerita(b);
    try {
      await fetch(`/api/public/berita/${b.id}/view`, { method: 'POST' });
    } catch {
      // ignore view telemetry failure
    }
  };

  const handleCopyLink = (b: Berita) => {
    const url = `${window.location.origin}/#berita-${b.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (selectedBerita) {
    const shareUrl = `${window.location.origin}/#berita-${selectedBerita.id}`;
    const shareText = `${selectedBerita.judul} — Website Resmi SDN Mulya Agung`;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <button
          type="button"
          onClick={() => onSelectBerita(null)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Berita</span>
        </button>

        <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
            <SafeImage
              src={selectedBerita.foto}
              alt={selectedBerita.judul}
              className="w-full h-full object-cover"
              fallbackTitle={selectedBerita.judul}
            />
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-blue-700">{selectedBerita.kategori}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {formatTanggalIndonesia(selectedBerita.tanggal)}
                </span>
                <span aria-hidden="true">·</span>
                <span>Penulis: {selectedBerita.penulis}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight text-balance">
                {selectedBerita.judul}
              </h1>
            </div>

            <div className="border-y border-slate-200 py-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-700" />
                <span>Bagikan Berita:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  X / Twitter
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyLink(selectedBerita)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1"
                >
                  {copiedId === selectedBerita.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tautan Disalin</span>
                    </>
                  ) : (
                    <span>Salin Tautan</span>
                  )}
                </button>
              </div>
            </div>

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-base">
              {selectedBerita.isi}
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-blue-700">Publikasi Sekolah</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Berita & Kegiatan Sekolah
          </h1>
          <p className="text-sm text-slate-600">
            Dokumentasi kegiatan pembelajaran, prestasi siswa, Pramuka, olahraga, dan agenda guru SDN Mulya Agung.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul berita..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
        {kategoriList.map((kat) => (
          <button
            key={kat}
            type="button"
            onClick={() => setKategori(kat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              kategori === kat
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {kat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-sm">
          Belum ada berita yang sesuai dengan filter atau kata kunci tersebut.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((b) => (
            <article
              key={b.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-blue-300 transition-colors"
            >
              <div
                onClick={() => handleOpenArticle(b)}
                className="cursor-pointer aspect-[4/3] bg-slate-100 overflow-hidden"
              >
                <SafeImage
                  src={b.foto}
                  alt={b.judul}
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                  fallbackTitle={b.judul}
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-blue-700">{b.kategori}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatTanggalIndonesia(b.tanggal)}</span>
                  </div>
                  <h2
                    onClick={() => handleOpenArticle(b)}
                    className="cursor-pointer font-display text-lg font-bold text-slate-900 hover:text-blue-800 leading-snug"
                  >
                    {b.judul}
                  </h2>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {b.ringkasan}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{b.penulis}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(b)}
                      className="text-slate-500 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedId === b.id ? 'Disalin' : 'Bagikan'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenArticle(b)}
                      className="font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Baca
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

// 2. PRESTASI
export const PrestasiPage: React.FC<{ prestasi: Prestasi[] }> = ({ prestasi }) => {
  const [tingkat, setTingkat] = useState<string>('Semua');
  const tingkatOptions = ['Semua', 'Kecamatan', 'Kabupaten', 'Provinsi', 'Nasional'];

  const filtered =
    tingkat === 'Semua' ? prestasi : prestasi.filter((p) => p.tingkat === tingkat);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-700">Capaian Gemilang</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Prestasi Siswa & Sekolah
          </h1>
          <p className="text-sm text-slate-600">
            Catatan prestasi akademik, olahraga, seni, keagamaan, dan kepramukaan SDN Mulya Agung.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg">
          {tingkatOptions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTingkat(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tingkat === t
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((pr) => (
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
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-amber-700">{pr.peringkat}</span>
                  <span aria-hidden="true">·</span>
                  <span>Tingkat {pr.tingkat}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{pr.tahun}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 leading-snug">
                  {pr.judul}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{pr.deskripsi}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                <p>
                  <span className="text-slate-400">Peraih:</span>{' '}
                  <span className="font-semibold text-slate-800">{pr.peraih}</span>
                </p>
                <p>
                  <span className="text-slate-400">Pembina:</span> {pr.pembina}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. EKSTRAKURIKULER
export const EkstrakurikulerPage: React.FC<{ ekstrakurikuler: Ekstrakurikuler[] }> = ({
  ekstrakurikuler,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <p className="text-xs font-semibold text-blue-700">Minat, Bakat & Karakter</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Ekstrakurikuler SDN Mulya Agung
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
          Wadah pengembangan potensi peserta didik di luar jam pelajaran melalui Pramuka, Pencak Silat, Olahraga, Seni Tari, dan Pembinaan Keagamaan.
        </p>
      </div>

      <div className="space-y-8">
        {ekstrakurikuler.map((ek) => (
          <div
            key={ek.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
          >
            <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto bg-slate-100 overflow-hidden">
              <SafeImage
                src={ek.foto}
                alt={ek.nama}
                className="w-full h-full object-cover"
                fallbackTitle={ek.nama}
              />
            </div>
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-blue-700">{ek.kategori}</p>
                <h2 className="font-display text-2xl font-bold text-slate-900">{ek.nama}</h2>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {ek.deskripsi}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Jadwal Latihan</span>
                    <span className="font-semibold text-slate-900">{ek.jadwal}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Lokasi</span>
                    <span className="font-semibold text-slate-900">{ek.tempat}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Pembina</span>
                    <span className="font-semibold text-slate-900">{ek.pembina}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. GALERI
export const GaleriPage: React.FC<{ galeri: GaleriItem[] }> = ({ galeri }) => {
  const [kategori, setKategori] = useState<string>('Semua');
  const [lightbox, setLightbox] = useState<GaleriItem | null>(null);

  const kategoriList = [
    'Semua',
    'Kegiatan Pembelajaran',
    'Upacara',
    'Pramuka',
    'Olahraga',
    'Perlombaan',
    'Kegiatan Guru',
    'Kegiatan Sekolah',
    'Lingkungan Sekolah',
  ];

  const filtered =
    kategori === 'Semua' ? galeri : galeri.filter((g) => g.kategori === kategori);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <p className="text-xs font-semibold text-blue-700">Dokumentasi Foto & Video</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Galeri SDN Mulya Agung
        </h1>
        <p className="text-sm text-slate-600">
          Rekam jejak visual kegiatan belajar mengajar, upacara, Pramuka, perlombaan, dan keasrian lingkungan sekolah.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
        {kategoriList.map((kat) => (
          <button
            key={kat}
            type="button"
            onClick={() => setKategori(kat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              kategori === kat
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {kat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setLightbox(item)}
            className="group cursor-pointer bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-blue-300 transition-colors"
          >
            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
              <SafeImage
                src={item.url}
                alt={item.judul}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                fallbackTitle={item.judul}
              />
              {item.tipe === 'video' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-blue-700 flex items-center justify-center">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-medium text-blue-700">{item.kategori}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{formatTanggalIndonesia(item.tanggal)}</span>
              </div>
              <h3 className="font-display text-sm font-bold text-slate-900 line-clamp-2">
                {item.judul}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl"
          >
            <div className="relative aspect-[16/10] bg-slate-900">
              {lightbox.tipe === 'video' && lightbox.videoEmbedUrl ? (
                <iframe
                  src={lightbox.videoEmbedUrl}
                  title={lightbox.judul}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <SafeImage
                  src={lightbox.url}
                  alt={lightbox.judul}
                  className="w-full h-full object-contain"
                  fallbackTitle={lightbox.judul}
                />
              )}
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Tutup tampilan foto"
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-1.5">
              <p className="text-xs font-semibold text-blue-700">
                {lightbox.kategori} · {formatTanggalIndonesia(lightbox.tanggal)}
              </p>
              <h3 className="font-display text-lg font-bold text-slate-900">
                {lightbox.judul}
              </h3>
              <p className="text-sm text-slate-600">{lightbox.keterangan}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. PENGUMUMAN
export const PengumumanPage: React.FC<{ pengumuman: Pengumuman[] }> = ({
  pengumuman,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <p className="text-xs font-semibold text-red-700">Papan Informasi Sekolah</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Pengumuman Resmi
        </h1>
        <p className="text-sm text-slate-600">
          Informasi akademik, jadwal ujian, edaran orang tua, dan pemberitahuan kegiatan SDN Mulya Agung.
        </p>
      </div>

      <div className="space-y-5">
        {pengumuman.map((p) => (
          <article
            key={p.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span
                className={
                  p.prioritas === 'Penting'
                    ? 'font-semibold text-red-700'
                    : 'font-semibold text-blue-700'
                }
              >
                {p.prioritas}
              </span>
              <span aria-hidden="true">·</span>
              <span>{p.kategori}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{formatTanggalIndonesia(p.tanggal)}</span>
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">{p.judul}</h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {p.isi}
            </p>
            {p.fileLampiranDokumenId && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>Lampiran: {p.fileLampiranNama}</span>
                </span>
                <a
                  href={`/api/public/dokumen/${p.fileLampiranDokumenId}/download`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Lampiran</span>
                </a>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

// 6. DOWNLOAD DOKUMEN
export const DownloadPage: React.FC<{ dokumen: DokumenItem[] }> = ({ dokumen }) => {
  const [kategori, setKategori] = useState<string>('Semua');
  const kategoriList = [
    'Semua',
    'Formulir',
    'Surat Edaran',
    'Kalender Pendidikan',
    'Informasi PPDB',
    'Dokumen Lainnya',
  ];

  const filtered =
    kategori === 'Semua' ? dokumen : dokumen.filter((d) => d.kategori === kategori);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <p className="text-xs font-semibold text-blue-700">Layanan Arsip Publik</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Pusat Download Dokumen Sekolah
        </h1>
        <p className="text-sm text-slate-600">
          Unduh formulir administrasi, surat edaran resmi, kalender pendidikan, dan panduan PPDB SDN Mulya Agung.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
        {kategoriList.map((kat) => (
          <button
            key={kat}
            type="button"
            onClick={() => setKategori(kat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              kategori === kat
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {kat}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-200">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-blue-700">{doc.kategori}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{doc.format}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{doc.ukuran}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{formatTanggalIndonesia(doc.tanggal)}</span>
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">{doc.judul}</h3>
              <p className="text-sm text-slate-600">{doc.deskripsi}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-xs text-slate-500 tabular-nums">
                {formatAngka(doc.jumlahUnduhan)} unduhan
              </span>
              <a
                href={`/api/public/dokumen/${doc.id}/download`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. AGENDA / KALENDER KEGIATAN
export const AgendaPage: React.FC<{ agenda: AgendaItem[] }> = ({ agenda }) => {
  const [kategori, setKategori] = useState<string>('Semua');
  const kategoriList = [
    'Semua',
    'Akademik',
    'Kesiswaan',
    'Rapat Guru',
    'Peringatan Hari Besar',
    'PPDB',
  ];

  const filtered =
    kategori === 'Semua' ? agenda : agenda.filter((a) => a.kategori === kategori);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <p className="text-xs font-semibold text-blue-700">Jadwal Akademik & Sekolah</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Kalender Kegiatan SDN Mulya Agung
        </h1>
        <p className="text-sm text-slate-600">
          Daftar agenda kegiatan belajar, asesmen, rapat dewan guru, dan hari besar sekolah.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
        {kategoriList.map((kat) => (
          <button
            key={kat}
            type="button"
            onClick={() => setKategori(kat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              kategori === kat
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {kat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((ag) => (
          <div
            key={ag.id}
            className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-800 flex flex-col items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-blue-700">{ag.kategori}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-medium text-slate-700">
                  {formatTanggalIndonesia(ag.tanggalMulai)}
                  {ag.tanggalSelesai !== ag.tanggalMulai &&
                    ` s.d. ${formatTanggalIndonesia(ag.tanggalSelesai)}`}
                </span>
                <span aria-hidden="true">·</span>
                <span>{ag.waktu}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">{ag.judul}</h3>
              <p className="text-sm text-slate-600">{ag.keterangan}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-700" />
                <span>Lokasi: {ag.lokasi}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 8. PENCARIAN GLOBAL
export const SearchPage: React.FC<{
  initialQuery: string;
  onNavigate: (route: PageRoute) => void;
  onSelectBerita: (b: Berita) => void;
}> = ({ initialQuery, onNavigate, onSelectBerita }) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    berita: Berita[];
    pengumuman: Pengumuman[];
    prestasi: Prestasi[];
    ekstrakurikuler: Ekstrakurikuler[];
    guru: Guru[];
    dokumen: DokumenItem[];
    agenda: AgendaItem[];
  } | null>(null);

  const runSearch = async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/public/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        setResults(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      runSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const totalCount = results
    ? results.berita.length +
      results.pengumuman.length +
      results.prestasi.length +
      results.ekstrakurikuler.length +
      results.guru.length +
      results.dokumen.length +
      results.agenda.length
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-6 space-y-3">
        <p className="text-xs font-semibold text-blue-700">Pencarian Informasi</p>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Cari di Website SDN Mulya Agung
        </h1>
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik kata kunci: PPDB, Pramuka, Guru, OSN, Kalender..."
            className="flex-1 px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg"
          >
            Cari
          </button>
        </form>
      </div>

      {loading && <p className="text-sm text-slate-500">Sedang mencari data...</p>}

      {!loading && results && (
        <div className="space-y-8">
          <p className="text-sm text-slate-600">
            Ditemukan <span className="font-semibold text-slate-900 tabular-nums">{totalCount}</span> hasil untuk kata kunci “{query}”.
          </p>

          {results.berita.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900">Berita & Kegiatan</h2>
              <div className="space-y-2">
                {results.berita.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      onSelectBerita(b);
                      onNavigate('berita');
                    }}
                    className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300"
                  >
                    <p className="text-xs font-medium text-blue-700">
                      {b.kategori} · {formatTanggalIndonesia(b.tanggal)}
                    </p>
                    <p className="font-display font-bold text-slate-900 mt-0.5">{b.judul}</p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{b.ringkasan}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.pengumuman.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900">Pengumuman</h2>
              <div className="space-y-2">
                {results.pengumuman.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onNavigate('pengumuman')}
                    className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300"
                  >
                    <p className="text-xs font-medium text-red-700">
                      {p.prioritas} · {formatTanggalIndonesia(p.tanggal)}
                    </p>
                    <p className="font-display font-bold text-slate-900 mt-0.5">{p.judul}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.guru.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900">Guru & Staf</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.guru.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onNavigate('guru')}
                    className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300"
                  >
                    <p className="font-display font-bold text-slate-900">{g.nama}</p>
                    <p className="text-xs text-slate-600">{g.jabatan}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.dokumen.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900">Dokumen Download</h2>
              <div className="space-y-2">
                {results.dokumen.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-display font-bold text-slate-900">{d.judul}</p>
                      <p className="text-xs text-slate-500">{d.kategori}</p>
                    </div>
                    <a
                      href={`/api/public/dokumen/${d.id}/download`}
                      className="px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-semibold"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalCount === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
              Tidak ditemukan hasil untuk kata kunci tersebut. Coba kata kunci lain seperti “PPDB”, “Pramuka”, atau “OSN”.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
