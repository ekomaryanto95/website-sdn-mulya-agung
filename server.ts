import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import {
  getDb,
  nextId,
  recordVisitorHit,
  saveDb,
  type DatabaseState,
} from './src/server/db.ts';
import {
  hashPassword,
  requireAdminAuth,
  signSessionToken,
  verifyPassword,
  type AuthenticatedRequest,
} from './src/server/auth.ts';
import { generateSqlDump } from './src/server/sqlExport.ts';
import type { PublicBootstrapData } from './src/types/school.ts';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 120);
}

function buildPublicBootstrap(db: DatabaseState): PublicBootstrapData {
  const guruMap = new Map(db.guru.map((g) => [g.id, g.nama]));
  const siswaAktif = db.siswa.filter((s) => s.statusSiswa === 'Aktif');
  const kelasSummary = db.kelas.map((k) => ({
    id: k.id,
    namaKelas: k.namaKelas,
    tingkat: k.tingkat,
    waliKelasNama: k.waliKelasId ? guruMap.get(k.waliKelasId) || '-' : '-',
    jumlahSiswa: siswaAktif.filter((s) => s.kelasId === k.id).length,
    kapasitas: k.kapasitas,
  }));

  const jumlahGuru = db.guru.filter((g) => g.kategori !== 'Tenaga Kependidikan').length;
  const jumlahTenagaKependidikan = db.guru.filter(
    (g) => g.kategori === 'Tenaga Kependidikan'
  ).length;

  return {
    sekolah: db.sekolah,
    guru: [...db.guru].sort((a, b) => a.urutan - b.urutan),
    kelasSummary,
    berita: [...db.berita].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    pengumuman: [...db.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    prestasi: [...db.prestasi].sort((a, b) => b.tahun.localeCompare(a.tahun)),
    ekstrakurikuler: db.ekstrakurikuler,
    galeri: [...db.galeri].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    dokumen: [...db.dokumen].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    agenda: [...db.agenda].sort((a, b) => a.tanggalMulai.localeCompare(b.tanggalMulai)),
    statistik: {
      jumlahSiswa: siswaAktif.length,
      jumlahGuru,
      jumlahTenagaKependidikan,
      jumlahPrestasi: db.prestasi.length,
      jumlahPendaftarPpdb: db.ppdb.length,
      ppdbDiterima: db.ppdb.filter((p) => p.statusVerifikasi === 'Diterima').length,
    },
    pengunjung: db.pengunjung,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // --- PUBLIC ROUTES ---
  app.get('/api/public/bootstrap', (_req, res) => {
    const db = getDb();
    res.json(buildPublicBootstrap(db));
  });

  app.post('/api/public/visit', (_req, res) => {
    const stats = recordVisitorHit();
    res.json(stats);
  });

  app.post('/api/public/berita/:id/view', (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    const item = db.berita.find((b) => b.id === id);
    if (!item) {
      res.status(404).json({ error: 'Berita tidak ditemukan.' });
      return;
    }
    item.dilihat += 1;
    saveDb(db);
    res.json({ dilihat: item.dilihat });
  });

  app.get('/api/public/search', (req, res) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    const db = getDb();
    if (!q) {
      res.json({
        berita: [],
        pengumuman: [],
        prestasi: [],
        ekstrakurikuler: [],
        guru: [],
        dokumen: [],
        agenda: [],
      });
      return;
    }

    res.json({
      berita: db.berita.filter(
        (b) =>
          b.judul.toLowerCase().includes(q) ||
          b.ringkasan.toLowerCase().includes(q) ||
          b.kategori.toLowerCase().includes(q)
      ),
      pengumuman: db.pengumuman.filter(
        (p) =>
          p.judul.toLowerCase().includes(q) || p.isi.toLowerCase().includes(q)
      ),
      prestasi: db.prestasi.filter(
        (pr) =>
          pr.judul.toLowerCase().includes(q) ||
          pr.peraih.toLowerCase().includes(q) ||
          pr.kategori.toLowerCase().includes(q)
      ),
      ekstrakurikuler: db.ekstrakurikuler.filter(
        (e) =>
          e.nama.toLowerCase().includes(q) ||
          e.deskripsi.toLowerCase().includes(q)
      ),
      guru: db.guru.filter(
        (g) =>
          g.nama.toLowerCase().includes(q) ||
          g.jabatan.toLowerCase().includes(q) ||
          g.mataPelajaran.toLowerCase().includes(q)
      ),
      dokumen: db.dokumen.filter(
        (d) =>
          d.judul.toLowerCase().includes(q) ||
          d.deskripsi.toLowerCase().includes(q)
      ),
      agenda: db.agenda.filter(
        (a) =>
          a.judul.toLowerCase().includes(q) ||
          a.keterangan.toLowerCase().includes(q)
      ),
    });
  });

  app.get('/api/public/dokumen/:id/download', (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    const doc = db.dokumen.find((d) => d.id === id);
    if (!doc) {
      res.status(404).json({ error: 'Dokumen tidak ditemukan.' });
      return;
    }
    doc.jumlahUnduhan += 1;
    saveDb(db);

    const safeFilename = `${slugify(doc.judul) || 'dokumen-sdn-mulya-agung'}.txt`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.send(
      `${doc.judul}\nKategori: ${doc.kategori}\nTanggal: ${doc.tanggal}\n==================================================\n\n${doc.kontenDokumen}\n\n--\nSDN Mulya Agung, Kec. Lalan, Kab. Musi Banyuasin, Sumatera Selatan`
    );
  });

  app.post('/api/public/ppdb', (req, res) => {
    const body = req.body || {};
    const requiredFields = [
      'namaCalonSiswa',
      'nik',
      'jenisKelamin',
      'tempatLahir',
      'tanggalLahir',
      'alamat',
      'namaAyah',
      'namaIbu',
      'noWhatsappOrtu',
      'jalurPendaftaran',
    ];
    for (const field of requiredFields) {
      if (!String(body[field] || '').trim()) {
        res.status(400).json({ error: `Kolom ${field} wajib diisi.` });
        return;
      }
    }

    const db = getDb();
    const id = nextId(db.ppdb);
    const nomorPendaftaran = `PPDB-2026-${String(id).padStart(4, '0')}`;
    const record = {
      id,
      nomorPendaftaran,
      namaCalonSiswa: String(body.namaCalonSiswa).trim(),
      nik: String(body.nik).trim(),
      jenisKelamin:
        body.jenisKelamin === 'Perempuan' ? ('Perempuan' as const) : ('Laki-laki' as const),
      tempatLahir: String(body.tempatLahir).trim(),
      tanggalLahir: String(body.tanggalLahir).trim(),
      agama: String(body.agama || 'Islam').trim(),
      alamat: String(body.alamat).trim(),
      asalTkPaud: String(body.asalTkPaud || '-').trim(),
      namaAyah: String(body.namaAyah).trim(),
      namaIbu: String(body.namaIbu).trim(),
      noWhatsappOrtu: String(body.noWhatsappOrtu).trim(),
      jalurPendaftaran:
        body.jalurPendaftaran === 'Afirmasi' || body.jalurPendaftaran === 'Perpindahan Tugas'
          ? body.jalurPendaftaran
          : ('Zonasi' as const),
      statusVerifikasi: 'Menunggu Verifikasi' as const,
      catatanPanitia: 'Pendaftaran online berhasil diterima. Silakan serahkan berkas ke sekolah.',
      tanggalDaftar: new Date().toISOString(),
    };

    db.ppdb.unshift(record);
    saveDb(db);
    res.status(201).json({
      nomorPendaftaran: record.nomorPendaftaran,
      namaCalonSiswa: record.namaCalonSiswa,
      jalurPendaftaran: record.jalurPendaftaran,
      statusVerifikasi: record.statusVerifikasi,
      catatanPanitia: record.catatanPanitia,
      tanggalDaftar: record.tanggalDaftar,
    });
  });

  app.get('/api/public/ppdb/status', (req, res) => {
    const reg = String(req.query.reg || '').trim().toUpperCase();
    if (!reg) {
      res.status(400).json({ error: 'Masukkan nomor pendaftaran PPDB.' });
      return;
    }
    const db = getDb();
    const found = db.ppdb.find((p) => p.nomorPendaftaran.toUpperCase() === reg);
    if (!found) {
      res.status(404).json({
        error: `Nomor pendaftaran "${reg}" tidak ditemukan.`,
      });
      return;
    }
    // Privacy-safe response: do not expose NIK, address, or phone publicly
    res.json({
      nomorPendaftaran: found.nomorPendaftaran,
      namaCalonSiswa: found.namaCalonSiswa,
      jalurPendaftaran: found.jalurPendaftaran,
      statusVerifikasi: found.statusVerifikasi,
      catatanPanitia: found.catatanPanitia,
      tanggalDaftar: found.tanggalDaftar,
    });
  });

  app.post('/api/public/contact', (req, res) => {
    const { nama, email, noHp, subjek, pesan } = req.body || {};
    if (!String(nama || '').trim() || !String(pesan || '').trim()) {
      res.status(400).json({ error: 'Nama dan isi pesan wajib diisi.' });
      return;
    }
    const db = getDb();
    const entry = {
      id: nextId(db.pesanKontak),
      nama: String(nama).trim(),
      email: String(email || '-').trim(),
      noHp: String(noHp || '-').trim(),
      subjek: String(subjek || 'Pesan Umum').trim(),
      pesan: String(pesan).trim(),
      tanggal: new Date().toISOString(),
      statusDibaca: false,
    };
    db.pesanKontak.unshift(entry);
    saveDb(db);
    res.status(201).json({
      message: 'Pesan Anda telah terkirim dan akan segera ditindaklanjuti oleh pihak sekolah.',
    });
  });

  // --- AUTH ROUTES ---
  app.post('/api/auth/login', (req, res) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    if (!username || !password) {
      res.status(400).json({ error: 'Username/email dan kata sandi wajib diisi.' });
      return;
    }

    const db = getDb();
    const user = db.users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === username.toLowerCase()
    );
    if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
      res.status(401).json({ error: 'Username atau kata sandi salah.' });
      return;
    }

    const token = signSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        namaLengkap: user.namaLengkap,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  app.get('/api/auth/me', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const db = getDb();
    const user = db.users.find((u) => u.id === req.adminUser?.userId);
    if (!user) {
      res.status(401).json({ error: 'Akun admin tidak ditemukan.' });
      return;
    }
    res.json({
      id: user.id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  });

  app.post('/api/auth/change-password', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }
    const db = getDb();
    const user = db.users.find((u) => u.id === req.adminUser?.userId);
    if (!user || !verifyPassword(currentPassword, user.salt, user.passwordHash)) {
      res.status(400).json({ error: 'Kata sandi saat ini tidak sesuai.' });
      return;
    }
    const updated = hashPassword(newPassword);
    user.salt = updated.salt;
    user.passwordHash = updated.hash;
    saveDb(db);
    res.json({ message: 'Kata sandi administrator berhasil diperbarui.' });
  });

  // --- ADMIN PROTECTED ROUTES ---
  app.get('/api/admin/overview', requireAdminAuth, (_req, res) => {
    const db = getDb();
    res.json({
      sekolah: db.sekolah,
      guru: db.guru,
      kelas: db.kelas,
      siswa: db.siswa,
      berita: db.berita,
      pengumuman: db.pengumuman,
      prestasi: db.prestasi,
      ekstrakurikuler: db.ekstrakurikuler,
      galeri: db.galeri,
      dokumen: db.dokumen,
      ppdb: db.ppdb,
      agenda: db.agenda,
      pesanKontak: db.pesanKontak,
      pengunjung: db.pengunjung,
    });
  });

  app.put('/api/admin/sekolah', requireAdminAuth, (req, res) => {
    const db = getDb();
    db.sekolah = { ...db.sekolah, ...req.body, id: 1 };
    saveDb(db);
    res.json(db.sekolah);
  });

  // Guru CRUD
  app.post('/api/admin/guru', requireAdminAuth, (req, res) => {
    const db = getDb();
    const b = req.body || {};
    if (!String(b.nama || '').trim()) {
      res.status(400).json({ error: 'Nama guru/pegawai wajib diisi.' });
      return;
    }
    const item = {
      id: nextId(db.guru),
      nama: String(b.nama).trim(),
      jabatan: String(b.jabatan || 'Guru Kelas').trim(),
      kategori: b.kategori || 'Guru Kelas',
      mataPelajaran: String(b.mataPelajaran || 'Tematik').trim(),
      nipNuptk: String(b.nipNuptk || '-').trim(),
      pendidikan: String(b.pendidikan || 'S1').trim(),
      foto: String(b.foto || db.sekolah.kepalaSekolahFoto).trim(),
      email: String(b.email || '').trim(),
      urutan: Number(b.urutan || db.guru.length + 1),
    };
    db.guru.push(item);
    saveDb(db);
    res.status(201).json(item);
  });

  app.put('/api/admin/guru/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    const idx = db.guru.findIndex((g) => g.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Data guru tidak ditemukan.' });
      return;
    }
    db.guru[idx] = { ...db.guru[idx], ...req.body, id };
    saveDb(db);
    res.json(db.guru[idx]);
  });

  app.delete('/api/admin/guru/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    db.guru = db.guru.filter((g) => g.id !== id);
    for (const k of db.kelas) {
      if (k.waliKelasId === id) k.waliKelasId = null;
    }
    saveDb(db);
    res.json({ deleted: true });
  });

  // Kelas CRUD
  app.post('/api/admin/kelas', requireAdminAuth, (req, res) => {
    const db = getDb();
    const b = req.body || {};
    const item = {
      id: nextId(db.kelas),
      namaKelas: String(b.namaKelas || 'Kelas Baru').trim(),
      tingkat: Number(b.tingkat || 1),
      waliKelasId: b.waliKelasId ? Number(b.waliKelasId) : null,
      tahunAjaran: String(b.tahunAjaran || '2026/2027').trim(),
      kapasitas: Number(b.kapasitas || 28),
    };
    db.kelas.push(item);
    saveDb(db);
    res.status(201).json(item);
  });

  app.put('/api/admin/kelas/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    const idx = db.kelas.findIndex((k) => k.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Data kelas tidak ditemukan.' });
      return;
    }
    db.kelas[idx] = { ...db.kelas[idx], ...req.body, id };
    saveDb(db);
    res.json(db.kelas[idx]);
  });

  // Siswa CRUD (strictly admin protected)
  app.get('/api/admin/siswa', requireAdminAuth, (_req, res) => {
    const db = getDb();
    res.json(db.siswa);
  });

  app.post('/api/admin/siswa', requireAdminAuth, (req, res) => {
    const db = getDb();
    const b = req.body || {};
    if (!String(b.nama || '').trim() || !String(b.nis || '').trim()) {
      res.status(400).json({ error: 'Nama siswa dan NIS wajib diisi.' });
      return;
    }
    const item = {
      id: nextId(db.siswa),
      nama: String(b.nama).trim(),
      nis: String(b.nis).trim(),
      nisn: String(b.nisn || '-').trim(),
      kelasId: Number(b.kelasId || db.kelas[0]?.id || 1),
      jenisKelamin: b.jenisKelamin === 'Perempuan' ? ('Perempuan' as const) : ('Laki-laki' as const),
      tempatLahir: String(b.tempatLahir || 'Musi Banyuasin').trim(),
      tanggalLahir: String(b.tanggalLahir || '2016-01-01').trim(),
      alamat: String(b.alamat || 'Desa Mulya Agung, Kec. Lalan').trim(),
      namaOrangTua: String(b.namaOrangTua || '-').trim(),
      noHpOrangTua: String(b.noHpOrangTua || '-').trim(),
      statusSiswa: b.statusSiswa || 'Aktif',
    };
    db.siswa.unshift(item);
    saveDb(db);
    res.status(201).json(item);
  });

  app.put('/api/admin/siswa/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    const idx = db.siswa.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Data siswa tidak ditemukan.' });
      return;
    }
    db.siswa[idx] = { ...db.siswa[idx], ...req.body, id };
    saveDb(db);
    res.json(db.siswa[idx]);
  });

  app.delete('/api/admin/siswa/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    db.siswa = db.siswa.filter((s) => s.id !== id);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Berita CRUD
  app.post('/api/admin/berita', requireAdminAuth, (req, res) => {
    const db = getDb();
    const b = req.body || {};
    const judul = String(b.judul || '').trim();
    if (!judul) {
      res.status(400).json({ error: 'Judul berita wajib diisi.' });
      return;
    }
    const item = {
      id: nextId(db.berita),
      judul,
      slug: slugify(judul) || `berita-${Date.now()}`,
      kategori: b.kategori || 'Kegiatan Sekolah',
      foto: String(b.foto || db.sekolah.heroFoto).trim(),
      ringkasan: String(b.ringkasan || judul).trim(),
      isi: String(b.isi || '').trim(),
      penulis: String(b.penulis || 'Admin SDN Mulya Agung').trim(),
      tanggal: String(b.tanggal || new Date().toISOString().slice(0, 10)).trim(),
      unggulan: Boolean(b.unggulan),
      dilihat: 0,
    };
    db.berita.unshift(item);
    saveDb(db);
    res.status(201).json(item);
  });

  app.put('/api/admin/berita/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    const idx = db.berita.findIndex((x) => x.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Berita tidak ditemukan.' });
      return;
    }
    db.berita[idx] = { ...db.berita[idx], ...req.body, id };
    saveDb(db);
    res.json(db.berita[idx]);
  });

  app.delete('/api/admin/berita/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    db.berita = db.berita.filter((x) => x.id !== id);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Pengumuman CRUD
  app.post('/api/admin/pengumuman', requireAdminAuth, (req, res) => {
    const db = getDb();
    const b = req.body || {};
    const item = {
      id: nextId(db.pengumuman),
      judul: String(b.judul || '').trim(),
      tanggal: String(b.tanggal || new Date().toISOString().slice(0, 10)).trim(),
      kategori: String(b.kategori || 'Umum').trim(),
      prioritas: b.prioritas === 'Penting' ? ('Penting' as const) : ('Reguler' as const),
      isi: String(b.isi || '').trim(),
      fileLampiranNama: String(b.fileLampiranNama || '').trim(),
      fileLampiranDokumenId: b.fileLampiranDokumenId ? Number(b.fileLampiranDokumenId) : null,
    };
    db.pengumuman.unshift(item);
    saveDb(db);
    res.status(201).json(item);
  });

  app.put('/api/admin/pengumuman/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    const idx = db.pengumuman.findIndex((x) => x.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Pengumuman tidak ditemukan.' });
      return;
    }
    db.pengumuman[idx] = { ...db.pengumuman[idx], ...req.body, id };
    saveDb(db);
    res.json(db.pengumuman[idx]);
  });

  app.delete('/api/admin/pengumuman/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    db.pengumuman = db.pengumuman.filter((x) => x.id !== id);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Prestasi CRUD
  app.post('/api/admin/prestasi', requireAdminAuth, (req, res) => {
    const db = getDb();
    const b = req.body || {};
    const item = {
      id: nextId(db.prestasi),
      judul: String(b.judul || '').trim(),
      tingkat: b.tingkat || 'Kabupaten',
      kategori: b.kategori || 'Akademik',
      peraih: String(b.peraih || '').trim(),
      pembina: String(b.pembina || '').trim(),
      tahun: String(b.tahun || '2026').trim(),
      peringkat: String(b.peringkat || 'Juara 1').trim(),
      deskripsi: String(b.deskripsi || '').trim(),
      foto: String(b.foto || db.prestasi[0]?.foto || db.sekolah.heroFoto).trim(),
    };
    db.prestasi.unshift(item);
    saveDb(db);
    res.status(201).json(item);
  });

  app.put('/api/admin/prestasi/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    const idx = db.prestasi.findIndex((x) => x.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Prestasi tidak ditemukan.' });
      return;
    }
    db.prestasi[idx] = { ...db.prestasi[idx], ...req.body, id };
    saveDb(db);
    res.json(db.prestasi[idx]);
  });

  app.delete('/api/admin/prestasi/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    db.prestasi = db.prestasi.filter((x) => x.id !== id);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Ekstrakurikuler CRUD
  app.post('/api/admin/ekstrakurikuler', requireAdminAuth, (req, res) => {
    const db = getDb();
    const b = req.body || {};
    const item = {
      id: nextId(db.ekstrakurikuler),
      nama: String(b.nama || '').trim(),
      kategori: String(b.kategori || 'Kesiswaan').trim(),
      deskripsi: String(b.deskripsi || '').trim(),
      jadwal: String(b.jadwal || '').trim(),
      tempat: String(b.tempat || 'Lingkungan Sekolah').trim(),
      pembina: String(b.pembina || '').trim(),
      foto: String(b.foto || db.sekolah.heroFoto).trim(),
      dokumentasi: Array.isArray(b.dokumentasi) ? b.dokumentasi : [String(b.foto || db.sekolah.heroFoto)],
    };
    db.ekstrakurikuler.push(item);
    saveDb(db);
    res.status(201).json(item);
  });

  app.put('/api/admin/ekstrakurikuler/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    const idx = db.ekstrakurikuler.findIndex((x) => x.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Ekstrakurikuler tidak ditemukan.' });
      return;
    }
    db.ekstrakurikuler[idx] = { ...db.ekstrakurikuler[idx], ...req.body, id };
    saveDb(db);
    res.json(db.ekstrakurikuler[idx]);
  });

  app.delete('/api/admin/ekstrakurikuler/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    db.ekstrakurikuler = db.ekstrakurikuler.filter((x) => x.id !== id);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Galeri CRUD
  app.post('/api/admin/galeri', requireAdminAuth, (req, res) => {
    const db = getDb();
    const b = req.body || {};
    const item = {
      id: nextId(db.galeri),
      judul: String(b.judul || '').trim(),
      tipe: b.tipe === 'video' ? ('video' as const) : ('foto' as const),
      kategori: b.kategori || 'Kegiatan Sekolah',
      url: String(b.url || db.sekolah.heroFoto).trim(),
      videoEmbedUrl: String(b.videoEmbedUrl || '').trim(),
      tanggal: String(b.tanggal || new Date().toISOString().slice(0, 10)).trim(),
      keterangan: String(b.keterangan || '').trim(),
    };
    db.galeri.unshift(item);
    saveDb(db);
    res.status(201).json(item);
  });

  app.delete('/api/admin/galeri/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    db.galeri = db.galeri.filter((x) => x.id !== id);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Dokumen CRUD
  app.post('/api/admin/dokumen', requireAdminAuth, (req, res) => {
    const db = getDb();
    const b = req.body || {};
    const konten = String(b.kontenDokumen || b.deskripsi || '').trim();
    const item = {
      id: nextId(db.dokumen),
      judul: String(b.judul || '').trim(),
      kategori: b.kategori || 'Dokumen Lainnya',
      format: String(b.format || 'TXT / Cetak').trim(),
      ukuran: `${Math.max(1, Math.ceil(konten.length / 1024))} KB`,
      tanggal: String(b.tanggal || new Date().toISOString().slice(0, 10)).trim(),
      deskripsi: String(b.deskripsi || '').trim(),
      kontenDokumen: konten,
      jumlahUnduhan: 0,
    };
    db.dokumen.unshift(item);
    saveDb(db);
    res.status(201).json(item);
  });

  app.delete('/api/admin/dokumen/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    db.dokumen = db.dokumen.filter((x) => x.id !== id);
    saveDb(db);
    res.json({ deleted: true });
  });

  // PPDB Management
  app.patch('/api/admin/ppdb/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    const item = db.ppdb.find((p) => p.id === id);
    if (!item) {
      res.status(404).json({ error: 'Data pendaftar PPDB tidak ditemukan.' });
      return;
    }
    if (req.body.statusVerifikasi) {
      item.statusVerifikasi = req.body.statusVerifikasi;
    }
    if (typeof req.body.catatanPanitia === 'string') {
      item.catatanPanitia = req.body.catatanPanitia;
    }
    saveDb(db);
    res.json(item);
  });

  app.delete('/api/admin/ppdb/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    db.ppdb = db.ppdb.filter((p) => p.id !== id);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Agenda CRUD
  app.post('/api/admin/agenda', requireAdminAuth, (req, res) => {
    const db = getDb();
    const b = req.body || {};
    const item = {
      id: nextId(db.agenda),
      judul: String(b.judul || '').trim(),
      tanggalMulai: String(b.tanggalMulai || new Date().toISOString().slice(0, 10)).trim(),
      tanggalSelesai: String(b.tanggalSelesai || b.tanggalMulai || new Date().toISOString().slice(0, 10)).trim(),
      waktu: String(b.waktu || '08.00 – 12.00 WIB').trim(),
      lokasi: String(b.lokasi || 'SDN Mulya Agung').trim(),
      kategori: b.kategori || 'Akademik',
      keterangan: String(b.keterangan || '').trim(),
    };
    db.agenda.push(item);
    saveDb(db);
    res.status(201).json(item);
  });

  app.delete('/api/admin/agenda/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    db.agenda = db.agenda.filter((a) => a.id !== id);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Pesan Kontak
  app.patch('/api/admin/pesan/:id/read', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    const item = db.pesanKontak.find((m) => m.id === id);
    if (!item) {
      res.status(404).json({ error: 'Pesan tidak ditemukan.' });
      return;
    }
    item.statusDibaca = true;
    saveDb(db);
    res.json(item);
  });

  app.delete('/api/admin/pesan/:id', requireAdminAuth, (req, res) => {
    const id = Number(req.params.id);
    const db = getDb();
    db.pesanKontak = db.pesanKontak.filter((m) => m.id !== id);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Database Backup & Restore
  app.get('/api/admin/backup/json', requireAdminAuth, (_req, res) => {
    const db = getDb();
    const safeSnapshot = {
      ...db,
      users: db.users.map((u) => ({
        id: u.id,
        username: u.username,
        namaLengkap: u.namaLengkap,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    };
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="backup-sdn-mulya-agung-${stamp}.json"`
    );
    res.send(JSON.stringify(safeSnapshot, null, 2));
  });

  app.get('/api/admin/backup/sql', requireAdminAuth, (_req, res) => {
    const db = getDb();
    const sqlContent = generateSqlDump(db);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="backup-sdn-mulya-agung-${stamp}.sql"`
    );
    res.send(sqlContent);
  });

  app.post('/api/admin/backup/restore', requireAdminAuth, (req, res) => {
    const payload = req.body;
    if (!payload || !payload.sekolah || !Array.isArray(payload.guru) || !Array.isArray(payload.siswa)) {
      res.status(400).json({ error: 'Format file backup JSON tidak valid.' });
      return;
    }
    const currentDb = getDb();
    const restored: DatabaseState = {
      ...currentDb,
      sekolah: payload.sekolah,
      guru: payload.guru,
      kelas: Array.isArray(payload.kelas) ? payload.kelas : currentDb.kelas,
      siswa: payload.siswa,
      berita: Array.isArray(payload.berita) ? payload.berita : currentDb.berita,
      pengumuman: Array.isArray(payload.pengumuman) ? payload.pengumuman : currentDb.pengumuman,
      prestasi: Array.isArray(payload.prestasi) ? payload.prestasi : currentDb.prestasi,
      ekstrakurikuler: Array.isArray(payload.ekstrakurikuler)
        ? payload.ekstrakurikuler
        : currentDb.ekstrakurikuler,
      galeri: Array.isArray(payload.galeri) ? payload.galeri : currentDb.galeri,
      dokumen: Array.isArray(payload.dokumen) ? payload.dokumen : currentDb.dokumen,
      ppdb: Array.isArray(payload.ppdb) ? payload.ppdb : currentDb.ppdb,
      agenda: Array.isArray(payload.agenda) ? payload.agenda : currentDb.agenda,
      pesanKontak: Array.isArray(payload.pesanKontak)
        ? payload.pesanKontak
        : currentDb.pesanKontak,
      pengunjung: payload.pengunjung || currentDb.pengunjung,
      users: currentDb.users, // preserve password hashes
    };
    saveDb(restored);
    res.json({ message: 'Database berhasil dipulihkan dari file backup.' });
  });

  // --- VITE / STATIC SERVING ---
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server SDN Mulya Agung berjalan di http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Gagal menjalankan server:', err);
  process.exit(1);
});
