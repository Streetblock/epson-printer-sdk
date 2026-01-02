import * as utils from './utils';

/**
 * Namespace für Epson-spezifische Typen und Enums
 */
export namespace Epson {
  /**
   * Schriftarten für .addTextFont
   */
  export enum Font {
    A = 'font_a',
    B = 'font_b',
    C = 'font_c',
    D = 'font_d',
    E = 'font_e',
    SPECIAL_A = 'special_a',
    SPECIAL_B = 'special_b'
  }

  /**
   * Textausrichtung
   */
  export enum Align {
    LEFT = 'left',
    CENTER = 'center',
    RIGHT = 'right'
  }

  /**
   * Fehlerkorrektur-Level für Symbole/QR-Codes
   */
  export enum ErrorCorrection {
    LEVEL_1 = 'level_1',
    LEVEL_2 = 'level_2',
    LEVEL_3 = 'level_3',
    LEVEL_4 = 'level_4',
    LEVEL_5 = 'level_5',
    LEVEL_6 = 'level_6',
    LEVEL_7 = 'level_7',
    LEVEL_8 = 'level_8',
    LEVEL_L = 'level_l',
    LEVEL_M = 'level_m',
    LEVEL_Q = 'level_q',
    LEVEL_H = 'level_h',
    LEVEL_DEFAULT = 'level_default',
  }

  /**
   * Symbol-Typen (2D Barcodes)
   */
  export enum Symbol {
    PDF417_STANDARD = 'pdf417_standard',
    PDF417_TRUNCATED = 'pdf417_truncated',
    QRCODE_MODEL_1 = 'qrcode_model_1',
    QRCODE_MODEL_2 = 'qrcode_model_2',
    QRCODE_MICRO = 'qrcode_micro',
    MAXICODE_MODE_2 = 'maxicode_mode_2',
    MAXICODE_MODE_3 = 'maxicode_mode_3',
    MAXICODE_MODE_4 = 'maxicode_mode_4',
    MAXICODE_MODE_5 = 'maxicode_mode_5',
    MAXICODE_MODE_6 = 'maxicode_mode_6',
    GS1_DATABAR_STACKED = 'gs1_databar_stacked',
    GS1_DATABAR_STACKED_OMNIDIRECTIONAL = 'gs1_databar_stacked_omnidirectional',
    GS1_DATABAR_EXPANDED_STACKED = 'gs1_databar_expanded_stacked',
    AZTECCODE_FULLRANGE = 'azteccode_fullrange',
    AZTECCODE_COMPACT = 'azteccode_compact',
    DATAMATRIX_SQUARE = 'datamatrix_square',
    DATAMATRIX_RECTANGLE_8 = 'datamatrix_rectangle_8',
    DATAMATRIX_RECTANGLE_12 = 'datamatrix_rectangle_12',
    DATAMATRIX_RECTANGLE_16 = 'datamatrix_rectangle_16',
  }

  /**
   * Schneidemodi
   */
  export enum Cut {
    FEED = 'feed',
    NO_FEED = 'no_feed',
    RESERVE = 'reserve',
    FULL_CUT_FEED = 'feed_fullcut',
    FULL_CUT_NO_FEED = 'no_feed_fullcut',
    FULL_CUT_RESERVE = 'reserve_fullcut'
  }
}

/**
 * Klasse zur Erstellung des ePOS-XML Druckauftrags
 */
class EpsonPrint {
  private message = '';
  private halftone = 0;
  private brightness = 1;
  private force = false;

  // --- Statische Konstanten für volle Abwärtskompatibilität ---
  public static FONT_A = 'font_a' as const;
  public static FONT_B = 'font_b' as const;
  public static FONT_C = 'font_c' as const;
  public static FONT_D = 'font_d' as const;
  public static FONT_E = 'font_e' as const;
  public static FONT_SPECIAL_A = 'special_a' as const;
  public static FONT_SPECIAL_B = 'special_b' as const;

  public static ALIGN_LEFT = 'left' as const;
  public static ALIGN_CENTER = 'center' as const;
  public static ALIGN_RIGHT = 'right' as const;

  public static COLOR_NONE = 'none' as const;
  public static COLOR_1 = 'color_1' as const;
  public static COLOR_2 = 'color_2' as const;
  public static COLOR_3 = 'color_3' as const;
  public static COLOR_4 = 'color_4' as const;

  public static FEED_PEELING = 'peeling' as const;
  public static FEED_CUTTING = 'cutting' as const;
  public static FEED_CURRENT_TOF = 'current_tof' as const;
  public static FEED_NEXT_TOF = 'next_tof' as const;

