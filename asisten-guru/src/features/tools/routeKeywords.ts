/**
 * Lapis 1 pemilih alat: cocok-kata MURNI (client-only, TANPA AI/API/data).
 * `matchToolByKeyword(input)` → SATU dari 9 toolId registry, atau null.
 *
 * Uji mandiri (semua HARUS lolos — lihat verifikasi manual di PR):
 *   "buatkan soal ulangan matematika"  -> bank-soal
 *   "tolong bikin modul ajar"          -> modul-ajar
 *   "rpp bahasa indonesia"             -> modul-ajar
 *   "lembar kerja siswa kelas 5"       -> lkpd
 *   "kisi-kisi soal pas"               -> kisi-kisi   (greedy: "kisi kisi" menang)
 *   "chat ortu tentang PR"             -> komunikasi-ortu
 *   "sederhanakan materi fotosintesis" -> sederhana
 *   "e-rapor kelas 6"                  -> rapor
 *   "penilaian harian"                 -> null        (kata sengaja dibuang)
 *   "nilai siswa"                      -> null
 *   "kurikulum merdeka"                -> null        (JANGAN kembalikan 'kurikulum')
 */

/** Peta toolId → kata pemicu (URUT = prioritas seri-terakhir). Disalin apa adanya. */
const PETA: Array<{ toolId: string; triggers: string[] }> = [
  {
    toolId: 'modul-ajar',
    triggers: [
      'modul',
      'modul ajar',
      'rpp',
      'atp',
      'prota',
      'promes',
      'prosem',
      'kosp',
      'rencana pembelajaran',
      'pjbl',
      'pbl',
      'metode pembelajaran',
      'model pembelajaran',
    ],
  },
  {
    toolId: 'lkpd',
    triggers: [
      'lkpd',
      'lks',
      'las',
      'lembar kerja',
      'lembar kerja peserta didik',
    ],
  },
  {
    toolId: 'bank-soal',
    triggers: [
      'soal ujian',
      'ulangan',
      'uh',
      'pts',
      'pas',
      'sts',
      'sas',
      'uas',
      'uts',
      'ukk',
      'pilihan ganda',
      'tryout',
      'kuis',
      'tes tulis',
    ],
  },
  {
    toolId: 'kisi-kisi',
    triggers: ['kisi', 'kisi-kisi', 'kisi2', 'kartu soal'],
  },
  {
    toolId: 'rubrik',
    triggers: [
      'rubrik',
      'kktp',
      'kkm',
      'pedoman penskoran',
      'pedoman penilaian',
      'deskriptor',
      'lembar observasi',
    ],
  },
  {
    toolId: 'sederhana',
    triggers: [
      'sederhanakan',
      'ringkas',
      'rangkum',
      'resume',
      'rangkuman materi',
      'peta konsep',
      'handout',
    ],
  },
  {
    toolId: 'ide-kegiatan',
    triggers: [
      'ice breaker',
      'icebreaker',
      'energizer',
      'yel-yel',
      'yel2',
      'apersepsi',
      'game pembelajaran',
      'permainan kelas',
    ],
  },
  {
    toolId: 'rapor',
    triggers: [
      'rapor',
      'raport',
      'rapot',
      'erapor',
      'e-rapor',
      'deskripsi rapor',
      'catatan wali kelas',
    ],
  },
  {
    toolId: 'komunikasi-ortu',
    triggers: [
      'ortu',
      'orang tua',
      'wali murid',
      'walimurid',
      'wa ortu',
      'chat ortu',
      'pesan whatsapp orang tua',
      'surat pemberitahuan',
    ],
  },
];

/** "Noise words" yang dibuang HANYA dari depan (frasa terpanjang dulu). */
const NOISE = [
  'saya butuh',
  'tolong',
  'buatkan',
  'bikinin',
  'buatlah',
  'carikan',
  'bikin',
  'buat',
  'cari',
  'dong',
  'minta',
  'siapkan',
];

/**
 * Normalisasi: lowercase; semua karakter selain huruf/angka → spasi (hyphen juga);
 * rapatkan spasi; trim. Dipakai sama untuk input & tiap kata-pemicu.
 */
function tokenize(s: string): string[] {
  const norm = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return norm ? norm.split(' ') : [];
}

/** True bila deret token `seq` muncul berurutan & utuh di `tokens`. */
function containsSequence(tokens: string[], seq: string[]): boolean {
  if (seq.length === 0 || seq.length > tokens.length) return false;
  for (let i = 0; i + seq.length <= tokens.length; i++) {
    let ok = true;
    for (let j = 0; j < seq.length; j++) {
      if (tokens[i + j] !== seq[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

// Pra-tokenisasi noise (urut panjang-token menurun agar frasa terpanjang menang).
const NOISE_TOKENS = NOISE.map(tokenize).sort((a, b) => b.length - a.length);

/** Buang noise words dari DEPAN saja, berulang, frasa terpanjang lebih dulu. */
function stripLeadingNoise(tokens: string[]): string[] {
  let out = tokens;
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of NOISE_TOKENS) {
      if (n.length > 0 && n.every((t, i) => out[i] === t) && n.length <= out.length) {
        out = out.slice(n.length);
        changed = true;
        break;
      }
    }
  }
  return out;
}

/**
 * Cocokkan input bahasa-bebas ke satu toolId, atau null.
 * Frasa terpanjang menang; seri → panjang karakter → urutan peta.
 */
export function matchToolByKeyword(input: string): string | null {
  const tokens = stripLeadingNoise(tokenize(input));
  if (tokens.length === 0) return null;

  let best: {
    toolId: string;
    tokenCount: number;
    charLen: number;
    order: number;
  } | null = null;

  for (let order = 0; order < PETA.length; order++) {
    const { toolId, triggers } = PETA[order];
    for (const trigger of triggers) {
      const seq = tokenize(trigger);
      if (!containsSequence(tokens, seq)) continue;
      const charLen = seq.join(' ').length;
      if (
        best === null ||
        seq.length > best.tokenCount ||
        (seq.length === best.tokenCount && charLen > best.charLen) ||
        (seq.length === best.tokenCount &&
          charLen === best.charLen &&
          order < best.order)
      ) {
        best = { toolId, tokenCount: seq.length, charLen, order };
      }
    }
  }

  return best ? best.toolId : null;
}
