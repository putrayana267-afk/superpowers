import { useEffect, useState } from 'react';
import {
  motion,
  animate,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Users,
  Wallet,
  TrendingUp,
  ChevronDown,
  Check,
} from 'lucide-react';

/**
 * PremiumHero — landing mandiri (dark, glassmorphic emerald) dengan panggung 3D
 * "orbital glide" + parallax kursor.
 *
 * Catatan desain: dashboard 3D adalah VISUAL DEKORATIF (pointer-events: none)
 * yang menganimasikan dirinya sendiri (toggle & dropdown auto-loop), sehingga
 * tidak ada bug hit-test/stacking saat ditekan. Kontrol yang benar-benar bisa
 * diklik (CTA) berada DI LUAR container transform 3D. Hanya transform & opacity
 * yang dianimasikan demi 60fps; menghormati prefers-reduced-motion.
 */

interface PremiumHeroProps {
  /** Aksi tombol utama (mis. masuk ke aplikasi). */
  onEnter?: () => void;
}

const EMERALD = '#10B981';
const CYAN = '#22D3EE';

// ---- Variants entrance (stagger + spring) --------------------------------

const stageStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const widgetItem: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 16 },
  },
};

const textStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 140, damping: 18 },
  },
};

// ---- Count-up ------------------------------------------------------------

function formatNumber(v: number, decimals = 0): string {
  return v.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function CountUp({
  to,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.8,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [to, duration, reduce]);

  return (
    <>
      {prefix}
      {formatNumber(value, decimals)}
      {suffix}
    </>
  );
}

// ---- KPI card (dekoratif) ------------------------------------------------

function KpiCard({
  icon,
  label,
  children,
  trend,
  depth,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  trend: string;
  depth: number;
  accent: string;
}) {
  return (
    <motion.div
      variants={widgetItem}
      style={{ z: depth, transformStyle: 'preserve-3d' }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ boxShadow: `inset 0 0 18px ${accent}1f` }}
      />
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${accent}1f`, color: accent }}
        >
          {icon}
        </span>
        <span className="text-xs font-medium text-white/50">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold tracking-tight text-white">
        {children}
      </div>
      <div className="mt-1 text-xs font-medium" style={{ color: accent }}>
        {trend}
      </div>
    </motion.div>
  );
}

// ---- Line / area chart (self-drawing stroke) -----------------------------

function LineChart({ depth }: { depth: number }) {
  const reduce = useReducedMotion();
  const line =
    'M0,96 C28,86 44,62 72,60 C100,58 116,84 144,80 C172,76 188,40 216,36 C244,32 262,52 288,44 C304,39 312,28 320,24';
  const area = `${line} L320,120 L0,120 Z`;

  return (
    <motion.div
      variants={widgetItem}
      style={{ z: depth, transformStyle: 'preserve-3d' }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">Pertumbuhan</span>
        <span className="text-xs font-medium text-emerald-300">+24,8%</span>
      </div>
      <svg
        viewBox="0 0 320 120"
        className="h-32 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="ph-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={EMERALD} />
            <stop offset="100%" stopColor={CYAN} />
          </linearGradient>
          <linearGradient id="ph-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={EMERALD} stopOpacity="0.35" />
            <stop offset="100%" stopColor={EMERALD} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#ph-area)"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="url(#ph-stroke)"
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${EMERALD}aa)` }}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.5 }}
        />
      </svg>
    </motion.div>
  );
}

// ---- Bar chart (grows from bottom, staggered) ----------------------------

