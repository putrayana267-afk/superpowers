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

/** Anak dokumen yang sah untuk section: paragraf ATAU tabel. */
type DocxFileChild =
  | InstanceType<DocxNS['Paragraph']>
  | InstanceType<DocxNS['Table']>;

/**
 * Ubah Markdown ringan menjadi daftar anak dokumen docx.
 * Aturan parse versi sebelumnya dipertahankan: heading `#{1,6}`, bullet `-`/`*`,
 * `**tebal**`, `*miring*`, sisanya paragraf. BARU: blok tabel Markdown
 * (baris-baris `| sel | sel |`; baris pemisah `| --- |` dilewati) menjadi
 * tabel Word sungguhan — sebelumnya bocor sebagai teks pipa mentah.
 * Semua teks mewarisi Arial 12pt dari style default dokumen; heading dibuat
 * tebal + berukuran lebih besar (tetap Arial), bukan style heading bawaan Word.
 */
function markdownToDocx(md: string, docx: DocxNS): DocxFileChild[] {
  const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType } = docx;

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

  // ==== Dukungan TABEL Markdown ====

  // Baris tabel: diawali '|' dan minimal punya 2 pipa (>= 1 sel).
  const isTableLine = (s: string): boolean => {
    const t = s.trim();
    return t.startsWith('|') && t.split('|').length >= 3;
  };

  // Pecah `| a | b |` menjadi sel-sel ter-trim (segmen kosong pipa tepi dibuang).
  const splitRow = (s: string): string[] => {
    const cells = s.trim().split('|');
    if (cells.length && cells[0].trim() === '') cells.shift();
    if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();
    return cells.map((c) => c.trim());
  };

  // Baris pemisah header: tiap sel hanya berisi `---` / `:---` / `---:` / `:---:`.
  const isSeparatorRow = (cells: string[]): boolean =>
    cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));

  // Bangun Table docx dari blok baris tabel; null bila tak ada baris data.
  const buildTable = (block: string[]): InstanceType<DocxNS['Table']> | null => {
    const parsed = block.map(splitRow).filter((c) => c.length > 0);
    if (parsed.length === 0) return null;
    const headerIsFirst = parsed.length > 1 && isSeparatorRow(parsed[1]);
    const dataRows = parsed.filter((c) => !isSeparatorRow(c));
    if (dataRows.length === 0) return null;
    const nCol = Math.max(...dataRows.map((r) => r.length));

    const makeCell = (
      text: string,
      bold: boolean,
    ): InstanceType<DocxNS['TableCell']> =>
      new TableCell({
        children: [
          new Paragraph({
            children: bold
              ? [new TextRun({ text: stripMarks(text), bold: true })]
              : inlineRuns(text),
          }),
        ],
      });

    const tableRows = dataRows.map((cells, rIdx) => {
      const isHeader = headerIsFirst && rIdx === 0;
      const padded = [...cells];
      while (padded.length < nCol) padded.push('');
      return new TableRow({
        children: padded.map((c) => makeCell(c, isHeader)),
      });
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    });
  };

  const paragraphs: DocxFileChild[] = [];
  const lines = md.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trimEnd();

    // Blok tabel: kumpulkan baris `|...|` berurutan → tabel Word sungguhan.
    if (isTableLine(line)) {
      const block: string[] = [];
      while (i < lines.length && isTableLine(lines[i].trimEnd())) {
        block.push(lines[i].trimEnd());
        i++;
      }
      const table = buildTable(block);
      if (table) {
        paragraphs.push(table);
        // Paragraf kosong setelah tabel: beri jarak & cegah tabel menempel.
        paragraphs.push(
          new Paragraph({
            children: [new TextRun('')],
            spacing: { after: 120 },
          }),
        );
      } else {
        // Blok pipa yang bukan tabel valid → paragraf biasa (perilaku lama).
        for (const b of block) {
          paragraphs.push(
            new Paragraph({ spacing: { after: 120 }, children: inlineRuns(b) }),
          );
        }
      }
      continue;
    }

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
    i++;
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
