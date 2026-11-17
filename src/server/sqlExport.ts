import type { DatabaseState } from './db.ts';

function sqlStr(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

export function generateSqlDump(db: DatabaseState): string {
  const lines: string[] = [];
  lines.push('-- ==========================================================');
  lines.push('-- BACKUP DATABASE RESMI SDN MULYA AGUNG');
  lines.push('-- Kecamatan Lalan, Kabupaten Musi Banyuasin, Sumatera Selatan');
  lines.push(`-- Diekspor pada: ${new Date().toISOString()}`);
  lines.push('-- Kompatibel dengan PostgreSQL / MySQL');
  lines.push('-- ==========================================================\n');

  lines.push(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  role VARCHAR(50) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);\n`);

  lines.push(`CREATE TABLE IF NOT EXISTS sekolah (
  id INTEGER PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  npsn VARCHAR(30) NOT NULL,
  nss VARCHAR(30) NOT NULL,
  jenjang VARCHAR(50) NOT NULL,
  akreditasi VARCHAR(10) NOT NULL,
  kurikulum_aktif VARCHAR(100) NOT NULL,
  alamat TEXT NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  kabupaten VARCHAR(100) NOT NULL,
  provinsi VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  whatsapp VARCHAR(30) NOT NULL,
  visi TEXT NOT NULL
);\n`);

  lines.push(`CREATE TABLE IF NOT EXISTS guru (
  id INTEGER PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  jabatan VARCHAR(150) NOT NULL,
  kategori VARCHAR(80) NOT NULL,
  mata_pelajaran VARCHAR(150) NOT NULL,
  nip_nuptk VARCHAR(60) NOT NULL,
  pendidikan VARCHAR(80) NOT NULL,
  urutan INTEGER NOT NULL
);\n`);

  lines.push(`CREATE TABLE IF NOT EXISTS kelas (
  id INTEGER PRIMARY KEY,
  nama_kelas VARCHAR(50) NOT NULL,
  tingkat INTEGER NOT NULL,
  wali_kelas_id INTEGER REFERENCES guru(id),
  tahun_ajaran VARCHAR(30) NOT NULL,
  kapasitas INTEGER NOT NULL
);\n`);

  lines.push(`CREATE TABLE IF NOT EXISTS siswa (
  id INTEGER PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  nis VARCHAR(30) UNIQUE NOT NULL,
  nisn VARCHAR(30) UNIQUE NOT NULL,
  nik VARCHAR(30),
  no_kk VARCHAR(30),
  agama VARCHAR(30),
  kelas_id INTEGER NOT NULL REFERENCES kelas(id),
  jenis_kelamin VARCHAR(20) NOT NULL,
  tempat_lahir VARCHAR(100) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  alamat TEXT NOT NULL,
  nama_ayah VARCHAR(150),
  nama_ibu VARCHAR(150),
  nama_orang_tua VARCHAR(150) NOT NULL,
  no_hp_orang_tua VARCHAR(30) NOT NULL,
  penerima_kip VARCHAR(20),
  status_siswa VARCHAR(30) NOT NULL
);
`);

  lines.push(`CREATE TABLE IF NOT EXISTS berita (
  id INTEGER PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  kategori VARCHAR(80) NOT NULL,
  penulis VARCHAR(120) NOT NULL,
  tanggal DATE NOT NULL,
  ringkasan TEXT NOT NULL,
  isi TEXT NOT NULL
);\n`);

  lines.push(`CREATE TABLE IF NOT EXISTS pengumuman (
  id INTEGER PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  tanggal DATE NOT NULL,
  kategori VARCHAR(80) NOT NULL,
  prioritas VARCHAR(30) NOT NULL,
  isi TEXT NOT NULL
);\n`);

  lines.push(`CREATE TABLE IF NOT EXISTS prestasi (
  id INTEGER PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  tingkat VARCHAR(50) NOT NULL,
  kategori VARCHAR(80) NOT NULL,
  peraih VARCHAR(150) NOT NULL,
  pembina VARCHAR(150) NOT NULL,
  tahun VARCHAR(10) NOT NULL,
  peringkat VARCHAR(80) NOT NULL
);\n`);

  lines.push(`CREATE TABLE IF NOT EXISTS ekstrakurikuler (
  id INTEGER PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  kategori VARCHAR(80) NOT NULL,
  jadwal VARCHAR(150) NOT NULL,
  pembina VARCHAR(150) NOT NULL,
  deskripsi TEXT NOT NULL
);\n`);

  lines.push(`CREATE TABLE IF NOT EXISTS galeri (
  id INTEGER PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  tipe VARCHAR(20) NOT NULL,
  kategori VARCHAR(80) NOT NULL,
  url TEXT NOT NULL,
  tanggal DATE NOT NULL
);\n`);

  lines.push(`CREATE TABLE IF NOT EXISTS dokumen (
  id INTEGER PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  kategori VARCHAR(80) NOT NULL,
  format VARCHAR(20) NOT NULL,
  ukuran VARCHAR(30) NOT NULL,
  tanggal DATE NOT NULL,
  jumlah_unduhan INTEGER NOT NULL
);\n`);

  lines.push(`CREATE TABLE IF NOT EXISTS ppdb (
  id INTEGER PRIMARY KEY,
  nomor_pendaftaran VARCHAR(50) UNIQUE NOT NULL,
  nama_calon_siswa VARCHAR(150) NOT NULL,
  nik VARCHAR(30) NOT NULL,
  jenis_kelamin VARCHAR(20) NOT NULL,
  tempat_lahir VARCHAR(100) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jalur_pendaftaran VARCHAR(60) NOT NULL,
  status_verifikasi VARCHAR(50) NOT NULL,
  tanggal_daftar TIMESTAMP NOT NULL
);\n`);

  lines.push(`CREATE TABLE IF NOT EXISTS agenda (
  id INTEGER PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  waktu VARCHAR(60) NOT NULL,
  lokasi VARCHAR(150) NOT NULL,
  kategori VARCHAR(80) NOT NULL
);\n`);

  // Inserts
  lines.push('-- DATA SEKOLAH');
  const s = db.sekolah;
  lines.push(
    `INSERT INTO sekolah (id, nama, npsn, nss, jenjang, akreditasi, kurikulum_aktif, alamat, kecamatan, kabupaten, provinsi, email, whatsapp, visi) VALUES (${s.id}, ${sqlStr(s.nama)}, ${sqlStr(s.npsn)}, ${sqlStr(s.nss)}, ${sqlStr(s.jenjang)}, ${sqlStr(s.akreditasi)}, ${sqlStr(s.kurikulumAktif)}, ${sqlStr(s.alamat)}, ${sqlStr(s.kecamatan)}, ${sqlStr(s.kabupaten)}, ${sqlStr(s.provinsi)}, ${sqlStr(s.email)}, ${sqlStr(s.whatsapp)}, ${sqlStr(s.visi)});`
  );

  lines.push('\n-- DATA GURU');
  for (const g of db.guru) {
    lines.push(
      `INSERT INTO guru (id, nama, jabatan, kategori, mata_pelajaran, nip_nuptk, pendidikan, urutan) VALUES (${g.id}, ${sqlStr(g.nama)}, ${sqlStr(g.jabatan)}, ${sqlStr(g.kategori)}, ${sqlStr(g.mataPelajaran)}, ${sqlStr(g.nipNuptk)}, ${sqlStr(g.pendidikan)}, ${g.urutan});`
    );
  }

  lines.push('\n-- DATA KELAS');
  for (const k of db.kelas) {
    lines.push(
      `INSERT INTO kelas (id, nama_kelas, tingkat, wali_kelas_id, tahun_ajaran, kapasitas) VALUES (${k.id}, ${sqlStr(k.namaKelas)}, ${k.tingkat}, ${k.waliKelasId ?? 'NULL'}, ${sqlStr(k.tahunAjaran)}, ${k.kapasitas});`
    );
  }

  lines.push('\n-- DATA SISWA');
  for (const st of db.siswa) {
    lines.push(
      `INSERT INTO siswa (id, nama, nis, nisn, nik, no_kk, agama, kelas_id, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nama_ayah, nama_ibu, nama_orang_tua, no_hp_orang_tua, penerima_kip, status_siswa) VALUES (${st.id}, ${sqlStr(st.nama)}, ${sqlStr(st.nis)}, ${sqlStr(st.nisn)}, ${sqlStr(st.nik)}, ${sqlStr(st.noKk)}, ${sqlStr(st.agama || 'Islam')}, ${st.kelasId}, ${sqlStr(st.jenisKelamin)}, ${sqlStr(st.tempatLahir)}, ${sqlStr(st.tanggalLahir)}, ${sqlStr(st.alamat)}, ${sqlStr(st.namaAyah)}, ${sqlStr(st.namaIbu)}, ${sqlStr(st.namaOrangTua)}, ${sqlStr(st.noHpOrangTua)}, ${sqlStr(st.penerimaKip)}, ${sqlStr(st.statusSiswa)});`
    );
  }

  lines.push('\n-- DATA BERITA');
  for (const b of db.berita) {
    lines.push(
      `INSERT INTO berita (id, judul, slug, kategori, penulis, tanggal, ringkasan, isi) VALUES (${b.id}, ${sqlStr(b.judul)}, ${sqlStr(b.slug)}, ${sqlStr(b.kategori)}, ${sqlStr(b.penulis)}, ${sqlStr(b.tanggal)}, ${sqlStr(b.ringkasan)}, ${sqlStr(b.isi)});`
    );
  }

  lines.push('\n-- DATA PENGUMUMAN');
  for (const p of db.pengumuman) {
    lines.push(
      `INSERT INTO pengumuman (id, judul, tanggal, kategori, prioritas, isi) VALUES (${p.id}, ${sqlStr(p.judul)}, ${sqlStr(p.tanggal)}, ${sqlStr(p.kategori)}, ${sqlStr(p.prioritas)}, ${sqlStr(p.isi)});`
    );
  }

  lines.push('\n-- DATA PRESTASI');
  for (const pr of db.prestasi) {
    lines.push(
      `INSERT INTO prestasi (id, judul, tingkat, kategori, peraih, pembina, tahun, peringkat) VALUES (${pr.id}, ${sqlStr(pr.judul)}, ${sqlStr(pr.tingkat)}, ${sqlStr(pr.kategori)}, ${sqlStr(pr.peraih)}, ${sqlStr(pr.pembina)}, ${sqlStr(pr.tahun)}, ${sqlStr(pr.peringkat)});`
    );
  }

  lines.push('\n-- DATA EKSTRAKURIKULER');
  for (const e of db.ekstrakurikuler) {
    lines.push(
      `INSERT INTO ekstrakurikuler (id, nama, kategori, jadwal, pembina, deskripsi) VALUES (${e.id}, ${sqlStr(e.nama)}, ${sqlStr(e.kategori)}, ${sqlStr(e.jadwal)}, ${sqlStr(e.pembina)}, ${sqlStr(e.deskripsi)});`
    );
  }

  lines.push('\n-- DATA GALERI');
  for (const gal of db.galeri) {
    lines.push(
      `INSERT INTO galeri (id, judul, tipe, kategori, url, tanggal) VALUES (${gal.id}, ${sqlStr(gal.judul)}, ${sqlStr(gal.tipe)}, ${sqlStr(gal.kategori)}, ${sqlStr(gal.url)}, ${sqlStr(gal.tanggal)});`
    );
  }

  lines.push('\n-- DATA DOKUMEN');
  for (const d of db.dokumen) {
    lines.push(
      `INSERT INTO dokumen (id, judul, kategori, format, ukuran, tanggal, jumlah_unduhan) VALUES (${d.id}, ${sqlStr(d.judul)}, ${sqlStr(d.kategori)}, ${sqlStr(d.format)}, ${sqlStr(d.ukuran)}, ${sqlStr(d.tanggal)}, ${d.jumlahUnduhan});`
    );
  }

  lines.push('\n-- DATA PPDB');
  for (const pb of db.ppdb) {
    lines.push(
      `INSERT INTO ppdb (id, nomor_pendaftaran, nama_calon_siswa, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, jalur_pendaftaran, status_verifikasi, tanggal_daftar) VALUES (${pb.id}, ${sqlStr(pb.nomorPendaftaran)}, ${sqlStr(pb.namaCalonSiswa)}, ${sqlStr(pb.nik)}, ${sqlStr(pb.jenisKelamin)}, ${sqlStr(pb.tempatLahir)}, ${sqlStr(pb.tanggalLahir)}, ${sqlStr(pb.jalurPendaftaran)}, ${sqlStr(pb.statusVerifikasi)}, ${sqlStr(pb.tanggalDaftar)});`
    );
  }

  lines.push('\n-- DATA AGENDA');
  for (const ag of db.agenda) {
    lines.push(
      `INSERT INTO agenda (id, judul, tanggal_mulai, tanggal_selesai, waktu, lokasi, kategori) VALUES (${ag.id}, ${sqlStr(ag.judul)}, ${sqlStr(ag.tanggalMulai)}, ${sqlStr(ag.tanggalSelesai)}, ${sqlStr(ag.waktu)}, ${sqlStr(ag.lokasi)}, ${sqlStr(ag.kategori)});`
    );
  }

  return lines.join('\n');
}
