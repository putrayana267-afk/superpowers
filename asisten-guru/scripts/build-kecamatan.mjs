/**
 * Bangun public/data/kecamatan.json dari dataset ter-pin
 * emsifa/api-wilayah-indonesia @ ebc5151 (34 provinsi, pra-pemekaran Papua 2022).
 *
 * Jalankan: NODE_USE_ENV_PROXY=1 node scripts/build-kecamatan.mjs
 * SEMUA nama wilayah berasal dari CSV sumber — tidak ada yang diketik manual.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE =
  'https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/ebc5151c762d46d89c0679f5d61e6b5bb6db8c40/data';

/** Peta provinsi → zona (embed persis dari spesifikasi). */
const ZONA_PROVINSI = {
  // WIB
  ACEH: 'WIB',
  'SUMATERA UTARA': 'WIB',
  'SUMATERA BARAT': 'WIB',
  RIAU: 'WIB',
  JAMBI: 'WIB',
  'SUMATERA SELATAN': 'WIB',
  BENGKULU: 'WIB',
  LAMPUNG: 'WIB',
  'KEPULAUAN BANGKA BELITUNG': 'WIB',
  'KEPULAUAN RIAU': 'WIB',
  'DKI JAKARTA': 'WIB',
  'JAWA BARAT': 'WIB',
  'JAWA TENGAH': 'WIB',
  'DI YOGYAKARTA': 'WIB',
  'JAWA TIMUR': 'WIB',
  BANTEN: 'WIB',
  'KALIMANTAN BARAT': 'WIB',
  'KALIMANTAN TENGAH': 'WIB',
  // WITA
  BALI: 'WITA',
  'NUSA TENGGARA BARAT': 'WITA',
  'NUSA TENGGARA TIMUR': 'WITA',
  'KALIMANTAN SELATAN': 'WITA',
  'KALIMANTAN TIMUR': 'WITA',
  'KALIMANTAN UTARA': 'WITA',
  'SULAWESI UTARA': 'WITA',
  'SULAWESI TENGAH': 'WITA',
  'SULAWESI SELATAN': 'WITA',
  'SULAWESI TENGGARA': 'WITA',
  GORONTALO: 'WITA',
  'SULAWESI BARAT': 'WITA',
  // WIT
  MALUKU: 'WIT',
  'MALUKU UTARA': 'WIT',
  'PAPUA BARAT': 'WIT',
  PAPUA: 'WIT',
};

function gagal(pesan) {
  console.error(`VALIDASI GAGAL: ${pesan}`);
  process.exit(1);
}

async function unduhCsv(nama) {
  const url = `${BASE}/${nama}`;
  const res = await fetch(url);
  if (!res.ok) gagal(`fetch ${nama} → HTTP ${res.status}`);
  const teks = await res.text();
  return teks
    .split('\n')
    .map((b) => b.replace(/\r$/, '').trim())
    .filter((b) => b !== '');
}

/** Parse baris CSV sederhana: id,parent?,NAMA (nama boleh mengandung koma → gabung sisa). */
function parseBaris(baris, kolomNama) {
  const bagian = baris.split(',');
  return {
    kolom: bagian.slice(0, kolomNama),
    nama: bagian.slice(kolomNama).join(',').trim(),
  };
}

function titleCase(s) {
  return s
    .toLowerCase()
    .replace(/(^|[\s\-/.('])(\p{L})/gu, (m, sep, huruf) => sep + huruf.toUpperCase());
}

function namaKabupaten(nama) {
  if (nama.startsWith('KABUPATEN ')) {
    return `Kab. ${titleCase(nama.slice('KABUPATEN '.length))}`;
  }
  if (nama.startsWith('KOTA ')) {
    return `Kota ${titleCase(nama.slice('KOTA '.length))}`;
  }
  return titleCase(nama);
}

const [provLines, regLines, distLines] = await Promise.all([
  unduhCsv('provinces.csv'),
  unduhCsv('regencies.csv'),
  unduhCsv('districts.csv'),
]);

// ── Validasi WAJIB ──────────────────────────────────────────────────────────
if (provLines.length < 33 || provLines.length > 34)
  gagal(`provinces ${provLines.length} baris (harap 33–34)`);
if (regLines.length < 513 || regLines.length > 514)
  gagal(`regencies ${regLines.length} baris (harap 513–514)`);
if (distLines.length < 7213 || distLines.length > 7215)
  gagal(`districts ${distLines.length} baris (harap 7213–7215)`);
if (!distLines.some((b) => b.includes('CILEUNGSI') && b.split(',')[1] === '3201'))
  gagal('districts tidak memuat "CILEUNGSI" dengan regId 3201');
if (!regLines.some((b) => b.startsWith('3201,32,KABUPATEN BOGOR')))
  gagal('regencies tidak memuat "3201,32,KABUPATEN BOGOR"');

// ── Join ────────────────────────────────────────────────────────────────────
const zonaProv = new Map(); // provId → zona
for (const baris of provLines) {
  const { kolom, nama } = parseBaris(baris, 1);
  const zona = ZONA_PROVINSI[nama];
  if (!zona) gagal(`provinsi "${nama}" tidak ada di peta zona`);
  zonaProv.set(kolom[0], zona);
}

const kabupaten = new Map(); // regId → { k, z }
for (const baris of regLines) {
  const { kolom, nama } = parseBaris(baris, 2);
  const [regId, provId] = kolom;
  const zona = zonaProv.get(provId);
  if (!zona) gagal(`regency ${regId}: provId ${provId} tak dikenal`);
  kabupaten.set(regId, { k: namaKabupaten(nama), z: zona });
}

const entri = [];
for (const baris of distLines) {
  const { kolom, nama } = parseBaris(baris, 2);
  const regId = kolom[1];
  const kab = kabupaten.get(regId);
  if (!kab) gagal(`district "${nama}": regId ${regId} tak dikenal`);
  entri.push({ n: titleCase(nama), k: kab.k, z: kab.z });
}
entri.sort((a, b) => a.n.localeCompare(b.n, 'id'));

// ── Tulis ───────────────────────────────────────────────────────────────────
const keluaran = {
  v: 1,
  sumber: {
    repo: 'emsifa/api-wilayah-indonesia',
    commit: 'ebc5151c762d46d89c0679f5d61e6b5bb6db8c40',
    basis: '34 provinsi (pra-pemekaran Papua 2022)',
    diambil: '2026-07-03',
  },
  entri,
};

const tujuan = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'data',
  'kecamatan.json',
);
mkdirSync(dirname(tujuan), { recursive: true });
writeFileSync(tujuan, JSON.stringify(keluaran));
console.log(`OK: ${entri.length} entri kecamatan → ${tujuan}`);
