export type PageRoute =
  | 'beranda'
  | 'profil'
  | 'visi-misi'
  | 'guru'
  | 'siswa'
  | 'kurikulum'
  | 'berita'
  | 'prestasi'
  | 'ekstrakurikuler'
  | 'galeri'
  | 'pengumuman'
  | 'download'
  | 'ppdb'
  | 'agenda'
  | 'kontak'
  | 'pencarian'
  | 'admin';

export interface AdminUser {
  id: number;
  username: string;
  namaLengkap: string;
  email: string;
  role: 'super_admin' | 'operator_sekolah';
  createdAt: string;
}

export interface FasilitasItem {
  nama: string;
  jumlah: string;
  kondisi: string;
  deskripsi: string;
}

export interface StrukturJabatan {
  jabatan: string;
  nama: string;
  nip?: string;
}

export interface KurikulumMapel {
  kelompok: string;
  namaMapel: string;
  faseA: string;
  faseB: string;
  faseC: string;
  keterangan: string;
}

export interface SekolahProfile {
  id: number;
  nama: string;
  npsn: string;
  nss: string;
  jenjang: string;
  status: string;
  akreditasi: string;
  kurikulumAktif: string;
  skPendirian: string;
  tahunBerdiri: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  email: string;
  telepon: string;
  whatsapp: string;
  jamOperasional: string;
  koordinatLat: number;
  koordinatLng: number;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  heroFoto: string;
  lingkunganFoto: string;
  kepalaSekolahNama: string;
  kepalaSekolahNip: string;
  kepalaSekolahFoto: string;
  sambutanKepalaSekolah: string;
  profilSingkat: string;
  sejarah: string;
  visi: string;
  misi: string[];
  tujuan: string[];
  fasilitas: FasilitasItem[];
  strukturOrganisasi: StrukturJabatan[];
  kurikulumRingkasan: string;
  p5Tema: string[];
  kurikulumMapel: KurikulumMapel[];
  tenagaKependidikanJumlah: number;
  ppdbTahunAjaran: string;
  ppdbStatusBuka: boolean;
  ppdbJadwal: { tahap: string; tanggal: string; keterangan: string }[];
  ppdbPersyaratan: string[];
  ppdbAlur: { langkah: string; judul: string; deskripsi: string }[];
  ppdbPengumuman: string;
}

export interface Guru {
  id: number;
  nama: string;
  jabatan: string;
  kategori: 'Kepala Sekolah' | 'Guru Kelas' | 'Guru Mata Pelajaran' | 'Tenaga Kependidikan';
  mataPelajaran: string;
  nipNuptk: string;
  statusKepegawaian?: 'PNS' | 'PPPK' | 'Guru Honorer' | 'Tenaga Honorer' | 'Lainnya';
  pendidikan: string;
  jenisKelamin?: 'Laki-laki' | 'Perempuan';
  tempatLahir?: string;
  tanggalLahir?: string;
  noTelepon?: string;
  alamat?: string;
  foto: string;
  email?: string;
  urutan: number;
}

export interface Kelas {
  id: number;
  namaKelas: string;
  tingkat: number;
  waliKelasId: number | null;
  tahunAjaran: string;
  kapasitas: number;
}

export interface Siswa {
  id: number;
  nama: string;
  nis: string;
  nisn: string;
  kelasId: number;
  rombelDapodik?: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tempatLahir: string;
  tanggalLahir: string;
  nik?: string;
  noKk?: string;
  noAktaLahir?: string;
  agama?: string;
  kewarganegaraan?: string;
  alamat: string;
  rt?: string;
  rw?: string;
  dusun?: string;
  kelurahan?: string;
  kecamatan?: string;
  kodePos?: string;
  jenisTinggal?: string;
  alatTransportasi?: string;
  noTelepon?: string;
  email?: string;
  penerimaKps?: string;
  noKps?: string;
  penerimaKip?: string;
  noKip?: string;
  namaDiKip?: string;
  noKks?: string;
  layakPip?: string;
  alasanLayakPip?: string;
  kebutuhanKhusus?: string;
  sekolahAsal?: string;
  anakKe?: string;
  jumlahSaudara?: string;
  beratBadan?: string;
  tinggiBadan?: string;
  lingkarKepala?: string;
  jarakSekolahKm?: string;
  namaAyah?: string;
  tahunLahirAyah?: string;
  pendidikanAyah?: string;
  pekerjaanAyah?: string;
  penghasilanAyah?: string;
  nikAyah?: string;
  namaIbu?: string;
  tahunLahirIbu?: string;
  pendidikanIbu?: string;
  pekerjaanIbu?: string;
  penghasilanIbu?: string;
  nikIbu?: string;
  namaWali?: string;
  tahunLahirWali?: string;
  pendidikanWali?: string;
  pekerjaanWali?: string;
  penghasilanWali?: string;
  nikWali?: string;
  namaOrangTua: string;
  noHpOrangTua: string;
  statusSiswa: 'Aktif' | 'Lulus' | 'Pindah' | 'Cuti';
}

