import { motion, useReducedMotion } from 'framer-motion';

type Props = { text: string; className?: string };

export default function BlurText({ text, className }: Props) {
  const reduce = useReducedMotion();
  const words = text.split(' ');

  // Aksesibilitas: reduced-motion → tampil utuh, tanpa gerak
  if (reduce) return <span className={className}>{text}</span>;

  return (
    // aria-label utuh + kata di-aria-hidden: screen reader baca normal, bukan per-kata
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            marginRight: '0.25em', // spasi antar-kata; biar bisa wrap di HP
            willChange: 'filter, transform, opacity',
          }}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 12 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
