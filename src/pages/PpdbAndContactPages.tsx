import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Send,
  UserPlus,
} from 'lucide-react';
import type { SekolahProfile } from '../types/school.ts';
import { buildWhatsappUrl, formatTanggalIndonesia } from '../utils/format.ts';

export const PpdbPage: React.FC<{
  sekolah: SekolahProfile;
  jumlahPendaftar: number;
  onRegistered: () => void;
}> = ({ sekolah, jumlahPendaftar, onRegistered }) => {
  const [form, setForm] = useState({
    namaCalonSiswa: '',
    nik: '',
    jenisKelamin: 'Laki-laki',
    tempatLahir: '',
    tanggalLahir: '',
    agama: 'Islam',
    alamat: '',
    asalTkPaud: '',
    namaAyah: '',
    namaIbu: '',
    noWhatsappOrtu: '',
    jalurPendaftaran: 'Zonasi',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState<{
    nomorPendaftaran: string;
    namaCalonSiswa: string;
    jalurPendaftaran: string;
    statusVerifikasi: string;
  } | null>(null);

  const [cekKode, setCekKode] = useState('');
  const [cekHasil, setCekHasil] = useState<{
    nomorPendaftaran: string;
    namaCalonSiswa: string;
    jalurPendaftaran: string;
    statusVerifikasi: string;
    catatanPanitia: string;
  } | null>(null);
  const [cekError, setCekError] = useState('');

  const handleSubmitPpdb = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/public/ppdb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || 'Gagal mengirim pendaftaran.');
      } else {
        setReceipt(json);
        onRegistered();
        setForm({
          namaCalonSiswa: '',
          nik: '',
          jenisKelamin: 'Laki-laki',
          tempatLahir: '',
          tanggalLahir: '',
          agama: 'Islam',
          alamat: '',
          asalTkPaud: '',
          namaAyah: '',
          namaIbu: '',
          noWhatsappOrtu: '',
          jalurPendaftaran: 'Zonasi',
        });
      }
    } catch {
      setErrorMsg('Terjadi gangguan koneksi. Silakan coba kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setCekError('');
    setCekHasil(null);
    if (!cekKode.trim()) return;
    try {
      const res = await fetch(
        `/api/public/ppdb/status?reg=${encodeURIComponent(cekKode.trim())}`
      );
      const json = await res.json();
      if (!res.ok) {
        setCekError(json.error || 'Data pendaftaran tidak ditemukan.');
      } else {
        setCekHasil(json);
      }
    } catch {
      setCekError('Gagal memeriksa status pendaftaran.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-blue-900 text-white rounded-2xl p-8 sm:p-10 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-amber-300">
          <span>PPDB Tahun Pelajaran {sekolah.ppdbTahunAjaran}</span>
          <span aria-hidden="true">·</span>
          <span>{sekolah.ppdbStatusBuka ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{jumlahPendaftar} Pendaftar Terdata</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
          Penerimaan Peserta Didik Baru (PPDB) SDN Mulya Agung
        </h1>
        <p className="text-sm sm:text-base text-blue-100 max-w-3xl leading-relaxed">
          {sekolah.ppdbPengumuman}
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <a
            href="#form-ppdb"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-blue-900 text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Isi Formulir Pendaftaran Online</span>
          </a>
          <a
            href="#cek-status-ppdb"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-800 border border-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Cek Status Pendaftaran</span>
          </a>
        </div>
      </div>

      {/* Persyaratan & Jadwal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Persyaratan Pendaftaran
          </h2>
          <ul className="space-y-3">
            {sekolah.ppdbPersyaratan.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Jadwal Pelaksanaan PPDB
          </h2>
          <div className="divide-y divide-slate-200">
            {sekolah.ppdbJadwal.map((j, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-display text-sm font-bold text-slate-900">{j.tahap}</h3>
                  <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
                    {j.tanggal}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{j.keterangan}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alur Pendaftaran */}
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Alur Pendaftaran Online & Verifikasi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {sekolah.ppdbAlur.map((step) => (
            <div
              key={step.langkah}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-2"
            >
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block tabular-nums">
                Langkah {step.langkah}
              </span>
              <h3 className="font-display text-sm font-bold text-slate-900">{step.judul}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.deskripsi}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cek Status Pendaftaran & Pengumuman */}
      <div
        id="cek-status-ppdb"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Cek Status & Pengumuman Hasil PPDB
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Masukkan nomor pendaftaran (contoh: <span className="font-mono">PPDB-2026-0001</span>) untuk melihat status verifikasi panitia.
            </p>
          </div>
          <form onSubmit={handleCheckStatus} className="flex gap-2 w-full md:w-96">
            <input
              type="text"
              value={cekKode}
              onChange={(e) => setCekKode(e.target.value)}
              placeholder="Contoh: PPDB-2026-0001"
              className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-blue-700"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 whitespace-nowrap"
            >
              Cek Status
            </button>
          </form>
        </div>

        {cekError && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {cekError}
          </p>
        )}

        {cekHasil && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Nomor Pendaftaran</span>
              <span className="font-mono font-bold text-slate-900">
                {cekHasil.nomorPendaftaran}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Nama Calon Siswa</span>
              <span className="font-semibold text-slate-900">{cekHasil.namaCalonSiswa}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Jalur Pendaftaran</span>
              <span className="font-medium text-slate-800">{cekHasil.jalurPendaftaran}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Status Verifikasi</span>
              <span className="font-bold text-blue-800">{cekHasil.statusVerifikasi}</span>
            </div>
            <div className="sm:col-span-4 pt-2 border-t border-slate-200 text-xs text-slate-600">
              Catatan Panitia: {cekHasil.catatanPanitia}
            </div>
          </div>
        )}
      </div>

      {/* Formulir Pendaftaran Online */}
      <div
        id="form-ppdb"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-6"
      >
        <div className="border-b border-slate-200 pb-4">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Formulir Pendaftaran Online Calon Peserta Didik Baru
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Lengkapi data calon siswa dan orang tua/wali dengan benar sesuai Kartu Keluarga dan Akta Kelahiran.
          </p>
        </div>

        {receipt && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-display font-bold text-lg">
              <ClipboardCheck className="w-5 h-5" />
              <span>Pendaftaran PPDB Online Berhasil Disimpan!</span>
            </div>
            <p className="text-sm text-emerald-900">
              Simpan nomor pendaftaran berikut untuk pengecekan status dan penyerahan berkas ke sekolah:
            </p>
            <div className="bg-white border border-emerald-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Nomor Pendaftaran</span>
                <span className="font-mono text-xl font-bold text-blue-800">
                  {receipt.nomorPendaftaran}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Calon Siswa</span>
                <span className="font-semibold text-slate-900">{receipt.namaCalonSiswa}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Status</span>
                <span className="font-semibold text-amber-700">{receipt.statusVerifikasi}</span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-3">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmitPpdb} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Lengkap Calon Siswa *
            </label>
            <input
              type="text"
              required
              value={form.namaCalonSiswa}
              onChange={(e) => setForm({ ...form, namaCalonSiswa: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
              placeholder="Sesuai Akta Kelahiran"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              NIK Calon Siswa (16 Digit) *
            </label>
            <input
              type="text"
              required
              value={form.nik}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-blue-700"
              placeholder="160609..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Kelamin *
            </label>
            <select
              value={form.jenisKelamin}
              onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-700"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jalur Pendaftaran *
            </label>
            <select
              value={form.jalurPendaftaran}
              onChange={(e) => setForm({ ...form, jalurPendaftaran: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-700"
            >
              <option value="Zonasi">Zonasi (Domisili Sekitar Sekolah)</option>
              <option value="Afirmasi">Afirmasi (KIP/PKH)</option>
              <option value="Perpindahan Tugas">Perpindahan Tugas Orang Tua</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tempat Lahir *
            </label>
            <input
              type="text"
              required
              value={form.tempatLahir}
              onChange={(e) => setForm({ ...form, tempatLahir: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
              placeholder="Contoh: Musi Banyuasin"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tanggal Lahir *
            </label>
            <input
              type="date"
              required
              value={form.tanggalLahir}
              onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Agama
            </label>
            <select
              value={form.agama}
              onChange={(e) => setForm({ ...form, agama: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-700"
            >
              <option value="Islam">Islam</option>
              <option value="Kristen">Kristen</option>
              <option value="Katolik">Katolik</option>
              <option value="Hindu">Hindu</option>
              <option value="Buddha">Buddha</option>
              <option value="Konghucu">Konghucu</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Asal TK / PAUD (Jika Ada)
            </label>
            <input
              type="text"
              value={form.asalTkPaud}
              onChange={(e) => setForm({ ...form, asalTkPaud: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
              placeholder="Contoh: TK Pertiwi Mulya Agung"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Ayah / Wali *
            </label>
            <input
              type="text"
              required
              value={form.namaAyah}
              onChange={(e) => setForm({ ...form, namaAyah: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Ibu / Wali *
            </label>
            <input
              type="text"
              required
              value={form.namaIbu}
              onChange={(e) => setForm({ ...form, namaIbu: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nomor WhatsApp Orang Tua/Wali Aktif *
            </label>
            <input
              type="tel"
              required
              value={form.noWhatsappOrtu}
              onChange={(e) => setForm({ ...form, noWhatsappOrtu: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-blue-700"
              placeholder="0812..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alamat Lengkap Tempat Tinggal *
            </label>
            <input
              type="text"
              required
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
              placeholder="Dusun, Desa Mulya Agung, Kec. Lalan"
            />
          </div>

          <div className="md:col-span-2 pt-2 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              * Wajib diisi. Data calon siswa dijaga kerahasiaannya oleh panitia PPDB SDN Mulya Agung.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              {submitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran PPDB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// KONTAK & LOKASI SEKOLAH
export const KontakPage: React.FC<{ sekolah: SekolahProfile }> = ({ sekolah }) => {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    noHp: '',
    subjek: '',
    pesan: '',
  });
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setErrMsg('');
    setSentMsg('');
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrMsg(json.error || 'Gagal mengirim pesan.');
      } else {
        setSentMsg(json.message);
        setForm({ nama: '', email: '', noHp: '', subjek: '', pesan: '' });
      }
    } catch {
      setErrMsg('Terjadi gangguan jaringan.');
    } finally {
      setSending(false);
    }
  };

  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${sekolah.koordinatLat},${sekolah.koordinatLng}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    sekolah.koordinatLng - 0.025
  }%2C${sekolah.koordinatLat - 0.02}%2C${sekolah.koordinatLng + 0.025}%2C${
    sekolah.koordinatLat + 0.02
  }&layer=mapnik&marker=${sekolah.koordinatLat}%2C${sekolah.koordinatLng}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <p className="text-xs font-semibold text-blue-700">Layanan Informasi Masyarakat</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Kontak & Lokasi SDN Mulya Agung
        </h1>
        <p className="text-sm text-slate-600">
          Silakan hubungi kami untuk keperluan informasi akademik, mutasi siswa, PPDB, maupun kemitraan masyarakat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Info Kontak */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Informasi Kontak Resmi
            </h2>
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Alamat Sekolah</span>
                  <span>
                    {sekolah.alamat}, Desa {sekolah.desa}, {sekolah.kecamatan},{' '}
                    {sekolah.kabupaten}, {sekolah.provinsi} {sekolah.kodePos}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Telepon & WhatsApp</span>
                  <span className="tabular-nums">
                    {sekolah.telepon} · WA +{sekolah.whatsapp}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Email Resmi</span>
                  <span>{sekolah.email}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Jam Layanan Tata Usaha</span>
                  <span>{sekolah.jamOperasional}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2.5">
              <a
                href={buildWhatsappUrl(
                  sekolah.whatsapp,
                  'Assalamu’alaikum Admin SDN Mulya Agung, saya ingin bertanya.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat WhatsApp Sekolah</span>
              </a>
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka di Google Maps</span>
              </a>
            </div>
          </div>

          {/* Media Sosial */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <h3 className="font-display text-base font-bold text-slate-900">
              Kanal Media Sosial Sekolah
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold">
              <a
                href={sekolah.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-slate-700"
              >
                <span>Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={sekolah.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-slate-700"
              >
                <span>Facebook</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={sekolah.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-slate-700"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={sekolah.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-slate-700"
              >
                <span>TikTok</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Formulir Kontak */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Kirim Pesan atau Pertanyaan
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Pesan akan langsung diteruskan ke kotak masuk Tata Usaha & Admin SDN Mulya Agung.
            </p>
          </div>

          {sentMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{sentMsg}</span>
            </div>
          )}

          {errMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-3">
              {errMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
                  placeholder="Nama orang tua / masyarakat"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.noHp}
                  onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
                  placeholder="0812..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
                  placeholder="nama@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Subjek / Keperluan
                </label>
                <input
                  type="text"
                  value={form.subjek}
                  onChange={(e) => setForm({ ...form, subjek: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
                  placeholder="Informasi PPDB / Mutasi / Lainnya"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Isi Pesan *
              </label>
              <textarea
                rows={4}
                required
                value={form.pesan}
                onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700"
                placeholder="Tuliskan pesan atau pertanyaan Anda secara jelas..."
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Mengirim...' : 'Kirim Pesan'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Peta Lokasi Sekolah */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Peta Lokasi SDN Mulya Agung
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              Desa Mulya Agung, Kecamatan Lalan, Kabupaten Musi Banyuasin, Sumatera Selatan ({sekolah.koordinatLat}, {sekolah.koordinatLng})
            </p>
          </div>
          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 whitespace-nowrap"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Rute Google Maps</span>
          </a>
        </div>
        <div className="h-[360px] w-full bg-slate-100">
          <iframe
            title="Peta Lokasi SDN Mulya Agung Kecamatan Lalan"
            src={osmEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};
