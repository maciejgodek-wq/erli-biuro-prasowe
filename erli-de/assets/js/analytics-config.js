/**
 * analytics-config.js — Erli.de Analytics Setup
 *
 * TODO: Ausfüllen nach GTM/GA4-Konfiguration durch das SEO/Analytics-Team.
 *
 * Schritte:
 * 1. Neuen GTM-Container für erli.de erstellen (getrennt von erli.pl)
 *    - GTM-XXXXXXX in allen HTML-Dateien durch die echte Container-ID ersetzen
 * 2. Neue GA4-Eigenschaft für erli.de erstellen
 *    - In GTM GA4-Tag mit Measurement ID konfigurieren: G-XXXXXXXXXX
 *    - Trigger: Consent Initialized — analytics_storage = granted
 * 3. Consent Mode v2 in GTM konfigurieren (statt hartkodiertem HTML)
 * 4. dataLayer-Events für wichtige Interaktionen einrichten:
 *    - Formular-Submit (/kontakt)
 *    - FAQ-Klicks (/faq)
 *    - CTA-Klicks (hero + cta-banner)
 */

const ANALYTICS_CONFIG = {
  GTM_ID: 'GTM-XXXXXXX',           // TODO: durch echte Container-ID ersetzen
  GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX', // TODO: durch echte Measurement ID ersetzen
  REGION: 'DE',
  CONSENT_STORAGE_KEY: 'erli-consent',
};

/* Exportieren für Tests und andere Module */
if (typeof module !== 'undefined') {
  module.exports = ANALYTICS_CONFIG;
}
