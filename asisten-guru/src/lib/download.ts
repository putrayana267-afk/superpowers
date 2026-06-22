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
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${slugify(filename)}.txt`);
}

/** Konversi Markdown ringan menjadi HTML sederhana untuk ekspor Word. */
function markdownToBasicHtml(md: string): string {
  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const inline = (s: string) =>
    escape(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>');

  const lines = md.split('\n');
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);

    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (bullet) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inline(bullet[1])}</li>`);
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return html.join('\n');
}

/**
 * Unduh sebagai dokumen yang dapat dibuka Microsoft Word (.doc).
 * Pendekatan HTML-in-Word ini tidak butuh dependency tambahan.
 */
export function downloadDoc(filename: string, content: string): void {
  const body = markdownToBasicHtml(content);
  const docHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8" /><title>${slugify(filename)}</title>
<style>body{font-family:'Calibri',sans-serif;font-size:11pt;line-height:1.5;color:#0B1F17;} h1,h2,h3{color:#047857;} table{border-collapse:collapse;} td,th{border:1px solid #999;padding:4px;}</style>
</head><body>${body}</body></html>`;
  const blob = new Blob(['﻿', docHtml], {
    type: 'application/msword;charset=utf-8',
  });
  downloadBlob(blob, `${slugify(filename)}.doc`);
}
