/**
 * utils.ts - (Uint8Array Version)
 * Basis-Hilfsfunktionen für Attribut-Handling, Text-Escaping
 * und fortgeschrittene Bildverarbeitung (Dithering).
 */

/**
 * ImageData Struktur für die Bildverarbeitung
 */
export type ImageData = {
  data: number[] | Uint8ClampedArray;
  width: number;
  height: number;
};

// --- ATTRIBUT-HELPER (für XML/Markup-Generierung) ---

/** Validiert und formatiert ein Enum-Attribut */
export function getEnumAttr(name: string, value: string, regex: RegExp): string {
  if (!regex.test(value)) {
    throw new Error(`Parameter "${name}" ist invalid`);
  }
  return ` ${name}="${value}"`;
}

/** Formatiert einen Wert als Boolean-Attribut */
export function getBoolAttr(name: string, value: any): string {
  return ` ${name}="${!!value}"`;
}

/** Validiert und formatiert ein Integer-Attribut innerhalb eines Bereichs */
export function getIntAttr(name: string, value: number, min: number, max: number): string {
  if (isNaN(value) || value < min || value > max) {
    throw new Error(`Parameter "${name}" ist invalid`);
  }
  return ` ${name}="${value}"`;
}

export function getUByteAttr(name: string, value: number): string {
  return getIntAttr(name, value, 0, 255);
}

export function getUShortAttr(name: string, value: number): string {
  return getIntAttr(name, value, 0, 65535);
}

export function getShortAttr(name: string, value: number): string {
  return getIntAttr(name, value, -32768, 32767);
}

/** Erlaubt entweder einen validen String (Regex) oder eine Zahl innerhalb eines Bereichs */
export function getEnumIntAttr(
  name: string,
  value: number,
  regex: RegExp,
  min: number,
  max: number,
): string {
  if (!regex.test(value as unknown as string)) {
    if (isNaN(value) || value < min || value > max) {
      throw new Error(`Parameter "${name}" ist invalid`);
    }
  }
  return ` ${name}="${value}"`;
}

// --- TEXT-VERARBEITUNG & ESCAPING ---

/**
 * Erstellt eine formatierte Tabellenzeile mit Füllzeichen.
 * Berechnet automatisch die Anzahl der benötigten Leerzeichen/Punkte zwischen links und rechts.
 */
export function formatColumnText(left: string, right: string, width: number, char: string = ' '): string {
  const space = width - left.length - right.length;
  if (space > 0) {
    return left + char.repeat(space) + right;
  }
  // Falls der Text zu lang ist, wird nur ein einzelnes Leerzeichen als Trenner verwendet
  return left + ' ' + right;
}

/** Escapes spezielle XML/Markup-Zeichen */
export function escapeMarkup(s: string): string {
  const markup = /[<>&'"\t\n\r]/g;
  if (markup.test(s)) {
    return s.replace(markup, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        case '\t': return '&#9;';
        case '\n': return '&#10;';
        case '\r': return '&#13;';
        default: return c;
      }
    });
  }
  return s;
}

/** Escaped Steuerzeichen für die Übertragung */
export function escapeControl(s: string): string {
  const control = /[\\\x00-\x1f\x7f-\xff]/g;
  if (control.test(s)) {
    return s.replace(control, (c) => {
      return c === '\\' ? '\\\\' : '\\x' + ('0' + c.charCodeAt(0).toString(16)).slice(-2);
    });
  }
  return s;
}

/** Konvertiert einen String in eine Hexadezimal-Binärkette */
export function toHexBinary(s: string): string {
  const r = new Array<string>(s.length);
  for (let i = 0; i < s.length; i++) {
    r[i] = ('0' + s.charCodeAt(i).toString(16)).slice(-2);
  }
  return r.join('');
}

// --- BILDVERARBEITUNG (MONOCHROM & GRAUSTUFEN) ---

/**
 * Konvertiert Bilddaten in monomeres Format (Schwarz-Weiß) als Uint8Array
 * Modi (s): 0: Bayer, 1: Floyd-Steinberg, 2: Atkinson, 3: Stucki
 * g: Gamma-Wert
 */
