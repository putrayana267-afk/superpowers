import { useMemo, useState } from 'react';
import {
  MagnifyingGlass,
  ArrowSquareOut,
  BookBookmark,
  Buildings,
  ClipboardText,
  Images,
  Lock,
  Tray,
  Books,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { GlassCard } from './GlassCard';
import { EmptyState } from './EmptyState';
import { cn } from '../lib/cn';

/** Atribut wajib untuk tautan eksternal yang aman. */
const EXTERNAL = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

interface ResourceLink {
  name: string;
  url: string;
  desc?: string;
  alt?: { label: string; url: string };
  /** Tampilkan label "perlu akun" bila sumber butuh login. */
  needsAccount?: boolean;
}

interface KitabRumpun {
  rumpun: string;
  kitab: string[];
}

interface Section {
  id: string;
  title: string;
  subtitle: string;
  icon: Icon;
  links: ResourceLink[];
  kitab?: KitabRumpun[];
}

/** Tautan pencarian Maktabah Syamilah (tidak mengarang URL pencarian). */
const SYAMILAH_URL = 'https://shamela.ws';

const SECTIONS: Section[] = [
  {
    id: 'umum',
    title: 'Buku Teks, Modul Ajar & Perangkat',
    subtitle: 'Umum / Kemendikbud',
    icon: Buildings,
    links: [
      {
        name: 'SIBI – Sistem Informasi Perbukuan Indonesia',
        url: 'https://buku.kemendikdasmen.go.id/katalog',
        desc: 'Buku teks Kurikulum Merdeka gratis, filter per jenjang/kelas/mapel.',
        alt: {
          label: 'Alternatif',
          url: 'https://buku.kemdikbud.go.id/katalog',
        },
      },
      {
        name: 'Platform Merdeka Mengajar (PMM)',
        url: 'https://guru.kemdikbud.go.id',
        desc: 'Perangkat ajar, modul ajar, dan video pembelajaran untuk guru.',
        needsAccount: true,
      },
      {
        name: 'Rumah Belajar',
        url: 'https://belajar.kemdikbud.go.id',
        desc: 'Bahan ajar, sumber belajar, dan bank soal dari Kemendikbud.',
      },
    ],
  },
  {
    id: 'madrasah',
    title: 'Madrasah & Pesantren',
    subtitle: 'Kemenag',
    icon: BookBookmark,
    links: [
      {
        name: 'SIKURMA – Sistem Kurikulum Madrasah',
        url: 'https://sikurma.kemenag.go.id',
        desc:
          'Buku PAI & Bahasa Arab MI/MTs/MA + MA Peminatan Keagamaan ' +
          "(Al-Qur'an Hadis, Akidah Akhlak, Fikih, SKI, Bahasa Arab).",
      },
      {
        name: 'e-Learning Madrasah',
        url: 'https://elearning.kemenag.go.id',
        desc: 'LMS madrasah: RPP, CBT, dan Guru Berbagi.',
        needsAccount: true,
      },
      {
        name: 'Pendis Kemenag',
        url: 'https://pendis.kemenag.go.id',
        desc: 'Informasi & regulasi pendidikan Islam (termasuk KMA).',
      },
      {
        name: 'Maktabah Syamilah Online',
        url: SYAMILAH_URL,
        desc: 'Ribuan kitab kuning klasik berbahasa Arab, bisa dibaca online.',
        alt: { label: 'Alternatif', url: 'https://ketabonline.com' },
      },
    ],
    kitab: [
      { rumpun: 'Nahwu', kitab: ['Al-Ajurrumiyah', 'Al-Imrithi', 'Alfiyah Ibnu Malik'] },
      { rumpun: 'Shorof', kitab: ['Al-Amtsilah At-Tashrifiyah', 'Nazham Maqsud'] },
      {
        rumpun: 'Fikih',
        kitab: ['Safinatun Najah', 'Matan Taqrib', 'Fathul Qorib', "Fathul Mu'in"],
      },
      { rumpun: 'Ushul Fikih', kitab: ['Al-Waraqat', 'Lubbul Ushul'] },
      { rumpun: 'Tauhid', kitab: ['Aqidatul Awam', 'Kifayatul Awam', 'Jawharatut Tauhid'] },
      {
        rumpun: 'Akhlak/Tasawuf',
        kitab: ["Ta'lim Muta'allim", 'Bidayatul Hidayah', 'Akhlakul Banin'],
      },
      {
        rumpun: 'Hadis',
        kitab: ["Arba'in Nawawiyah", 'Bulughul Maram', 'Riyadhus Shalihin'],
      },
      { rumpun: 'Tafsir', kitab: ['Tafsir Jalalain', 'Tafsir Ibnu Katsir'] },
    ],
  },
  {
    id: 'asesmen',
    title: 'Bank Soal & Asesmen',
    subtitle: 'AKM / ANBK / Ujian',
    icon: ClipboardText,
    links: [
      {
        name: 'Pusmendik – Pusat Asesmen Pendidikan',
        url: 'https://pusmendik.kemdikbud.go.id',
        desc: 'Pusat informasi asesmen nasional dan perangkatnya.',
      },
      {
        name: 'Asesmenpedia',
        url: 'https://pusmendik.kemdikbud.go.id/asesmenpedia',
        desc: 'Bank soal/butir asesmen dari Pusmendik.',
      },
      {
        name: 'Simulasi / Contoh AKM',
        url: 'https://pusmendik.kemdikbud.go.id/an/simulasi/akm',
        desc: 'Simulasi dan contoh soal AKM yang terbuka untuk publik.',
      },
      {
        name: 'ANBK',
        url: 'https://anbk.kemdikbud.go.id',
        desc: 'Portal Asesmen Nasional Berbasis Komputer.',
      },
      {
        name: 'Rumah Belajar – Bank Soal',
        url: 'https://belajar.kemdikbud.go.id',
        desc: 'Kumpulan bank soal di portal Rumah Belajar.',
      },
    ],
  },
  {
    id: 'media',
    title: 'Media Belajar Gratis & Legal',
    subtitle: 'Gambar, Video, PPT',
    icon: Images,
    links: [
      {
        name: 'Wikimedia Commons',
        url: 'https://commons.wikimedia.org',
        desc: 'Gambar & media bebas/Creative Commons.',
      },
      {
        name: 'Pexels',
        url: 'https://pexels.com',
        desc: 'Foto & video gratis untuk dipakai bebas.',
      },
      {
        name: 'Unsplash',
        url: 'https://unsplash.com',
        desc: 'Foto gratis berkualitas tinggi.',
      },
      {
        name: 'Pixabay',
        url: 'https://pixabay.com',
        desc: 'Gambar, ilustrasi, dan vektor gratis.',
      },
      {
        name: 'Canva for Education',
        url: 'https://www.canva.com/education',
        desc: 'Template & PPT gratis untuk guru.',
        needsAccount: true,
      },
    ],
  },
];

function includes(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q);
}