  public static MODE_MONO = 'mono' as const;
  public static MODE_GRAY16 = 'gray16' as const;

  public static BARCODE_UPC_A = 'upc_a' as const;
  public static BARCODE_UPC_E = 'upc_e' as const;
  public static BARCODE_EAN13 = 'ean13' as const;
  public static BARCODE_JAN13 = 'jan13' as const;
  public static BARCODE_EAN8 = 'ean8' as const;
  public static BARCODE_JAN8 = 'jan8' as const;
  public static BARCODE_CODE39 = 'code39' as const;
  public static BARCODE_ITF = 'itf' as const;
  public static BARCODE_CODABAR = 'codabar' as const;
  public static BARCODE_CODE93 = 'code93' as const;
  public static BARCODE_CODE128 = 'code128' as const;
  public static BARCODE_GS1_128 = 'gs1_128' as const;
  public static BARCODE_GS1_DATABAR_OMNIDIRECTIONAL = 'gs1_databar_omnidirectional' as const;
  public static BARCODE_GS1_DATABAR_TRUNCATED = 'gs1_databar_truncated' as const;
  public static BARCODE_GS1_DATABAR_LIMITED = 'gs1_databar_limited' as const;
  public static BARCODE_GS1_DATABAR_EXPANDED = 'gs1_databar_expanded' as const;
  public static BARCODE_CODE128_AUTO = 'code128_auto' as const;

  public static HRI_NONE = 'none' as const;
  public static HRI_ABOVE = 'above' as const;
  public static HRI_BELOW = 'below' as const;
  public static HRI_BOTH = 'both' as const;

  public static LEVEL_0 = 'level_0' as const;
  public static LEVEL_1 = 'level_1' as const;
  public static LEVEL_2 = 'level_2' as const;
  public static LEVEL_3 = 'level_3' as const;
  public static LEVEL_4 = 'level_4' as const;
  public static LEVEL_5 = 'level_5' as const;
  public static LEVEL_6 = 'level_6' as const;
  public static LEVEL_7 = 'level_7' as const;
  public static LEVEL_8 = 'level_8' as const;
  public static LEVEL_L = 'level_l' as const;
  public static LEVEL_M = 'level_m' as const;
  public static LEVEL_Q = 'level_q' as const;
  public static LEVEL_H = 'level_h' as const;
  public static LEVEL_DEFAULT = 'default' as const;

  public static LINE_THIN = 'thin' as const;
  public static LINE_MEDIUM = 'medium' as const;
  public static LINE_THICK = 'thick' as const;
  public static LINE_THIN_DOUBLE = 'thin_double' as const;
  public static LINE_MEDIUM_DOUBLE = 'medium_double' as const;
  public static LINE_THICK_DOUBLE = 'thick_double' as const;

  public static DIRECTION_LEFT_TO_RIGHT = 'left_to_right' as const;
  public static DIRECTION_BOTTOM_TO_TOP = 'bottom_to_top' as const;
  public static DIRECTION_RIGHT_TO_LEFT = 'right_to_left' as const;
  public static DIRECTION_TOP_TO_BOTTOM = 'top_to_bottom' as const;

  public static CUT_NO_FEED = 'no_feed' as const;
  public static CUT_FEED = 'feed' as const;
  public static CUT_RESERVE = 'reserve' as const;
  public static FULL_CUT_NO_FEED = 'no_feed_fullcut' as const;
  public static FULL_CUT_FEED = 'feed_fullcut' as const;
  public static FULL_CUT_RESERVE = 'reserve_fullcut' as const;

  public static DRAWER_1 = 'drawer_1' as const;
  public static DRAWER_2 = 'drawer_2' as const;

  public static PULSE_100 = 'pulse_100' as const;
  public static PULSE_200 = 'pulse_200' as const;
  public static PULSE_300 = 'pulse_300' as const;
  public static PULSE_400 = 'pulse_400' as const;
  public static PULSE_500 = 'pulse_500' as const;

  public static PATTERN_NONE = 'none' as const;
  public static PATTERN_0 = 'pattern_0' as const;
  public static PATTERN_1 = 'pattern_1' as const;
  public static PATTERN_2 = 'pattern_2' as const;
  public static PATTERN_3 = 'pattern_3' as const;
  public static PATTERN_4 = 'pattern_4' as const;
  public static PATTERN_5 = 'pattern_5' as const;
  public static PATTERN_6 = 'pattern_6' as const;
  public static PATTERN_7 = 'pattern_7' as const;
  public static PATTERN_8 = 'pattern_8' as const;
  public static PATTERN_9 = 'pattern_9' as const;
  public static PATTERN_10 = 'pattern_10' as const;
  public static PATTERN_A = 'pattern_a' as const;
  public static PATTERN_B = 'pattern_b' as const;
  public static PATTERN_C = 'pattern_c' as const;
  public static PATTERN_D = 'pattern_d' as const;
  public static PATTERN_E = 'pattern_e' as const;
  public static PATTERN_ERROR = 'error' as const;
  public static PATTERN_PAPER_END = 'paper_end' as const;

