// Parity gate Bank Soal (SPEC §7): blok schema+prompt bank-soal HARUS byte-identik
// antara src/features/tools/bankSoal.ts (native) dan api/generate.ts (web, inline).
// Perbandingan MENTAH — TANPA normalisasi/trim (agar bisa diverifikasi independen).
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const START = '// <BANKSOAL-PARITY-START>';
const END = '// <BANKSOAL-PARITY-END>';

const FILES = {
  src: 'src/features/tools/bankSoal.ts',
  api: 'api/generate.ts',
};

function extract(path) {
  const text = readFileSync(path, 'utf8');
  const i = text.indexOf(START);
  const j = text.indexOf(END);
  if (i === -1 || j === -1 || j <= i) {
    console.error(`Penanda parity tidak lengkap / urutan salah di ${path}.`);
    process.exit(1);
  }
  // Inklusif kedua penanda; mentah apa adanya.
  return text.slice(i, j + END.length);
}

const src = extract(FILES.src);
const api = extract(FILES.api);
const hSrc = createHash('sha256').update(src, 'utf8').digest('hex');
const hApi = createHash('sha256').update(api, 'utf8').digest('hex');

if (src !== api) {
  console.error('Schema/prompt bank-soal DRIFT antara api/ dan src/. Samakan.');
  console.error(`  src sha256: ${hSrc}`);
  console.error(`  api sha256: ${hApi}`);
  process.exit(1);
}

console.log('PARITY OK');
console.log(`  blok: ${src.length} byte`);
console.log(`  sha256: ${hSrc}`);
process.exit(0);
