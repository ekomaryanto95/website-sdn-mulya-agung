import * as XLSX from 'xlsx';
import type { Kelas, Siswa } from '../types/school.ts';

export type DapodikImportedStudent = Omit<Siswa, 'id' | 'kelasId'> & {
  kelasId?: number;
  rombelDapodik: string;
};

export interface DapodikParseResult {
  sheetNames: string[];
  selectedSheet: string;
  rows: DapodikImportedStudent[];
  detectedHeaderRow: number;
  mappedColumns: string[];
  skippedRows: number;
  warnings: string[];
}

function normalizeHeaderText(val: unknown): string {
  return String(val ?? '')
    .toLowerCase()
    .replace(/[\r\n]+/g, ' ')
    .replace(/[._:/()-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanCellStr(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    const dd = String(val.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return String(val).trim();
}

function normalizeDateCell(val: unknown): string {
  if (val === null || val === undefined || val === '') return '';
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    const dd = String(val.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (typeof val === 'number' && val > 1000 && val < 90000) {
    const parsed = XLSX.SSF.parse_date_code(val);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      return `${String(parsed.y).padStart(4, '0')}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
    }
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }
  const ymdSlash = /^(\d{4})[/](\d{1,2})[/](\d{1,2})$/.exec(s);
  if (ymdSlash) {
    return `${ymdSlash[1]}-${ymdSlash[2].padStart(2, '0')}-${ymdSlash[3].padStart(2, '0')}`;
  }
  return s;
}

function normalizeGender(val: unknown): 'Laki-laki' | 'Perempuan' {
  const s = normalizeHeaderText(val);
  if (s === 'p' || s.startsWith('perempuan') || s === 'wanita' || s === 'pr') {
    return 'Perempuan';
  }
  return 'Laki-laki';
}

function normalizeStatusSiswa(val: unknown): Siswa['statusSiswa'] {
  const s = normalizeHeaderText(val);
  if (s.includes('lulus')) return 'Lulus';
  if (s.includes('pindah') || s.includes('mutasi')) return 'Pindah';
  if (s.includes('cuti') || s.includes('nonaktif')) return 'Cuti';
  return 'Aktif';
}

export function matchKelasFromRombel(rombel: string, kelasList: Kelas[]): number | undefined {
  const clean = normalizeHeaderText(rombel);
  if (!clean) return undefined;

  // Exact or substring match
  for (const k of kelasList) {
    const normK = normalizeHeaderText(k.namaKelas);
    if (normK === clean) return k.id;
    const shortK = normK.replace(/^kelas\s+/, '');
    const shortClean = clean.replace(/^(kelas|rombel|kls)\s+/, '');
    if (shortK === shortClean || normK.replace(/\s+/g, '') === clean.replace(/\s+/g, '')) {
      return k.id;
    }
  }

  // Try tingkat match (e.g. "6A", "6", "VI A")
  const romanMap: Record<string, number> = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
  };
  const digitMatch = /(\d)/.exec(clean);
  let tingkat: number | null = digitMatch ? Number(digitMatch[1]) : null;
  if (!tingkat) {
    for (const [rom, num] of Object.entries(romanMap)) {
      if (new RegExp(`\\b${rom}\\b`).test(clean)) {
        tingkat = num;
        break;
      }
    }
  }
  if (tingkat) {
    const candidates = kelasList.filter((k) => k.tingkat === tingkat);
    if (candidates.length === 1) return candidates[0].id;
    if (candidates.length > 1) {
      const letterMatch = /\d\s*([a-z])/i.exec(clean);
      if (letterMatch) {
        const suffix = letterMatch[1].toLowerCase();
        const exactSuffix = candidates.find((c) =>
          c.namaKelas.toLowerCase().endsWith(suffix)
        );
        if (exactSuffix) return exactSuffix.id;
      }
      return candidates[0].id;
    }
  }
  return undefined;
}

function getEffectiveGridWithMerges(sheet: XLSX.WorkSheet): unknown[][] {
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    blankrows: true,
  });
  const merges = sheet['!merges'] || [];
  // Propagate parent group headers on top ~15 rows so Data Ayah / Data Ibu / Data Wali span all sub-columns
  for (const m of merges) {
    if (m.s.r > 20) continue;
    const sourceVal = raw[m.s.r]?.[m.s.c];
    if (!sourceVal) continue;
    for (let r = m.s.r; r <= m.e.r; r++) {
      if (!raw[r]) raw[r] = [];
      for (let c = m.s.c; c <= m.e.c; c++) {
        if (!raw[r][c]) {
          raw[r][c] = sourceVal;
        }
      }
    }
  }
  return raw;
}

type CanonicalField =
  | 'no'
  | 'nama'
  | 'nis'
  | 'jenisKelamin'
  | 'nisn'
  | 'tempatLahir'
  | 'tanggalLahir'
  | 'nik'
  | 'agama'
  | 'kewarganegaraan'
  | 'alamat'
  | 'rt'
  | 'rw'
  | 'dusun'
  | 'kelurahan'
  | 'kecamatan'
  | 'kodePos'
  | 'jenisTinggal'
  | 'alatTransportasi'
  | 'noTelepon'
  | 'noHpOrangTua'
  | 'email'
  | 'penerimaKps'
  | 'noKps'
  | 'namaAyah'
  | 'tahunLahirAyah'
  | 'pendidikanAyah'
  | 'pekerjaanAyah'
  | 'penghasilanAyah'
  | 'nikAyah'
  | 'namaIbu'
  | 'tahunLahirIbu'
  | 'pendidikanIbu'
  | 'pekerjaanIbu'
  | 'penghasilanIbu'
  | 'nikIbu'
  | 'namaWali'
  | 'tahunLahirWali'
  | 'pendidikanWali'
  | 'pekerjaanWali'
  | 'penghasilanWali'
  | 'nikWali'
  | 'rombelDapodik'
  | 'penerimaKip'
  | 'noKip'
  | 'namaDiKip'
  | 'noKks'
  | 'noAktaLahir'
  | 'layakPip'
  | 'alasanLayakPip'
  | 'kebutuhanKhusus'
  | 'sekolahAsal'
  | 'anakKe'
  | 'noKk'
  | 'beratBadan'
  | 'tinggiBadan'
  | 'lingkarKepala'
  | 'jumlahSaudara'
  | 'jarakSekolahKm'
  | 'statusSiswa';

function mapColumnToField(
  colLabel: string,
  parentGroup: string
): CanonicalField | null {
  const h = normalizeHeaderText(colLabel);
  const g = normalizeHeaderText(parentGroup);
  if (!h) return null;

  // Parent group disambiguation for Dapodik multi-row headers (Data Ayah / Data Ibu / Data Wali)
  const isAyahGroup = g.includes('ayah') && !g.includes('ibu') && !g.includes('wali');
  const isIbuGroup = g.includes('ibu') && !g.includes('ayah') && !g.includes('wali');
  const isWaliGroup = g.includes('wali') && !g.includes('ayah') && !g.includes('ibu');

  if (isAyahGroup) {
    if (h === 'nama' || h.includes('nama ayah')) return 'namaAyah';
    if (h.includes('tahun lahir')) return 'tahunLahirAyah';
    if (h.includes('pendidikan')) return 'pendidikanAyah';
    if (h.includes('pekerjaan')) return 'pekerjaanAyah';
    if (h.includes('penghasilan')) return 'penghasilanAyah';
    if (h === 'nik' || h.includes('nik ayah')) return 'nikAyah';
  }
  if (isIbuGroup) {
    if (h === 'nama' || h.includes('nama ibu')) return 'namaIbu';
    if (h.includes('tahun lahir')) return 'tahunLahirIbu';
    if (h.includes('pendidikan')) return 'pendidikanIbu';
    if (h.includes('pekerjaan')) return 'pekerjaanIbu';
    if (h.includes('penghasilan')) return 'penghasilanIbu';
    if (h === 'nik' || h.includes('nik ibu')) return 'nikIbu';
  }
  if (isWaliGroup) {
    if (h === 'nama' || h.includes('nama wali')) return 'namaWali';
    if (h.includes('tahun lahir')) return 'tahunLahirWali';
    if (h.includes('pendidikan')) return 'pendidikanWali';
    if (h.includes('pekerjaan')) return 'pekerjaanWali';
    if (h.includes('penghasilan')) return 'penghasilanWali';
    if (h === 'nik' || h.includes('nik wali')) return 'nikWali';
  }

  // Flat header rules
  if (h === 'no' || h === 'nomor') return 'no';
  if (h === 'nama' || h === 'nama lengkap' || h === 'nama siswa' || h === 'nama peserta didik') {
    return 'nama';
  }
  if (h === 'nipd' || h === 'nis' || h === 'no induk') return 'nis';
  if (h === 'jk' || h === 'jenis kelamin' || h === 'kelamin' || h === 'l p') return 'jenisKelamin';
  if (h === 'nisn') return 'nisn';
  if (h === 'tempat lahir' || h === 'tmp lahir') return 'tempatLahir';
  if (h === 'tanggal lahir' || h === 'tgl lahir') return 'tanggalLahir';
  if (h === 'nik' || h === 'nik siswa' || h === 'no nik') return 'nik';
  if (h === 'agama' || h === 'agama kepercayaan') return 'agama';
  if (h === 'kewarganegaraan') return 'kewarganegaraan';
  if (h === 'alamat' || h === 'alamat jalan' || h === 'alamat lengkap') return 'alamat';
  if (h === 'rt') return 'rt';
  if (h === 'rw') return 'rw';
  if (h === 'dusun' || h === 'nama dusun') return 'dusun';
  if (h === 'kelurahan' || h === 'desa' || h === 'desa kelurahan') return 'kelurahan';
  if (h === 'kecamatan') return 'kecamatan';
  if (h === 'kode pos' || h === 'kodepos') return 'kodePos';
  if (h === 'jenis tinggal' || h === 'tempat tinggal') return 'jenisTinggal';
  if (h === 'alat transportasi' || h === 'transportasi') return 'alatTransportasi';
  if (h === 'telepon' || h === 'no telepon') return 'noTelepon';
  if (h === 'hp' || h === 'no hp' || h === 'handphone' || h === 'no hp orang tua' || h === 'no wa') {
    return 'noHpOrangTua';
  }
  if (h === 'e mail' || h === 'email') return 'email';
  if (h === 'penerima kps') return 'penerimaKps';
  if (h === 'no kps' || h === 'nomor kps') return 'noKps';
  if (h.includes('nama ayah')) return 'namaAyah';
  if (h.includes('tahun lahir ayah')) return 'tahunLahirAyah';
  if (h.includes('pendidikan ayah')) return 'pendidikanAyah';
  if (h.includes('pekerjaan ayah')) return 'pekerjaanAyah';
  if (h.includes('penghasilan ayah')) return 'penghasilanAyah';
  if (h.includes('nik ayah')) return 'nikAyah';
  if (h.includes('nama ibu')) return 'namaIbu';
  if (h.includes('tahun lahir ibu')) return 'tahunLahirIbu';
  if (h.includes('pendidikan ibu')) return 'pendidikanIbu';
  if (h.includes('pekerjaan ibu')) return 'pekerjaanIbu';
  if (h.includes('penghasilan ibu')) return 'penghasilanIbu';
  if (h.includes('nik ibu')) return 'nikIbu';
  if (h.includes('nama wali')) return 'namaWali';
  if (h.includes('tahun lahir wali')) return 'tahunLahirWali';
  if (h.includes('pendidikan wali')) return 'pendidikanWali';
  if (h.includes('pekerjaan wali')) return 'pekerjaanWali';
  if (h.includes('penghasilan wali')) return 'penghasilanWali';
  if (h.includes('nik wali')) return 'nikWali';
  if (h === 'rombel saat ini' || h === 'rombel' || h === 'kelas' || h === 'nama rombel') {
    return 'rombelDapodik';
  }
  if (h === 'penerima kip') return 'penerimaKip';
  if (h === 'nomor kip' || h === 'no kip') return 'noKip';
  if (h === 'nama di kip') return 'namaDiKip';
  if (h === 'nomor kks' || h === 'no kks') return 'noKks';
  if (h.includes('akta lahir') || h.includes('no registrasi akta')) return 'noAktaLahir';
  if (h.includes('layak pip')) return 'layakPip';
  if (h.includes('alasan layak pip')) return 'alasanLayakPip';
  if (h.includes('kebutuhan khusus')) return 'kebutuhanKhusus';
  if (h === 'sekolah asal' || h === 'asal sekolah' || h === 'asal tk paud') return 'sekolahAsal';
  if (h.includes('anak ke')) return 'anakKe';
  if (h === 'no kk' || h === 'nomor kk') return 'noKk';
  if (h.includes('berat badan')) return 'beratBadan';
  if (h.includes('tinggi badan')) return 'tinggiBadan';
  if (h.includes('lingkar kepala')) return 'lingkarKepala';
  if (h.includes('saudara kandung')) return 'jumlahSaudara';
  if (h.includes('jarak rumah')) return 'jarakSekolahKm';
  if (h === 'status' || h === 'status siswa') return 'statusSiswa';

  return null;
}

export async function parseDapodikExcelFile(
  file: File,
  kelasList: Kelas[],
  preferredSheet?: string
): Promise<DapodikParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) {
    throw new Error('File Excel tidak memiliki lembar kerja (sheet).');
  }
  const selectedSheet =
    preferredSheet && sheetNames.includes(preferredSheet)
      ? preferredSheet
      : sheetNames[0];
  const sheet = workbook.Sheets[selectedSheet];
  const grid = getEffectiveGridWithMerges(sheet);

  // Detect the main column header row in top 25 rows
  let headerRowIdx = -1;
  let bestScore = 0;
  const searchLimit = Math.min(25, grid.length);
  for (let r = 0; r < searchLimit; r++) {
    const row = grid[r] || [];
    const tokens = row.map((c) => normalizeHeaderText(c));
    let score = 0;
    if (tokens.some((t) => t === 'nama' || t === 'nama lengkap' || t === 'nama siswa' || t === 'nama peserta didik')) score += 3;
    if (tokens.some((t) => t === 'nisn')) score += 3;
    if (tokens.some((t) => t === 'nipd' || t === 'nis')) score += 2;
    if (tokens.some((t) => t === 'jk' || t === 'jenis kelamin')) score += 2;
    if (tokens.some((t) => t === 'tempat lahir')) score += 2;
    if (tokens.some((t) => t === 'tanggal lahir')) score += 2;
    if (tokens.some((t) => t.includes('rombel') || t === 'kelas')) score += 2;
    if (tokens.some((t) => t === 'nik')) score += 1;
    if (score > bestScore) {
      bestScore = score;
      headerRowIdx = r;
    }
  }

  if (headerRowIdx === -1 || bestScore < 3) {
    throw new Error(
      'Header kolom Dapodik tidak terdeteksi. Pastikan file memiliki kolom seperti Nama, NISN, NIPD/NIS, JK, dan Rombel Saat Ini.'
    );
  }

  const headerRow = grid[headerRowIdx] || [];
  const parentRow = headerRowIdx > 0 ? grid[headerRowIdx - 1] || [] : [];

  const columnMap = new Map<number, CanonicalField>();
  const mappedNames = new Set<string>();
  const usedFieldsCount = new Map<CanonicalField, number>();

  for (let c = 0; c < headerRow.length; c++) {
    const colLabel = cleanCellStr(headerRow[c]);
    const parentLabel = cleanCellStr(parentRow[c]);
    let field = mapColumnToField(colLabel, parentLabel);

    // Fallback when Dapodik export doesn't include merged parent labels across colspans:
    // repeated "Nama", "Tahun Lahir", "Jenjang Pendidikan", "Pekerjaan", "Penghasilan", "NIK" appear in order: Ayah -> Ibu -> Wali
    if (!field) {
      const h = normalizeHeaderText(colLabel);
      if (h === 'nama') {
        const hasStudentName = [...columnMap.values()].includes('nama');
        const hasAyah = [...columnMap.values()].includes('namaAyah');
        const hasIbu = [...columnMap.values()].includes('namaIbu');
        if (!hasStudentName) field = 'nama';
        else if (!hasAyah) field = 'namaAyah';
        else if (!hasIbu) field = 'namaIbu';
        else field = 'namaWali';
      } else if (h === 'nik') {
        const hasStudentNik = [...columnMap.values()].includes('nik');
        const hasAyahNik = [...columnMap.values()].includes('nikAyah');
        const hasIbuNik = [...columnMap.values()].includes('nikIbu');
        if (!hasStudentNik) field = 'nik';
        else if (!hasAyahNik) field = 'nikAyah';
        else if (!hasIbuNik) field = 'nikIbu';
        else field = 'nikWali';
      } else if (h.includes('tahun lahir')) {
        if (![...columnMap.values()].includes('tahunLahirAyah')) field = 'tahunLahirAyah';
        else if (![...columnMap.values()].includes('tahunLahirIbu')) field = 'tahunLahirIbu';
        else field = 'tahunLahirWali';
      } else if (h.includes('pendidikan')) {
        if (![...columnMap.values()].includes('pendidikanAyah')) field = 'pendidikanAyah';
        else if (![...columnMap.values()].includes('pendidikanIbu')) field = 'pendidikanIbu';
        else field = 'pendidikanWali';
      } else if (h.includes('pekerjaan')) {
        if (![...columnMap.values()].includes('pekerjaanAyah')) field = 'pekerjaanAyah';
        else if (![...columnMap.values()].includes('pekerjaanIbu')) field = 'pekerjaanIbu';
        else field = 'pekerjaanWali';
      } else if (h.includes('penghasilan')) {
        if (![...columnMap.values()].includes('penghasilanAyah')) field = 'penghasilanAyah';
        else if (![...columnMap.values()].includes('penghasilanIbu')) field = 'penghasilanIbu';
        else field = 'penghasilanWali';
      }
    }

    if (field && field !== 'no') {
      const prevCount = usedFieldsCount.get(field) || 0;
      if (prevCount === 0) {
        columnMap.set(c, field);
        usedFieldsCount.set(field, 1);
        mappedNames.add(colLabel || field);
      }
    }
  }

  const rows: DapodikImportedStudent[] = [];
  let skippedRows = 0;
  const warnings: string[] = [];

  for (let r = headerRowIdx + 1; r < grid.length; r++) {
    const row = grid[r] || [];
    const nonEmptyCount = row.filter((v) => cleanCellStr(v) !== '').length;
    if (nonEmptyCount === 0) continue;

    const rec: Record<string, string> = {};
    for (const [colIdx, field] of columnMap.entries()) {
      const rawVal = row[colIdx];
      if (field === 'tanggalLahir') {
        rec[field] = normalizeDateCell(rawVal);
      } else {
        rec[field] = cleanCellStr(rawVal);
      }
    }

    const nama = (rec.nama || '').trim();
    const normNama = normalizeHeaderText(nama);
    if (
      !nama ||
      normNama === 'nama' ||
      normNama === 'total' ||
      normNama === 'jumlah' ||
      normNama.startsWith('dicetak dari dapodik')
    ) {
      skippedRows += 1;
      continue;
    }

    const nisn = rec.nisn || '-';
    const nis = rec.nis || (nisn !== '-' ? nisn : `DPD-${r + 1}`);
    const rombelDapodik = rec.rombelDapodik || 'Kelas 1A';
    const matchedKelasId = matchKelasFromRombel(rombelDapodik, kelasList);

    // Format comprehensive address if Dapodik separates Alamat + RT/RW + Dusun + Kelurahan + Kecamatan
    const addrParts = [rec.alamat];
    if (rec.rt || rec.rw) {
      addrParts.push(`RT ${rec.rt || '00'}/RW ${rec.rw || '00'}`);
    }
    if (rec.dusun) addrParts.push(rec.dusun);
    if (rec.kelurahan) addrParts.push(`Desa/Kel. ${rec.kelurahan}`);
    if (rec.kecamatan) addrParts.push(rec.kecamatan);
    const fullAlamat = addrParts.filter(Boolean).join(', ') || 'Desa Mulya Agung, Kec. Lalan';

    const namaOrangTua =
      rec.namaIbu || rec.namaAyah || rec.namaWali || '-';
    const noHpOrangTua = rec.noHpOrangTua || rec.noTelepon || '-';

    rows.push({
      nama,
      nis,
      nisn,
      kelasId: matchedKelasId,
      rombelDapodik,
      jenisKelamin: normalizeGender(rec.jenisKelamin),
      tempatLahir: rec.tempatLahir || 'Musi Banyuasin',
      tanggalLahir: rec.tanggalLahir || '2016-01-01',
      nik: rec.nik || '',
      noKk: rec.noKk || '',
      noAktaLahir: rec.noAktaLahir || '',
      agama: rec.agama || 'Islam',
      kewarganegaraan: rec.kewarganegaraan || 'WNI',
      alamat: fullAlamat,
      rt: rec.rt || '',
      rw: rec.rw || '',
      dusun: rec.dusun || '',
      kelurahan: rec.kelurahan || '',
      kecamatan: rec.kecamatan || '',
      kodePos: rec.kodePos || '',
      jenisTinggal: rec.jenisTinggal || '',
      alatTransportasi: rec.alatTransportasi || '',
      noTelepon: rec.noTelepon || '',
      email: rec.email || '',
      penerimaKps: rec.penerimaKps || '',
      noKps: rec.noKps || '',
      penerimaKip: rec.penerimaKip || '',
      noKip: rec.noKip || '',
      namaDiKip: rec.namaDiKip || '',
      noKks: rec.noKks || '',
      layakPip: rec.layakPip || '',
      alasanLayakPip: rec.alasanLayakPip || '',
      kebutuhanKhusus: rec.kebutuhanKhusus || 'Tidak ada',
      sekolahAsal: rec.sekolahAsal || '',
      anakKe: rec.anakKe || '',
      jumlahSaudara: rec.jumlahSaudara || '',
      beratBadan: rec.beratBadan || '',
      tinggiBadan: rec.tinggiBadan || '',
      lingkarKepala: rec.lingkarKepala || '',
      jarakSekolahKm: rec.jarakSekolahKm || '',
      namaAyah: rec.namaAyah || '',
      tahunLahirAyah: rec.tahunLahirAyah || '',
      pendidikanAyah: rec.pendidikanAyah || '',
      pekerjaanAyah: rec.pekerjaanAyah || '',
      penghasilanAyah: rec.penghasilanAyah || '',
      nikAyah: rec.nikAyah || '',
      namaIbu: rec.namaIbu || '',
      tahunLahirIbu: rec.tahunLahirIbu || '',
      pendidikanIbu: rec.pendidikanIbu || '',
      pekerjaanIbu: rec.pekerjaanIbu || '',
      penghasilanIbu: rec.penghasilanIbu || '',
      nikIbu: rec.nikIbu || '',
      namaWali: rec.namaWali || '',
      tahunLahirWali: rec.tahunLahirWali || '',
      pendidikanWali: rec.pendidikanWali || '',
      pekerjaanWali: rec.pekerjaanWali || '',
      penghasilanWali: rec.penghasilanWali || '',
      nikWali: rec.nikWali || '',
      namaOrangTua,
      noHpOrangTua,
      statusSiswa: normalizeStatusSiswa(rec.statusSiswa),
    });
  }

  if (rows.length === 0) {
    warnings.push('Tidak ditemukan baris peserta didik valid di bawah baris header.');
  }
  if (![...columnMap.values()].includes('nisn')) {
    warnings.push('Kolom NISN tidak ditemukan; sistem menggunakan pencocokan berdasarkan NIPD/NIS.');
  }
  if (![...columnMap.values()].includes('rombelDapodik')) {
    warnings.push('Kolom Rombel Saat Ini / Kelas tidak ditemukan; default ke Kelas 1A.');
  }

  return {
    sheetNames,
    selectedSheet,
    rows,
    detectedHeaderRow: headerRowIdx + 1,
    mappedColumns: Array.from(mappedNames),
    skippedRows,
    warnings,
  };
}

const DAPODIK_SUBHEADERS = [
  'No',
  'Nama',
  'NIPD',
  'JK',
  'NISN',
  'Tempat Lahir',
  'Tanggal Lahir',
  'NIK',
  'Agama',
  'Alamat',
  'RT',
  'RW',
  'Dusun',
  'Kelurahan',
  'Kecamatan',
  'Kode Pos',
  'Jenis Tinggal',
  'Alat Transportasi',
  'Telepon',
  'HP',
  'E-Mail',
  'Penerima KPS',
  'No. KPS',
  // Data Ayah (col 23..28)
  'Nama',
  'Tahun Lahir',
  'Jenjang Pendidikan',
  'Pekerjaan',
  'Penghasilan',
  'NIK',
  // Data Ibu (col 29..34)
  'Nama',
  'Tahun Lahir',
  'Jenjang Pendidikan',
  'Pekerjaan',
  'Penghasilan',
  'NIK',
  // Data Wali (col 35..40)
  'Nama',
  'Tahun Lahir',
  'Jenjang Pendidikan',
  'Pekerjaan',
  'Penghasilan',
  'NIK',
  // Lainnya (col 41..)
  'Rombel Saat Ini',
  'Penerima KIP',
  'Nomor KIP',
  'Nama di KIP',
  'Nomor KKS',
  'No Registrasi Akta Lahir',
  'Layak PIP (usulan dari sekolah)',
  'Alasan Layak PIP',
  'Kebutuhan Khusus',
  'Sekolah Asal',
  'Anak ke-berapa',
  'No KK',
  'Berat Badan',
  'Tinggi Badan',
  'Lingkar Kepala',
  'Jml. Saudara Kandung',
  'Jarak Rumah ke Sekolah (KM)',
  'Status Siswa',
];

function buildDapodikTopHeaderRow(): string[] {
  const top = new Array<string>(DAPODIK_SUBHEADERS.length).fill('');
  top[23] = 'Data Ayah';
  top[29] = 'Data Ibu';
  top[35] = 'Data Wali';
  return top;
}

export function downloadTemplateDapodikXlsx(): void {
  const rows: unknown[][] = [
    ['Daftar Peserta Didik'],
    ['SDN MULYA AGUNG - Kec. Lalan, Kab. Musi Banyuasin, Sumatera Selatan'],
    ['Template Resmi Impor Data Lengkap Unduhan Dapodik'],
    [],
    buildDapodikTopHeaderRow(),
    DAPODIK_SUBHEADERS,
    [
      1,
      'Bima Sakti Prakoso',
      '20260701',
      'L',
      '0198745120',
      'Musi Banyuasin',
      '2018-04-14',
      '1606091404180001',
      'Islam',
      'Jl. Poros Mulya Agung',
      '002',
      '001',
      'Dusun II',
      'Mulya Agung',
      'Kec. Lalan',
      '30758',
      'Bersama orang tua',
      'Jalan kaki',
      '',
      '081273451199',
      'bimasakti@siswa.sdnmulyaagung.sch.id',
      'Tidak',
      '',
      'Slamet Prakoso',
      '1987',
      'SMA / sederajat',
      'Petani',
      'Rp. 2.000.000 - Rp. 4.999.999',
      '1606090101870002',
      'Siti Rahayu',
      '1990',
      'SMA / sederajat',
      'Mengurus Rumah Tangga',
      'Tidak Berpenghasilan',
      '1606094205900003',
      '',
      '',
      '',
      '',
      '',
      '',
      'Kelas 2A',
      'Ya',
      'KIP-10645812-01',
      'Bima Sakti Prakoso',
      '',
      '1606-LU-18052018-0011',
      'Ya',
      'Pemegang PKH/KKS/KIP',
      'Tidak ada',
      'TK Pertiwi Mulya Agung',
      '2',
      '1606091202120005',
      '24',
      '122',
      '50',
      '1',
      '1',
      'Aktif',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
    { s: { r: 4, c: 23 }, e: { r: 4, c: 28 } },
    { s: { r: 4, c: 29 }, e: { r: 4, c: 34 } },
    { s: { r: 4, c: 35 }, e: { r: 4, c: 40 } },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Peserta Didik');
  XLSX.writeFile(wb, 'Template-Dapodik-Data-Lengkap-Siswa-SDN-Mulya-Agung.xlsx');
}

export function exportSiswaDapodikXlsx(siswaList: Siswa[], kelasList: Kelas[]): void {
  const kelasMap = new Map(kelasList.map((k) => [k.id, k.namaKelas]));
  const rows: unknown[][] = [
    ['Daftar Peserta Didik'],
    ['SDN MULYA AGUNG - Kec. Lalan, Kab. Musi Banyuasin, Sumatera Selatan'],
    [`Diekspor pada: ${new Date().toISOString().slice(0, 10)}`],
    [],
    buildDapodikTopHeaderRow(),
    DAPODIK_SUBHEADERS,
    ...siswaList.map((s, idx) => [
      idx + 1,
      s.nama,
      s.nis,
      s.jenisKelamin === 'Perempuan' ? 'P' : 'L',
      s.nisn,
      s.tempatLahir,
      s.tanggalLahir,
      s.nik || '',
      s.agama || 'Islam',
      s.alamat,
      s.rt || '',
      s.rw || '',
      s.dusun || '',
      s.kelurahan || '',
      s.kecamatan || '',
      s.kodePos || '',
      s.jenisTinggal || '',
      s.alatTransportasi || '',
      s.noTelepon || '',
      s.noHpOrangTua || '',
      s.email || '',
      s.penerimaKps || '',
      s.noKps || '',
      s.namaAyah || s.namaOrangTua || '',
      s.tahunLahirAyah || '',
      s.pendidikanAyah || '',
      s.pekerjaanAyah || '',
      s.penghasilanAyah || '',
      s.nikAyah || '',
      s.namaIbu || '',
      s.tahunLahirIbu || '',
      s.pendidikanIbu || '',
      s.pekerjaanIbu || '',
      s.penghasilanIbu || '',
      s.nikIbu || '',
      s.namaWali || '',
      s.tahunLahirWali || '',
      s.pendidikanWali || '',
      s.pekerjaanWali || '',
      s.penghasilanWali || '',
      s.nikWali || '',
      s.rombelDapodik || kelasMap.get(s.kelasId) || '',
      s.penerimaKip || '',
      s.noKip || '',
      s.namaDiKip || '',
      s.noKks || '',
      s.noAktaLahir || '',
      s.layakPip || '',
      s.alasanLayakPip || '',
      s.kebutuhanKhusus || '',
      s.sekolahAsal || '',
      s.anakKe || '',
      s.noKk || '',
      s.beratBadan || '',
      s.tinggiBadan || '',
      s.lingkarKepala || '',
      s.jumlahSaudara || '',
      s.jarakSekolahKm || '',
      s.statusSiswa,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
    { s: { r: 4, c: 23 }, e: { r: 4, c: 28 } },
    { s: { r: 4, c: 29 }, e: { r: 4, c: 34 } },
    { s: { r: 4, c: 35 }, e: { r: 4, c: 40 } },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Peserta Didik');
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Data-Siswa-Dapodik-SDN-Mulya-Agung-${stamp}.xlsx`);
}
