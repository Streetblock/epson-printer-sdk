/* eslint-disable radix */
import EpsonPrint from './print';

// @ts-ignore
import XMLParser from 'react-xml-parser';

const EPSON_XML_HEADER =
  '<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Header><parameter xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print" /></s:Header><s:Body>';

/**
 * EpsonPrinter - Etappe D (Robustheit & Status)
 * Implementiert automatische Wiederholungsversuche und detaillierte Statusprüfungen.
 */

class EpsonPrinter {
  private url: string;
  private maxRetries = 3;

  constructor(ip: string) {
    this.url = `http://${ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=10000`;
  }


  /**
   * Setzt die Anzahl der maximalen Wiederholungsversuche bei Netzwerkfehlern.
   */
  public setMaxRetries(retries: number) {
    this.maxRetries = retries;
    return this;
  }

  /**
   * Sendet einen Druckauftrag mit automatischer Retry-Logik.
   * Verwendet Exponential Backoff für die Wartezeit zwischen Versuchen.
   */
  public async send(print: EpsonPrint, retryCount = 0): Promise<any> {
    try {
      const data = print.toString();
      const xml = await this.request(data);
      const [response] = xml.getElementsByTagName('response');

      /**
       * Example response:
       * <soapenv:Body>
       *   <response
       *     success="false" code="DeviceNotFound" status="0" battery="0"
       *     xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print"
       *   />
       * </soapenv:Body>
       */

      if (!response) {
        throw new Error('INVALID_RESPONSE');
      }

      const success = response.attributes.success === 'true';

      // If there's an error, "code" contains the error
      const code = response.attributes.code || 'UNKNOWN_ERROR';

      if (!success) {
        throw new Error(code);
      }
      
      /** Successful print */
      return response;
    } catch (error: any) {
      // Retry bei Netzwerkfehlern oder Timeouts, sofern das Limit nicht erreicht ist
      if (retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.send(print, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Liefert den aktuellen Status des Druckers zurück.
   * Fragt alle relevanten Hardware-Zustände (Papier, Deckel, Schublade) ab.
   */
  public async getStatus(): Promise<{
    isResponsive: boolean;
    drawerIsOpen: boolean;
    coverIsOpen: boolean;
    isOffline: boolean;
    paperNearEmpty: boolean;
    paperEmpty: boolean;
    rawStatus?: string;
  }> {
    try {
      // Ein leerer Druckauftrag dient der reinen Statusabfrage über das ePOS-Protokoll
      const xml = await this.request(new EpsonPrint().toString());
      const [response] = xml.getElementsByTagName('response');

      const statusValue = response?.attributes.status;
      const status = parseInt(statusValue || '0', 10);

      const statuses = {
        isResponsive: true,
        drawerIsOpen: true,
        coverIsOpen: false,
        isOffline: false,
        paperNearEmpty: false,
        paperEmpty: false,
        rawStatus: statusValue
      };

      /**
       * Bitmasken-Prüfung basierend auf den ASB (Auto Status Back) Flags:
       * 0x01: Nicht erreichbar
       * 0x04: Schublade offen (abhängig von Konfiguration)
       * 0x08: Offline
       * 0x20: Deckel offen
       * 0x00020000: Papier fast leer
       * 0x00080000: Papier leer
       */
      if (status & 0x00000001) statuses.isResponsive = false;
      if (status & 0x00000004) statuses.drawerIsOpen = false;
      if (status & 0x00000008) statuses.isOffline = true;
      if (status & 0x00000020) statuses.coverIsOpen = true;
      if (status & 0x00020000) statuses.paperNearEmpty = true;
      if (status & 0x00080000) statuses.paperEmpty = true;

      return statuses;
    } catch (e) {
      // Bei Fehlern (z.B. Drucker im Netzwerk nicht erreichbar)
      return {
        isResponsive: false,
        drawerIsOpen: false,
        coverIsOpen: false,
        isOffline: true,
        paperNearEmpty: false,
        paperEmpty: false,
      };
    }
  }

  /**
   * Prüft vereinfacht, ob der Drucker bereit für einen Druckauftrag ist.
   */
  public async isReady(): Promise<{ ready: boolean; reason?: string }> {
    const status = await this.getStatus();

    if (!status.isResponsive) return { ready: false, reason: 'CONNECTION_FAILED' };
    if (status.paperEmpty) return { ready: false, reason: 'PAPER_EMPTY' };
    if (status.coverIsOpen) return { ready: false, reason: 'COVER_OPEN' };
    if (status.isOffline) return { ready: false, reason: 'OFFLINE' };

    return { ready: true };
  }

  /**
   * Interne Methode für den SOAP-Request an das Epson ePOS Interface.
   */
  private async request(data: string) {
    const body = `${EPSON_XML_HEADER}${data}</s:Body></s:Envelope>`;

    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'If-Modified-Since': 'Thu, 01 Jun 1970 00:00:00 GMT',
        SOAPAction: '""'
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    const result = await response.text();
    return new XMLParser().parseFromString(result);
  }
}
