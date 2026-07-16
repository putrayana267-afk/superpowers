import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/** Picu unduhan sebuah Blob dengan nama file tertentu. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Beri waktu browser memproses sebelum mencabut URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Native: tulis berkas ke Cache lalu buka share sheet. */
async function saveAndShareNative(
  filename: string,
  data: string,
  title: string,
): Promise<void> {
  await Filesystem.writeFile({
    path: filename,
    data,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
    recursive: true,
  });
  const { uri } = await Filesystem.getUri({
    directory: Directory.Cache,
    path: filename,
  });
  await Share.share({ title, url: uri });
}

/**
 * Native untuk berkas BINER (mis. .docx): tulis base64 ke Cache TANPA `encoding`,
 * lalu buka share sheet. Menyetel `encoding` (UTF-8) akan merusak berkas biner —
 * karena itu sengaja dibiarkan kosong agar Capacitor menulisnya sebagai biner.
 */
async function saveAndShareNativeBinary(
  filename: string,
  base64Data: string,
  title: string,
): Promise<void> {
  await Filesystem.writeFile({
    path: filename,
    data: base64Data,
    directory: Directory.Cache,
    recursive: true,
  });
  const { uri } = await Filesystem.getUri({
    directory: Directory.Cache,
    path: filename,
  });
  await Share.share({ title, url: uri });
}

/** Bersihkan teks menjadi nama file yang aman. */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60) || 'hasil'
  );
}

/** Unduh teks mentah (Markdown) sebagai berkas .txt. */
export function downloadTxt(filename: string, content: string): void {
  const name = `${slugify(filename)}.txt`;
  if (Capacitor.isNativePlatform()) {
    void saveAndShareNative(name, content, filename).catch((e) =>
      console.error('Ekspor .txt native gagal:', e),
    );
    return;
  }
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, name);
}

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** Tipe modul `docx` — hanya untuk anotasi; dimuat via dynamic import saat dipakai. */
type DocxNS = typeof import('docx');

/**
 * Ubah Markdown ringan menjadi daftar Paragraph docx.
 * Aturan parse dipertahankan sama seperti versi sebelumnya:
 * heading `#{1,6}`, bullet `-`/`*`, `**tebal**`, `*miring*`, sisanya paragraf.
 * Semua teks mewarisi Arial 12pt dari style default dokumen; heading dibuat
 * tebal + berukuran lebih besar (tetap Arial), bukan style heading bawaan Word.
 */
function markdownToDocx(
  md: string,
  docx: DocxNS,
): InstanceType<DocxNS['Paragraph']>[] {
  const { Paragraph, TextRun } = docx;

  // Buang penanda **/* agar tidak muncul mentah di dalam heading.
  const stripMarks = (s: string): string =>
    s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(?!\s)(.+?)\*/g, '$1');

  // Pecah teks inline menjadi TextRun: **tebal**, *miring*, sisanya biasa.
  const inlineRuns = (text: string): InstanceType<DocxNS['TextRun']>[] => {
    const runs: InstanceType<DocxNS['TextRun']>[] = [];
    const re = /\*\*(.+?)\*\*|\*(?!\s)(.+?)\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) runs.push(new TextRun(text.slice(last, m.index)));
      if (m[1] !== undefined) runs.push(new TextRun({ text: m[1], bold: true }));
      else if (m[2] !== undefined)
        runs.push(new TextRun({ text: m[2], italics: true }));
      last = re.lastIndex;
    }
    if (last < text.length) runs.push(new TextRun(text.slice(last)));
    return runs.length ? runs : [new TextRun('')];
  };

  // Ukuran heading dalam half-points (h5/h6 = 24 = 12pt), semua tebal & Arial.
  const headingSize: Record<number, number> = {
    1: 36,
    2: 32,
    3: 28,
    4: 26,
    5: 24,
    6: 24,
  };

  const paragraphs: InstanceType<DocxNS['Paragraph']>[] = [];
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);

    if (heading) {
      const level = heading[1].length;
      paragraphs.push(
        new Paragraph({
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: stripMarks(heading[2]),
              bold: true,
              size: headingSize[level],
            }),
          ],
        }),
      );
    } else if (bullet) {
      paragraphs.push(
        new Paragraph({ bullet: { level: 0 }, children: inlineRuns(bullet[1]) }),
      );
    } else if (line.trim() === '') {
      // Baris kosong: lewati — jarak antar paragraf ditangani `spacing`.
    } else {
      paragraphs.push(
        new Paragraph({ spacing: { after: 120 }, children: inlineRuns(line) }),
      );
    }
  }

  // docx menolak section tanpa anak — jamin minimal satu paragraf kosong.
  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({ children: [new TextRun('')] }));
  }
  return paragraphs;
}

/** Bangun .docx OOXML asli (Arial 12pt) lalu kirim: web unduh, native share. */
async function deliverDocx(
  docx: DocxNS,
  filename: string,
  content: string,
): Promise<void> {
  const { Document, Packer } = docx;

  const doc = new Document({
    styles: {
      default: {
        // Arial 12pt (24 half-points) sebagai gaya default seluruh dokumen.
        document: { run: { font: 'Arial', size: 24 } },
      },
    },
    sections: [{ children: markdownToDocx(content, docx) }],
  });

  const name = `${slugify(filename)}.docx`;

  if (Capacitor.isNativePlatform()) {
    // .docx = biner → base64 → tulis tanpa encoding (biner) → share.
    const base64 = await Packer.toBase64String(doc);
    await saveAndShareNativeBinary(name, base64, filename);
    return;
  }
  const packed = await Packer.toBlob(doc);
  const blob = new Blob([packed], { type: DOCX_MIME });
  downloadBlob(blob, name);
}

/**
 * Unduh hasil sebagai .docx OOXML asli (Arial 12pt) yang dapat dibuka Word di
 * HP maupun laptop. Menggantikan ekspor .doc (HTML-in-Word) lama yang ditolak
 * Word HP.
 *
 * Signature `(filename, content): void` DIPERTAHANKAN agar pemanggil di App.tsx
 * (file beku) tidak perlu berubah. Library `docx` dimuat lewat dynamic import di
 * dalam fungsi ini (dipicu klik Ekspor), bukan import statis — supaya bundle
 * awal tidak membengkak.
 */
export function downloadDoc(filename: string, content: string): void {
  void (async () => {
    let docx: DocxNS;
    // Muat modul (chunk terpisah). Jaringan HP jelek bisa gagalkan import →
    // coba ulang sekali sebelum menyerah.
    try {
      docx = await import('docx');
    } catch (e1) {
      console.error('Muat modul docx gagal — coba ulang sekali:', e1);
      try {
        docx = await import('docx');
      } catch (e2) {
        console.error('Muat docx tetap gagal — fallback ke .txt:', e2);
        downloadTxt(filename, content); // guru tetap dapat isinya
        return;
      }
    }
    // Modul termuat: bangun & kirim. Bila langkah ini gagal, tetap fallback .txt.
    try {
      await deliverDocx(docx, filename, content);
    } catch (e3) {
      console.error('Bangun/kirim .docx gagal — fallback ke .txt:', e3);
      downloadTxt(filename, content);
    }
  })();
}