function BarChart({ depth }: { depth: number }) {
  const reduce = useReducedMotion();
  const bars = [40, 62, 50, 78, 58, 90, 72];
  return (
    <motion.div
      variants={widgetItem}
      style={{ z: depth, transformStyle: 'preserve-3d' }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
    >
      <div className="mb-3 text-sm font-semibold text-white/80">Aktivitas</div>
      <div className="flex h-28 items-end justify-between gap-2">
        {bars.map((h, idx) => (
          <motion.div
            key={idx}
            className="w-full rounded-md"
            style={{
              height: `${h}%`,
              transformOrigin: 'bottom',
              background: `linear-gradient(to top, ${EMERALD}, ${CYAN})`,
              boxShadow: `0 0 12px ${EMERALD}44`,
            }}
            initial={reduce ? false : { scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
              delay: reduce ? 0 : 0.9 + idx * 0.08,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ---- Toggle dekoratif (auto-loop on↔off) ---------------------------------

function DecorToggle() {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setOn((v) => !v), 2200);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div
      className="relative h-6 w-11 flex-shrink-0 overflow-hidden rounded-full bg-white/15"
      aria-hidden
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: EMERALD }}
        animate={{ opacity: on ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.span
        className="absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow"
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      />
    </div>
  );
}

// ---- Dropdown dekoratif (auto-loop buka/tutup, cascading) ----------------

function DecorDropdown() {
  const reduce = useReducedMotion();
  const items = ['Hari ini', '7 hari', '30 hari'];
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(1);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setOpen((o) => {
        if (o) setSel((s) => (s + 1) % items.length);
        return !o;
      });
    }, 2600);
    return () => window.clearInterval(id);
    // items konstan; sengaja hanya bergantung pada reduce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <div className="relative" aria-hidden>
      <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur">
        {items[sel]}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            // translateZ tinggi + zIndex agar SELALU di atas kartu lain
            style={{ z: 90, zIndex: 50 }}
            className="absolute right-0 mt-2 w-32 overflow-hidden rounded-xl border border-white/10 bg-[#11151b] p-1 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
          >
            {items.map((it, idx) => (
              <motion.li
                key={it}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-white/70"
              >
                {it}
                {idx === sel && <Check className="h-3.5 w-3.5 text-emerald-400" />}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Panggung 3D dekoratif (pointer-events: none) ------------------------

function Stage() {
  const reduce = useReducedMotion();

  // Parallax kursor hanya untuk perangkat berpointer (mouse), bukan sentuh.
  const [pointerFine, setPointerFine] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const apply = () => setPointerFine(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  const parallaxOn = pointerFine && !reduce;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 18,
  });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 18,
  });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!parallaxOn) return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  }
  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    // Lapisan parallax menangkap gerak mouse (punya pointer-events),
    // tetapi seluruh mockup di dalamnya dekoratif (pointer-events: none).
    <div
      className="relative"
      style={{ perspective: 1200 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <motion.div
        className="pointer-events-none"
        style={{
          rotateX: parallaxOn ? rotX : 0,
          rotateY: parallaxOn ? rotY : 0,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Orbital glide: oscillate loop */}
        <motion.div
          style={{ transformStyle: 'preserve-3d' }}
          animate={
            reduce ? undefined : { rotateY: [-8, 8, -8], rotateX: [-4, 4, -4] }
          }
          transition={{ duration: 16, ease: 'easeInOut', repeat: Infinity }}
        >
          {/* Bayangan ambient di bawah panel */}
          <div
            className="pointer-events-none absolute -inset-4 rounded-[2rem] blur-2xl"
            style={{
              background:
                'radial-gradient(60% 60% at 50% 60%, rgba(16,185,129,0.25), transparent 70%)',
              transform: 'translateZ(-60px)',
            }}
          />

          {/* Panel dashboard */}
          <motion.div
            variants={stageStagger}
            initial={reduce ? false : 'hidden'}
            animate="show"
            style={{ transformStyle: 'preserve-3d' }}
            className="relative rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header mockup — z paling tinggi agar dropdown-nya di atas kartu */}
            <motion.div
              variants={widgetItem}
              style={{ z: 60, transformStyle: 'preserve-3d', zIndex: 40 }}
              className="relative mb-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[#0F1115]"
                  style={{
                    background: `linear-gradient(135deg, ${EMERALD}, ${CYAN})`,
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-white/80">
                  Ikhtisar
                </span>
              </div>
              <div className="flex items-center gap-3">
                <DecorToggle />
                <DecorDropdown />
              </div>
            </motion.div>

            {/* KPI cards (depth lebih rendah dari header/dropdown) */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              <KpiCard
                icon={<Users className="h-4 w-4" />}
                label="Pengguna"
                trend="+12,4%"
                depth={16}
                accent={EMERALD}
              >
                <CountUp to={18240} />
              </KpiCard>
              <KpiCard
                icon={<Wallet className="h-4 w-4" />}
                label="Pendapatan"
                trend="+8,9%"
                depth={24}
                accent={CYAN}
              >
                <CountUp to={92.4} decimals={1} prefix="Rp" suffix="jt" />
              </KpiCard>
              <KpiCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Konversi"
                trend="+3,2%"
                depth={16}
                accent={EMERALD}
              >
                <CountUp to={6.8} decimals={1} suffix="%" />
              </KpiCard>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <LineChart depth={20} />
              </div>
              <BarChart depth={20} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ---- Main component ------------------------------------------------------

export function PremiumHero({ onEnter }: PremiumHeroProps) {
  const reduce = useReducedMotion();

  const enter =
    onEnter ??
    (() => {
      window.location.hash = '';
      window.location.reload();
    });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0F1115] text-white">
      {/* Glow latar emerald + aksen cyan */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 500px at 78% 8%, rgba(16,185,129,0.20), transparent 60%),' +
            'radial-gradient(700px 460px at 12% 90%, rgba(34,211,238,0.14), transparent 60%),' +
            'radial-gradient(600px 400px at 50% 50%, rgba(16,185,129,0.06), transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
        {/* Teks + CTA — kontrol asli, DI LUAR transform 3D, pointer-events normal */}
        <motion.div
          variants={textStagger}
          initial={reduce ? false : 'hidden'}
          animate="show"
          className="relative z-10 max-w-xl"
        >
          <motion.div
            variants={textItem}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Dashboard SaaS · Realtime
          </motion.div>
          <motion.h1
            variants={textItem}
            className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            Pantau semuanya dalam{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${EMERALD}, ${CYAN})`,
              }}
            >
              satu layar
            </span>
          </motion.h1>
          <motion.p
            variants={textItem}
            className="mt-5 text-base leading-relaxed text-white/60 sm:text-lg"
          >
            Analitik mulus, animasi 60fps, dan tampilan glassmorphic yang mewah —
            dibangun nyata dengan kode, bukan video.
          </motion.p>
          <motion.div
            variants={textItem}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <motion.button
              type="button"
              onClick={enter}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[#0F1115]"
              style={{
                background: `linear-gradient(90deg, ${EMERALD}, ${CYAN})`,
                boxShadow: `0 10px 30px ${EMERALD}55`,
              }}
            >
              Masuk Aplikasi
              <ArrowRight className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              onClick={enter}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 backdrop-blur hover:bg-white/[0.08]"
            >
              Lihat Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Panggung 3D dekoratif */}
        <Stage />
      </div>
    </div>
  );
}

export default PremiumHero;