export type BeritaKategori =
  | 'Kegiatan Sekolah'
  | 'Prestasi'
  | 'Pengumuman'
  | 'Pramuka'
  | 'Olahraga'
  | 'Seni'
  | 'Pendidikan'
  | 'Kegiatan Guru';

export interface Berita {
  id: number;
  judul: string;
  slug: string;
  kategori: BeritaKategori;
  foto: string;
  ringkasan: string;
  isi: string;
  penulis: string;
  tanggal: string;
  unggulan: boolean;
  dilihat: number;
}

export interface Pengumuman {
  id: number;
  judul: string;
  tanggal: string;
  kategori: string;
  prioritas: 'Penting' | 'Reguler';
  isi: string;
  fileLampiranNama: string;
  fileLampiranDokumenId: number | null;
}

export interface Prestasi {
  id: number;
  judul: string;
  tingkat: 'Kecamatan' | 'Kabupaten' | 'Provinsi' | 'Nasional';
  kategori: 'Akademik' | 'Olahraga' | 'Seni & Budaya' | 'Keagamaan' | 'Pramuka' | 'Sekolah';
  peraih: string;
  pembina: string;
  tahun: string;
  peringkat: string;
  deskripsi: string;
  foto: string;
}

export interface Ekstrakurikuler {
  id: number;
  nama: string;
  kategori: string;
  deskripsi: string;
  jadwal: string;
  tempat: string;
  pembina: string;
  foto: string;
  dokumentasi: string[];
}

export type GaleriKategori =
  | 'Kegiatan Pembelajaran'
  | 'Upacara'
  | 'Pramuka'
  | 'Olahraga'
  | 'Perlombaan'
  | 'Kegiatan Guru'
  | 'Kegiatan Sekolah'
  | 'Lingkungan Sekolah';

export interface GaleriItem {
  id: number;
  judul: string;
  tipe: 'foto' | 'video';
  kategori: GaleriKategori;
  url: string;
  videoEmbedUrl?: string;
  tanggal: string;
  keterangan: string;
}

export type DokumenKategori =
  | 'Formulir'
  | 'Surat Edaran'
  | 'Kalender Pendidikan'
  | 'Informasi PPDB'
  | 'Dokumen Lainnya';

export interface DokumenItem {
  id: number;
  judul: string;
  kategori: DokumenKategori;
  format: string;
  ukuran: string;
  tanggal: string;
  deskripsi: string;
  kontenDokumen: string;
  jumlahUnduhan: number;
}

export interface PpdbPendaftar {
  id: number;
  nomorPendaftaran: string;
  namaCalonSiswa: string;
  nik: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  alamat: string;
  asalTkPaud: string;
  namaAyah: string;
  namaIbu: string;
  noWhatsappOrtu: string;
  jalurPendaftaran: 'Zonasi' | 'Afirmasi' | 'Perpindahan Tugas';
  statusVerifikasi: 'Menunggu Verifikasi' | 'Diterima' | 'Cadangan' | 'Ditolak';
  catatanPanitia: string;
  tanggalDaftar: string;
}

export interface AgendaItem {
  id: number;
  judul: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  waktu: string;
  lokasi: string;
  kategori: 'Akademik' | 'Kesiswaan' | 'Rapat Guru' | 'Peringatan Hari Besar' | 'PPDB';
  keterangan: string;
}

export interface PesanKontak {
  id: number;
  nama: string;
  email: string;
  noHp: string;
  subjek: string;
  pesan: string;
  tanggal: string;
  statusDibaca: boolean;
}

export interface VisitorStats {
  totalKunjungan: number;
  kunjunganHariIni: number;
  tanggalHariIni: string;
  harian: { tanggal: string; jumlah: number }[];
}

export interface KelasSummary {
  id: number;
  namaKelas: string;
  tingkat: number;
  waliKelasNama: string;
  jumlahSiswa: number;
  kapasitas: number;
}

export interface PublicBootstrapData {
  sekolah: SekolahProfile;
  guru: Guru[];
  kelasSummary: KelasSummary[];
  berita: Berita[];
  pengumuman: Pengumuman[];
  prestasi: Prestasi[];
  ekstrakurikuler: Ekstrakurikuler[];
  galeri: GaleriItem[];
  dokumen: DokumenItem[];
  agenda: AgendaItem[];
  statistik: {
    jumlahSiswa: number;
    jumlahGuru: number;
    jumlahTenagaKependidikan: number;
    jumlahPrestasi: number;
    jumlahPendaftarPpdb: number;
    ppdbDiterima: number;
  };
  pengunjung: VisitorStats;
}