/** Hasil filter sebuah section sesuai query. */
function filterSection(section: Section, q: string) {
  if (!q) return { links: section.links, kitab: section.kitab ?? [] };

  const links = section.links.filter(
    (l) => includes(l.name, q) || (l.desc ? includes(l.desc, q) : false),
  );
  const kitab = (section.kitab ?? [])
    .map((r) =>
      includes(r.rumpun, q)
        ? r
        : { rumpun: r.rumpun, kitab: r.kitab.filter((k) => includes(k, q)) },
    )
    .filter((r) => r.kitab.length > 0);

  return { links, kitab };
}

export function Perpustakaan() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      SECTIONS.map((section) => ({
        section,
        ...filterSection(section, q),
      })).filter((s) => s.links.length > 0 || s.kitab.length > 0),
    [q],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <MagnifyingGlass
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-deep/60"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari sumber atau nama kitab…"
          aria-label="Cari sumber atau kitab"
          className={cn(
            'w-full rounded-xl border border-white/10 bg-emerald-soft/70 py-2.5 pl-10 pr-3.5 text-sm text-ink',
            'placeholder:text-ink/40 shadow-sm backdrop-blur transition',
            'focus:border-emerald-primary focus:bg-emerald-soft focus:outline-none focus:ring-2 focus:ring-emerald-primary/30',
          )}
        />
      </div>

      {filtered.length === 0 ? (
        <GlassCard animate>
          <EmptyState
            icon={<Tray className="h-7 w-7" />}
            title="Tidak ada hasil"
            description={`Tidak ada sumber atau kitab yang cocok dengan "${query}".`}
          />
        </GlassCard>
      ) : (
        filtered.map(({ section, links, kitab }) => {
          const SectionIcon = section.icon;
          return (
            <GlassCard key={section.id} className="border border-white/10" animate>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
                  <SectionIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-emerald-deep">
                    {section.title}
                  </h2>
                  <p className="text-xs uppercase tracking-wider text-emerald-deep/60">
                    {section.subtitle}
                  </p>
                </div>
              </div>

              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li
                    key={link.url}
                    className="rounded-xl border border-white/50 bg-white/5 p-4 backdrop-blur"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-ink/90">
                            {link.name}
                          </p>
                          {link.needsAccount && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold-deep-text">
                              <Lock className="h-3 w-3" />
                              perlu akun
                            </span>
                          )}
                        </div>
                        {link.desc && (
                          <p className="mt-1 text-sm text-ink/75">{link.desc}</p>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <a
                          href={link.url}
                          {...EXTERNAL}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-on-fill transition hover:bg-brand-hover"
                        >
                          Buka
                          <ArrowSquareOut className="h-3.5 w-3.5" />
                        </a>
                        {link.alt && (
                          <a
                            href={link.alt.url}
                            {...EXTERNAL}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-deep/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-emerald-deep transition hover:bg-white/10"
                          >
                            {link.alt.label}
                            <ArrowSquareOut className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {kitab.length > 0 && (
                <div className="mt-5">
                  <p className="mb-3 text-sm font-semibold text-emerald-deep">
                    Kitab klasik populer per rumpun
                  </p>
                  <div className="flex flex-col gap-3">
                    {kitab.map((r) => (
                      <div key={r.rumpun}>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
                          {r.rumpun}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {r.kitab.map((k) => (
                            <a
                              key={k}
                              href={SYAMILAH_URL}
                              {...EXTERNAL}
                              title={`Cari ${k} di Syamilah`}
                              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-deep/20 bg-white/5 px-3 py-1 text-xs text-ink/90 transition hover:bg-emerald-deep/15"
                            >
                              {k}
                              <MagnifyingGlass className="h-3 w-3 text-emerald-deep/70" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-ink/50">
                    Klik nama kitab untuk membukanya di Maktabah Syamilah
                    (shamela.ws).
                  </p>
                </div>
              )}
            </GlassCard>
          );
        })
      )}
    </div>
  );
}

/** Ikon untuk entri navigasi Perpustakaan. */
export const PerpustakaanIcon = Books;