export function toMonoImage(imgdata: ImageData, s: number, g: number): Uint8Array {
  const { data: d, width: w, height: h } = imgdata;

  // Berechnung der Zielgröße: (Breite aufgerundet auf volle Bytes) * Höhe
  const targetSize = ((w + 7) >> 3) * h;
  const r = new Uint8Array(targetSize);

  const errorBuffer = [new Float32Array(w + 4), new Float32Array(w + 4), new Float32Array(w + 4)];

  let n = 0, p = 0, q = 0;

  for (let j = 0; j < h; j++) {
    const cur = errorBuffer[0], nxt = errorBuffer[1], nxt2 = errorBuffer[2];
    nxt2.fill(0);

    for (let i = 0; i < w; i++) {
      const b = i & 7;
      let t = 128;

      // Luminanz-Berechnung inkl. Alpha-Kanal
      const lum = (((d[p++] * 0.29891 + d[p++] * 0.58661 + d[p++] * 0.11448) * d[p]) / 255 + 255 - d[p++]) / 255;
      let v = Math.pow(lum, 1 / g) * 255;

      if (s === 0) {
        t = [
          [2, 130, 34, 162, 10, 138, 42, 170],
          [194, 66, 226, 98, 202, 74, 234, 106],
          [50, 178, 18, 146, 58, 186, 26, 154],
          [242, 114, 210, 82, 250, 122, 218, 90],
          [14, 142, 46, 174, 6, 134, 38, 166],
          [206, 78, 238, 110, 198, 70, 230, 102],
          [62, 190, 30, 158, 54, 182, 22, 150],
          [254, 126, 222, 94, 246, 118, 214, 86],
        ][j & 7][b];
      } else {
        v += cur[i + 2];
      }

      const isDark = v < t;
      if (isDark) n |= (128 >> b);

      if (s > 0) {
        const err = v - (isDark ? 0 : 255);
        if (s === 1) { // Floyd-Steinberg
          cur[i + 3] += err * 7/16; nxt[i + 1] += err * 3/16; nxt[i + 2] += err * 5/16; nxt[i + 3] += err * 1/16;
        } else if (s === 2) { // Atkinson
          const dist = err / 8;
          cur[i + 3] += dist; cur[i + 4] += dist; nxt[i + 1] += dist; nxt[i + 2] += dist; nxt[i + 3] += dist; nxt2[i + 2] += dist;
        } else if (s === 3) { // Stucki
          const dist = err / 42;
          cur[i + 3] += dist * 8; cur[i + 4] += dist * 4;
          nxt[i] += dist * 2; nxt[i + 1] += dist * 4; nxt[i + 2] += dist * 8; nxt[i + 3] += dist * 4; nxt[i + 4] += dist * 2;
          nxt2[i] += dist * 1; nxt2[i + 1] += dist * 2; nxt2[i + 2] += dist * 4; nxt2[i + 3] += dist * 2; nxt2[i + 4] += dist * 1;
        }
      }

      if (b === 7 || i === w - 1) {
        // Workaround für ePOS-Protokoll-Besonderheiten (n=16 zu Space/32) beibehalten:
        r[q++] = (n === 16) ? 32 : n;
        n = 0;
      }
    }
    errorBuffer.shift();
    errorBuffer.push(nxt2);
  }
  return r;
}

/**
 * Konvertiert Bilddaten in Graustufen unter Verwendung einer Thermal-Lookup-Table
 * Gibt nun ein Uint8Array zurück.
 */
export function toGrayImage(imgdata: ImageData, g: number): Uint8Array {
  const { data: d, width: w, height: h } = imgdata;

  // Die Lookup-Table bleibt gleich
  const thermal = [
    0, 7, 13, 19, 23, 27, 31, 35, 40, 44, 49, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69, 70, 70,
    71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 83, 84, 85, 86, 86, 87, 88, 88, 89, 90, 90,
    91, 91, 92, 93, 93, 94, 94, 95, 96, 96, 97, 98, 98, 99, 99, 100, 101, 101, 102, 102, 103, 103,
    104, 104, 105, 105, 106, 106, 107, 107, 108, 108, 109, 109, 110, 110, 111, 111, 112, 112, 112,
    113, 113, 114, 114, 115, 115, 116, 116, 117, 117, 118, 118, 119, 119, 120, 120, 120, 121, 121,
    122, 122, 123, 123, 123, 124, 124, 125, 125, 125, 126, 126, 127, 127, 127, 128, 128, 129, 129,
    130, 130, 130, 131, 131, 132, 132, 132, 133, 133, 134, 134, 135, 135, 135, 136, 136, 137, 137,
    137, 138, 138, 139, 139, 139, 140, 140, 141, 141, 141, 142, 142, 143, 143, 143, 144, 144, 145,
    145, 146, 146, 146, 147, 147, 148, 148, 148, 149, 149, 150, 150, 150, 151, 151, 152, 152, 152,
    153, 153, 154, 154, 155, 155, 155, 156, 156, 157, 157, 158, 158, 159, 159, 160, 160, 161, 161,
    161, 162, 162, 163, 163, 164, 164, 165, 165, 166, 166, 166, 167, 167, 168, 168, 169, 169, 170,
    170, 171, 171, 172, 173, 173, 174, 175, 175, 176, 177, 178, 178, 179, 180, 180, 181, 182, 182,
    183, 184, 184, 185, 186, 186, 187, 189, 191, 193, 195, 198, 200, 202, 255,
  ];

  const m4 = [[0, 9, 2, 11], [13, 4, 15, 6], [3, 12, 1, 10], [16, 7, 14, 5]];

  // Zielgröße berechnen (2 Pixel pro Byte bei Graustufen-Modus 16)
  const targetSize = ((w + 1) >> 1) * h;
  const r = new Uint8Array(targetSize);

  let n = 0, p = 0, q = 0;

  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const b = i & 1;
      const lum = (((d[p++] * 0.29891 + d[p++] * 0.58661 + d[p++] * 0.11448) * d[p]) / 255 + 255 - d[p++]) / 255;
      const v = thermal[ (Math.pow(lum, 1 / g) * 255) | 0 ];

      let v1 = (v / 17) | 0;
      if (m4[j & 3][i & 3] < (v % 17)) v1++;

      n |= (v1 << ((1 - b) << 2));

      if (b === 1 || i === w - 1) {
        // Direkt den Zahlenwert in das Byte-Array schreiben
        r[q++] = n;
        n = 0;
      }
    }
  }
  return r;
}