  public static LAYOUT_RECEIPT = 'receipt' as const;
  public static LAYOUT_RECEIPT_BM = 'receipt_bm' as const;
  public static LAYOUT_LABEL = 'label' as const;
  public static LAYOUT_LABEL_BM = 'label_bm' as const;

  public static HALFTONE_DITHER = 0 as const;
  public static HALFTONE_ERROR_DIFFUSION = 1 as const;
  public static HALFTONE_THRESHOLD = 2 as const;
  public static HALFTONE_STUCKI = 3 as const;
  /**
   * Configuration for Column Helper
   */
  public setCharsPerLine(count: number) {
    this.charsPerLine = count;
    return this;
  }

  // --- Text Methoden ---

  public addText(data: string) {
    this.addRow('text', utils.escapeMarkup(data));
    return this;
  }

  public addColumnText(left: string, right: string, char: string = ' ') {
    const text = utils.formatColumnText(left, right, this.charsPerLine, char);
    return this.addText(text + '\n');
  }

  public addTextLang(lang: string) {
    this.message += `<text lang="${lang}"/>`;
    return this;
  }

  public addTextAlign(align: Epson.Align | string) {
    this.addRow('text', null, { align });
    return this;
  }

  public addTextRotate(rotate: boolean | string) {
    const val = typeof rotate === 'string' ? rotate === 'true' : rotate;
    this.message += `<text${utils.getBoolAttr('rotate', val)}/>`;
    return this;
  }

  public addTextLineSpace(linespc: number | string) {
    this.addRow('text', null, { linespc });
    return this;
  }

  public addTextFont(font: Epson.Font | string) {
    this.addRow('text', null, { font });
    return this;
  }

  public addTextSmooth(smooth: boolean | string) {
    const val = typeof smooth === 'string' ? smooth === 'true' : smooth;
    this.message += `<text${utils.getBoolAttr('smooth', val)}/>`;
    return this;
  }

  public addTextDouble(dw: boolean | string, dh: boolean | string) {
    let s = '';
    if (dw !== undefined) {
      const valW = typeof dw === 'string' ? dw === 'true' : dw;
      s += utils.getBoolAttr('dw', valW);
    }
    if (dh !== undefined) {
      const valH = typeof dh === 'string' ? dh === 'true' : dh;
      s += utils.getBoolAttr('dh', valH);
    }
    this.message += `<text${s}/>`;
    return this;
  }

  public addTextSize(width: number, height: number) {
    this.addRow('text', null, { width, height });
    return this;
  }

  public addTextStyle(reverse: boolean, ul: boolean, em: boolean, color: string) {
    this.addRow('text', null, { reverse, ul, em, color });
    return this;
  }

  public addTextPosition(x: number) {
    this.addRow('text', null, { x });
    return this;
  }

  public addTextVPosition(y: number) {
    this.addRow('text', null, { y });
    return this;
  }

  // --- Symbole & Barcodes ---

  public addSymbol(data: string, type: Epson.Symbol | string, options?: { level?: number | string; width?: number; height?: number; size?: number }) {
    this.addRow('symbol', utils.escapeControl(utils.escapeMarkup(data)), {
      type,
      level: options?.level,
      width: options?.width,
      height: options?.height,
      size: options?.size,
    });
    return this;
  }

  public addQRCode(data: string, options?: { size?: number; level?: number | string }) {
    this.addRow('symbol', utils.escapeMarkup(data), {
      type: Epson.Symbol.QRCODE_MODEL_2,
      level: options?.level || 'default',
      width: options?.size || 3,
    });
    return this;
  }

  public addBarcode(data: string, type: string, hri: string | number, font: string, width: number, height: number) {
    this.addRow('barcode', utils.escapeControl(utils.escapeMarkup(data)), {
      type, hri, font, width, height
    });
    return this;
  }

  // --- Grafiken ---

  /**
   * @param data Entweder ein fertiger Base64-String oder das Uint8Array aus utils.toMonoImage
   */
  public addImage(data: string | Uint8Array, width: number | string, height: number | string, mode: string = 'mono') {
    let base64Data: string;

    if (data instanceof Uint8Array) {
      // Konvertierung von Uint8Array zu Base64-String
      base64Data = btoa(
        data.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
      );
    } else {
      base64Data = data;
    }

    this.addRow('image', base64Data, {
      width,
      height,
      color: 'color_1',
      mode,
    });
    return this;
  }

  public addLogo(key1: string, key2: string) {
    this.addRow('logo', null, { key1, key2 });
    return this;
  }

  public addHLine(x1: number, x2: number, style: string) {
    this.addRow('hline', null, { x1, x2, style });
    return this;
  }

  public addVLineBegin(x: number, style: string) {
    this.addRow('vline', null, { x, style });
    return this;
  }

  public addVLineEnd(x: number, style: string) {
    this.addRow('vline', null, { x, style });
    return this;
  }

  // --- Layout & Feed ---

  public addFeedUnit(unit: number | string) {
    this.message += `<feed unit="${unit}"/>`;
    return this;
  }

  public addFeedLine(line: number) {
    this.addRow('feed', null, { line });
    return this;
  }

  public addFeed() {
    this.message += '<feed/>';
    return this;
  }

  public addFeedPosition(pos: string) {
    this.addRow('feed', null, { pos });
    return this;
  }

  public addRotateBegin() {
    this.message += '<rotate-begin/>';
    return this;
  }

  public addRotateEnd() {
    this.message += '<rotate-end/>';
    return this;
  }

  public addCut(type: Epson.Cut | string = 'feed') {
    this.addRow('cut', null, { type });
    return this;
  }

  // --- Hardware ---

  public kickOutDrawer(drawer: string = EpsonPrint.DRAWER_1, pulse: string = EpsonPrint.PULSE_100): EpsonPrint {
    this.addRow('pulse', null, { drawer, time: pulse });
    return this;
  }

  public addSound(pattern: any, repeat: any, cycle: string) {
    this.addRow('sound', null, { pattern, repeat, cycle });
    return this;
  }

  public addCommand(data: string) {
    this.message += `<command>${utils.toHexBinary(data)}</command>`;
    return this;
  }

  public addRecovery() {
    this.addRow('recovery');
    return this;
  }

  public addReset() {
    this.addRow('reset');
    return this;
  }

  // --- Finalisierung ---

  public toString() {
    const s = this.force ? ' force="true"' : '';
    return `<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print"${s}>${this.message}</epos-print>`;
  }

  private addRow(field: string, value?: string | null, fields?: Record<string, any>) {
    let attrString = '';

    if (fields) {
      for (const [key, val] of Object.entries(fields)) {
        if (val === undefined || val === null) continue;

        try {
          switch (key) {
            // Boolean Attribute (z.B. rotate="true")
            case 'rotate': case 'smooth': case 'dw': case 'dh':
            case 'reverse': case 'ul': case 'em':
              attrString += utils.getBoolAttr(key, val);
              break;

            // Integer Attribute mit spezifischen Bereichen
            case 'width': case 'height':
              // Im <text> Tag erlaubt ePOS meist 1-8
              if (field === 'text') {
                attrString += utils.getIntAttr(key, Number(val), 1, 8);
              } else {
                attrString += utils.getUByteAttr(key, Number(val));
              }
              break;

            case 'x': case 'y':
              attrString += utils.getUShortAttr(key, Number(val));
              break;

            case 'line': case 'unit':
              attrString += utils.getUByteAttr(key, Number(val));
              break;

            // Standard-Behandlung für Enums/Strings (align, font, color, etc.)
            default:
              // Hier könnte man noch utils.getEnumAttr mit Regex nutzen,
              // falls man die erlaubten Werte pro Key definieren möchte.
              attrString += ` ${key}="${val}"`;
              break;
          }
        } catch (e) {
          console.error(`Validierungsfehler bei Attribut "${key}":`, e);
          // Optional: Den Fehler weiterwerfen oder einen sicheren Standard setzen
        }
      }
    }

    this.message += `<${field}${attrString}`;

    if (value === null || value === undefined) {
      this.message += '/>';
    } else {
      this.message += `>${value}</${field}>`;
    }
  }

  /*private addRow(field: string, value?: string | null, fields?: Record<string, any>) {
    this.message += `<${field}`;
    if (fields) {
      for (const [key, val] of Object.entries(fields)) {
        if (val !== undefined && val !== null) {
          this.message += ` ${key}="${val}"`;
        }
      }
    }
    if (value === null || value === undefined) {
      this.message += '/>';
    } else {
      this.message += `>${value}</${field}>`;
    }
  }*/
}

export default EpsonPrint;
