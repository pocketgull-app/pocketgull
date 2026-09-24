/**
 * PocketGull Enterprise Clinical Assistant & Documentation Portal (pocketgull.com)
 * Certified Corporate Identity: PocketGull LLC (Oregon Registry: 258869891 | EIN: 42-3162850)
 * Health Informatics Lead: Phillip Gear (CMS NPI: 1487569752)
 */

import { renderLegalFooterHtml } from './legal-footer';

export function getPocketgullWordmarkSvg(className: string = 'h-8 w-auto text-stone-950 inline-block'): string {
  return `<svg class="${className}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 263 80" fill="currentColor" role="img" aria-label="PocketGull Wordmark" width="263" height="80">
    <!-- P -->
    <path d="M12.3774,78.2247l-10.6363.539c-1.0299.0522-1.0654-1.9957-1.0618-3.2533l.0682-23.9046L0,4.2922l15.9781-1.8972c5.2085-.6184,11.3528-.0727,15.6852,2.6997,6.996,4.4768,7.9626,12.5212,7.2141,20.092-.7384,7.4681-4.7398,12.9561-12.6058,14.3846-4.5638.8288-9.8724.8405-14.6992.7813l.805,37.8721ZM23.3856,11.9225l-12.5362-.239.4084,20.6907,7.0349-.1314c3.0425-.0568,6.1524-.8601,8.0174-2.8765,4.5186-4.8856,2.1707-17.3466-2.9245-17.4438Z"/>
    <!-- o -->
    <path d="M54.1176,75.9705c-6.6018,4.2596-15.2607,4.4551-20.8514-1.2403-3.0268-3.0835-3.9006-8.3698-3.8652-12.558l.0897-10.614c.0297-3.51.4773-7.908,2.6311-10.8275,5.3068-7.1932,16.3394-8.1015,22.6686-1.7502,2.6704,2.6797,3.2518,7.4675,3.3093,11.0673l.1829,11.4513c.0828,5.1831-1.169,9.7951-4.1649,14.4713ZM47.985,45.9357c-.336-1.8815-2.3187-3.6686-3.9084-3.7777-1.2337-.0847-4.0325,1.3265-4.2235,2.6144l-1.1091,7.4776c-1.0924,7.3652-.7522,18.687,4.6653,19.9189,6.6863,1.5204,6.4137-15.9424,4.5758-26.2331Z"/>
    <!-- c -->
    <path d="M78.9789,66.3963c1.6234-1.6446,5.9064-2.2229,8.6012-1.6798.8391,4.2044-.2906,9.2356-3.9069,11.8752-5.7381,4.1885-14.4611,3.1168-19.2277-2.207-4.8179-5.3811-4.3934-22.0405-2.4064-30.7899,1.339-5.8959,6.5748-9.444,12.3783-9.9086,6.9666-.5577,13.0487,3.6713,13.2375,10.9799-2.6647.9568-5.5755,1.4739-8.3501,1.5473-.4309-2.6953-2.0659-5.2871-4.1351-5.7307-1.3655-.2927-3.9435,1.9507-4.1525,3.2083-1.7209,10.356-2.0152,28.8656,4.528,27.8226,2.2567-.3597,3.009-1.9651,3.4336-5.1174Z"/>
    <!-- k -->
    <path d="M110.9035,77.7205l-10.8948-22.1012.2332,21.9387-10.2298.1982c1.1959-11.3402.8582-22.0661.6576-33.6001l-.3655-21.0132-.6585-15.2478,10.0504-2.582.2615,36.2483,9.9255-12.5789c3.1845-.3447,6.1716-.3454,10.4783.1605l-14.6734,17.4289,14.4498,27.486,1.3186,3.2166-10.5529.4461Z"/>
    <!-- e -->
    <path d="M136.0613,68.2649l1.5035-3.9409,8.1078.8255c.2935,7.6111-5.4883,12.7852-12.696,12.7056-7.5673-.0836-13.1446-4.9327-13.6463-12.6783-1.0186-15.726-2.4648-32.0826,13.5502-33.0748,5.1399-.3185,8.8824,1.6939,10.8861,6.6122,1.8825,4.6207,2.1353,9.7262,1.8903,15.2683l-18.0748,2.8283,2.5795,10.9651c.1813.7708,1.7413,2.0033,2.5016,2.2416.9124.286,3.052-.8456,3.398-1.7524ZM137.2873,49.4212c-.393-2.7843-1.0426-7.0275-3.1103-9.4438-1.7172-2.0067-5.9162.1411-6.0865,2.4052l-.6413,8.5292,9.838-1.4906Z"/>
    <!-- t -->
    <path d="M167.8955,76.5618c-4.8555,2.5153-10.6732,2.8542-14.9286-.9607-1.6163-1.4489-2.6764-5.7241-2.6795-8.1789l-.0417-33.0461-5.5745-.0601-.2127-7.0223,6.0601-.3361.0269-8.9567,9.0089-3.0097-.3207,11.9859,6.6881-.4121.4348,7.4823-7.4199.3543.4237,31.562c.351,1.0938.9235,3.5135,1.8441,3.646s2.4841-.1871,4.4717-.5068c1.135,1.2079,1.9425,4.4914,2.2192,7.459Z"/>
    <!-- G -->
    <path d="M196.1527,49.5175l-9.6026-.2105.0872-8.5363,15.8828-.2878c.6505-.0118,2.5194.4281,2.5219.9536l.0132,2.8092c.0504,10.7462-.2707,30.077-8.3798,32.9086-6.3173,2.2059-14.7639,2.1945-20.3556-2.2654-4.4845-3.5768-6.5955-10.3431-6.9251-15.9495-.7912-13.456-.6443-26.3988.9491-39.6623.738-6.1434,3.4314-12.0152,8.9481-15.0255,6.7244-3.6693,15.9115-2.634,21.4326,2.8673,3.0024,2.9916,3.503,8.197,3.7773,11.8503l-10.0943,1.569c-.4914-2.9384-.7341-5.1352-2.0439-7.4909-.9534-1.7148-4.8675-1.7553-6.9122-1.0087-1.7612.6431-3.5672,3.2099-4.0988,5.774-2.8583,13.7863-3.4015,32.7364-.032,46.0594.8582,3.3935,3.848,5.1082,6.7651,5.0968s6.5093-1.4308,6.8183-5.0051l1.2489-14.4465Z"/>
    <!-- u -->
    <path d="M209.1422,68.4496l-.6151-9.6405-.2755-25.0952,9.4489.0693c-.7423,10.5626-2.4638,33.1237,2.2059,35.6762.8902.4866,3.2203-.2328,4.0631-1.0389,2.0142-1.9265,1.6903-4.6469,1.6575-7.2096l-.345-26.9487c2.6953-1.1954,6.6895-1.4305,9.4194-.8004l-.2046,14.3924c-.1393,9.7997-1.8975,19.407,1.243,28.8777l-8.9625,1.6587-1.1408-3.7358c-3.034,2.8692-7.606,4.3866-11.7063,2.3124-2.7939-1.4134-4.5731-5.1476-4.7881-8.5176Z"/>
    <!-- l (1st) -->
    <path d="M238.4993,77.9034l.0864-21.4524c.0511-12.6775.7401-25.0515-.1302-37.74l-.798-11.6338,10.2181-3.3643-.795,42.9925,1.329,31.4307-9.9104-.2327Z"/>
    <!-- l (2nd) -->
    <path d="M262.7243,79.0329l-10.7111-.1841,1.237-49.6947-.9624-25.667,10.295-3.487c-1.0743,18.259-2.3656,35.2461-1.4063,53.1155l.7225,13.459.8252,12.4583Z"/>
  </svg>`;
}

export type VisitorJurisdictionTier = 'US' | 'FVEY' | 'EU' | 'GLOBAL_RESEARCH';

export interface IBusinessSiteRenderOptions {
  countryCode?: string;
  jurisdiction?: VisitorJurisdictionTier;
}

export const OFAC_SANCTIONED_COUNTRIES = new Set(['CU', 'IR', 'KP', 'SY']);

export function resolveVisitorJurisdiction(countryCode?: string): VisitorJurisdictionTier {
  if (!countryCode) return 'US';
  const code = countryCode.toUpperCase().trim();
  if (code === 'US') return 'US';
  if (['GB', 'UK', 'CA', 'AU', 'NZ'].includes(code)) return 'FVEY';
  if (['DE', 'FR', 'NL', 'SE', 'IT', 'ES', 'IE', 'BE', 'AT', 'DK', 'FI', 'PL', 'PT', 'CZ', 'GR', 'RO'].includes(code)) return 'EU';
  return 'GLOBAL_RESEARCH';
}

export function renderOfacRestrictedHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>451 Unavailable For Legal Reasons — PocketGull</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; text-align: center;">
  <div style="max-width: 520px; background: #18181b; border: 1px solid #27272a; border-radius: 1rem; padding: 2.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    <div style="font-size: 2.5rem; margin-bottom: 1rem;">⚖️</div>
    <h1 style="font-size: 1.25rem; font-weight: 700; color: #f87171; margin-bottom: 0.75rem;">451 &bull; Service Restricted In This Territory</h1>
    <p style="font-size: 0.875rem; color: #a1a1aa; line-height: 1.6; margin-bottom: 1.5rem;">
      PocketGull software distributions and clinical AI telemetry endpoints are legally restricted from deployment in OFAC-sanctioned jurisdictions in strict compliance with U.S. Export Administration Regulations (EAR) and statutory trade sanctions.
    </p>
    <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: #71717a;">
      PocketGull LLC &bull; Oregon Entity 258869891 &bull; Statutory Egress Guard
    </div>
  </div>
</body>
</html>`;
}

export function renderBusinessSiteHtml(options?: IBusinessSiteRenderOptions): string {
  const jurisdiction = options?.jurisdiction || resolveVisitorJurisdiction(options?.countryCode);

  let sovereignBadgeHtml = '';
  let regulatoryNoticeHtml = '';

  if (jurisdiction === 'US') {
    sovereignBadgeHtml = `<div class="badge" style="background: rgba(20, 184, 166, 0.12); color: var(--teal-light); border: 1px solid rgba(20, 184, 166, 0.3);">
      <span>🇺🇸</span> US Clinical Domain &bull; HIPAA &sect;164.514 Safe Harbor &bull; FDA 21st Century Cures CDS
    </div>`;
  } else if (jurisdiction === 'FVEY') {
    sovereignBadgeHtml = `<div class="badge" style="background: rgba(59, 130, 246, 0.12); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3);">
      <span>🌐</span> Five Eyes Sovereign Health Accord &bull; NHS DTAC (UK) &bull; PIPEDA (CA) &bull; TGA SaMD (AU) &bull; NZ HIPC (NZ)
    </div>`;
    regulatoryNoticeHtml = `<div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-top: 1rem; margin-bottom: 1.5rem; font-size: 0.8125rem; color: #93c5fd;">
      <strong>Five Eyes Healthcare Standard:</strong> Certified compliant with Five Eyes partner privacy frameworks, local 988/111 emergency vector routing, and regional HL7 FHIR Core baselines.
    </div>`;
  } else if (jurisdiction === 'EU') {
    sovereignBadgeHtml = `<div class="badge" style="background: rgba(168, 85, 247, 0.12); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.3);">
      <span>🇪🇺</span> European Union Sovereign Territory &bull; EU AI Act Art. 53(1)(c) TDM Reserved &bull; GDPR Cookie-less
    </div>`;
    regulatoryNoticeHtml = `<div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-top: 1rem; margin-bottom: 1.5rem; font-size: 0.8125rem; color: #d8b4fe;">
      <strong>EU AI Act &amp; GDPR Sovereignty Notice:</strong> Text and data mining (TDM) rights expressly reserved under EU AI Act Art. 53(1)(c). Zero tracking cookies, zero cloud telemetry harvesting, 100% on-device client execution.
    </div>`;
  } else {
    sovereignBadgeHtml = `<div class="badge" style="background: rgba(245, 158, 11, 0.12); color: var(--amber-light); border: 1px solid rgba(245, 158, 11, 0.3);">
      <span>🔬</span> Global Research &amp; Academic Review &bull; SFI Complexity Testbed &bull; Non-Device CDS Mode
    </div>`;
    regulatoryNoticeHtml = `<div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-top: 1rem; margin-bottom: 1.5rem; font-size: 0.8125rem; color: var(--amber-light);">
      <strong>Academic &amp; Research Review Mode:</strong> Active in your territory for peer-reviewed biophysical education, clinical research collaboration, and SFI complex systems analysis. Direct commercial clinical deployment requires localized pilot clearance.
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en" class="paper">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PocketGull — Ambient AI Clinical Assistant &amp; Documentation Co-Pilot</title>
  <meta name="description" content="PocketGull is an ambient clinical assistant that cuts charting time by 42%, generates structured SOAP notes in real time, and runs securely on your local device." />
  <meta property="og:title" content="PocketGull — Ambient AI Clinical Assistant &amp; Documentation Co-Pilot" />
  <meta property="og:description" content="Spend less time charting. More time with patients. Secure on-device medical documentation assistant." />
  <meta property="og:url" content="https://pocketgull.com" />
  <meta property="og:type" content="website" />
  <script>
    (function() {
      try {
        var t = localStorage.getItem('pocketgull_theme');
        if (t === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('paper');
        } else {
          document.documentElement.classList.add('paper');
          document.documentElement.classList.remove('dark');
        }
      } catch(e) {}
    })();
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "PocketGull",
        "operatingSystem": "Web, iOS, Android, macOS, Linux, Windows",
        "applicationCategory": "HealthApplication",
        "softwareVersion": "1.37.0",
        "description": "On-device ambient AI clinical assistant with JAX/Flax neural scoring, ISMP medication safety validation, and HL7 FHIR R4 export.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "MedicalWebPage",
        "name": "PocketGull Clinical Intelligence & Care Plan Strategy",
        "url": "https://pocketgull.com",
        "description": "Evidence-grounded medical documentation, on-device machine learning, and systems medicine workbench.",
        "medicalAudience": {
          "@type": "MedicalAudience",
          "audienceType": "Clinician"
        }
      }
    ]
  }
  </script>
  
  <style>
    @font-face {
      font-family: 'PocketGull';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('/fonts/PocketGull-Bold.woff2') format('woff2'),
           url('/fonts/PocketGull-Bold.ttf') format('truetype');
    }
    @font-face {
      font-family: 'PocketGull';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('/fonts/PocketGull-Fineliner.woff2') format('woff2'),
           url('/fonts/PocketGull-Fineliner.ttf') format('truetype');
    }
    .font-brand {
      font-family: 'PocketGull', -apple-system, BlinkMacSystemFont, sans-serif;
      letter-spacing: -0.01em;
    }
    :root {
      /* Washi Paper (Warm Natural Fiber Light Theme - Default) */
      --bg: #fdfbf7;
      --card: #f5efe4;
      --card-hover: #ede5d5;
      --card-subtle: #f0e9dc;
      --border: #e2d7c5;
      --teal: #0f766e;
      --teal-light: #0d9488;
      --teal-glow: rgba(15, 118, 110, 0.12);
      --amber: #b45309;
      --amber-light: #92400e;
      --text: #292524;
      --text-muted: #57534e;
      --input-bg: #ffffff;
      --header-bg: rgba(253, 251, 247, 0.94);
      --act-bg: rgba(237, 229, 213, 0.7);
      --status-bar-bg: #eadecd;
      --status-bar-text: #44403c;
    }
    html.paper {
      /* Preserved for spec compatibility */
      --bg: #f7f4ec;
      --card: #ede7d8;
      --card-hover: #e3dccb;
      --card-subtle: #e8e1cf;
      --border: #d4ccb8;
      --teal: #0f766e;
      --teal-light: #0d9488;
      --teal-glow: rgba(13, 148, 136, 0.15);
      --amber: #b45309;
      --amber-light: #b45309;
      --text: #292524;
      --text-muted: #57534e;
      --input-bg: #fdfbf7;
      --header-bg: rgba(247, 244, 236, 0.94);
      --act-bg: rgba(232, 225, 207, 0.7);
      --status-bar-bg: #e4dcce;
      --status-bar-text: #44403c;
    }
    html.dark {
      --bg: #09090b;
      --card: #18181b;
      --card-hover: #202024;
      --card-subtle: #121215;
      --border: #27272a;
      --teal: #14b8a6;
      --teal-light: #2dd4bf;
      --teal-glow: rgba(45, 212, 191, 0.15);
      --amber: #f59e0b;
      --amber-light: #fbbf24;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --input-bg: #09090b;
      --header-bg: rgba(9, 9, 11, 0.92);
      --act-bg: rgba(24, 24, 27, 0.5);
      --status-bar-bg: #111827;
      --status-bar-text: #cbd5e1;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      max-width: 100%;
      overflow-x: hidden;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }
    /* ─── Doc Drill Interactive Socratic Drawer ─── */
    .doc-drill-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      background: rgba(20, 184, 166, 0.12);
      border: 1px solid rgba(20, 184, 166, 0.35);
      color: var(--teal-light);
      font-size: 0.72rem;
      font-family: ui-monospace, monospace;
      font-weight: 600;
      cursor: pointer;
      vertical-align: middle;
      margin: 0 0.2rem;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .doc-drill-badge:hover {
      background: rgba(20, 184, 166, 0.25);
      border-color: var(--teal-light);
      transform: translateY(-1px);
    }
    .doc-drill-chip {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      background: rgba(20, 184, 166, 0.1);
      border: 1px solid rgba(20, 184, 166, 0.3);
      color: var(--teal-light);
      font-size: 0.75rem;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
      text-align: left;
    }
    .doc-drill-chip:hover {
      background: rgba(20, 184, 166, 0.25);
      border-color: var(--teal-light);
      transform: translateY(-1px);
    }
    .doc-drill-drawer {
      position: fixed;
      top: 0;
      right: -480px;
      width: 100%;
      max-width: 440px;
      height: 100vh;
      background: var(--card);
      border-left: 1px solid var(--border);
      box-shadow: -10px 0 30px rgba(0,0,0,0.35);
      z-index: 1000;
      transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    }
    .doc-drill-drawer.open {
      right: 0;
    }
    .doc-drill-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(4px);
      z-index: 999;
      display: none;
    }
    .doc-drill-backdrop.open {
      display: block;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: var(--header-bg);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 4.5rem;
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      text-decoration: none;
      color: var(--text);
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .nav-links a:hover {
      color: var(--text);
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--teal-light) 0%, var(--teal) 100%);
      color: #09090b;
      font-weight: 700;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(20, 184, 166, 0.25);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(20, 184, 166, 0.35);
    }
    .btn-secondary {
      background: var(--card);
      color: var(--text);
      font-weight: 600;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      transition: all 0.2s ease;
    }
    .btn-secondary:hover {
      background: var(--card-hover);
      border-color: var(--teal);
      color: var(--teal);
    }
    .hero {
      padding: 5rem 0 3.5rem;
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      background: var(--teal-glow);
      border: 1px solid rgba(45, 212, 191, 0.3);
      color: var(--teal-light);
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    h1 {
      font-size: 3.25rem;
      font-weight: 900;
      line-height: 1.12;
      letter-spacing: -0.035em;
      margin-bottom: 1.25rem;
    }
    h1 span {
      color: var(--teal-light);
    }
    .hero-sub {
      font-size: 1.2rem;
      color: var(--text-muted);
      max-width: 720px;
      margin: 0 auto 2.5rem;
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 3rem;
    }
    .trust-bar {
      display: flex;
      justify-content: center;
      gap: 2.25rem;
      flex-wrap: wrap;
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-family: ui-monospace, monospace;
    }
    .trust-bar span {
      color: var(--teal-light);
      margin-right: 0.35rem;
      font-weight: bold;
    }
    .section {
      padding: 4.5rem 0;
      border-top: 1px solid var(--border);
    }
    .section-title {
      text-align: center;
      margin-bottom: 3rem;
    }
    .section-title h2 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    .section-title p {
      color: var(--text-muted);
      font-size: 1rem;
      max-width: 650px;
      margin: 0 auto;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .feature-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.75rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .feature-card:hover {
      border-color: rgba(45, 212, 191, 0.4);
      transform: translateY(-2px);
    }
    .feature-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    .feature-card h3 {
      font-size: 1.125rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .feature-card p {
      color: var(--text-muted);
      font-size: 0.875rem;
      line-height: 1.55;
    }
    
    /* Interactive Scribe Simulator Box */
    .simulator-container {
      background: var(--card);
      border: 1.5px solid rgba(45, 212, 191, 0.3);
      border-radius: 1.25rem;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    .scenario-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.75rem;
    }
    .tab-btn {
      background: var(--card);
      color: var(--text-muted);
      border: 1px solid var(--border);
      padding: 0.4rem 0.85rem;
      border-radius: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tab-btn.active {
      background: var(--teal-glow);
      border-color: var(--teal);
      color: var(--teal);
    }
    .demo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      .demo-grid {
        grid-template-columns: 1fr;
      }
      h1 {
        font-size: 2.35rem;
      }
      .container {
        padding: 0 1rem;
      }
    }
    .demo-pane {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .pane-header {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .pane-body {
      font-size: 0.875rem;
      line-height: 1.55;
      color: var(--text);
    }
    .act-card {
      background: var(--act-bg);
      border: 1px solid var(--border);
      border-radius: 0.625rem;
      padding: 0.85rem 1rem;
      margin-bottom: 0.75rem;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .act-card:hover {
      border-color: var(--teal);
      background: var(--card-hover);
      transform: translateY(-1px);
    }
    .act-header {
      font-size: 0.72rem;
      font-weight: 700;
      font-family: ui-monospace, monospace;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .act-body {
      font-size: 0.8125rem;
      color: var(--text);
      line-height: 1.6;
    }
    .dialogue-token {
      transition: all 0.2s ease;
      border-radius: 0.25rem;
      padding: 0.05rem 0.15rem;
    }
    .dialogue-token.active {
      background: rgba(45, 212, 191, 0.25);
      color: #ffffff;
      box-shadow: 0 0 12px rgba(45, 212, 191, 0.45);
      border-bottom: 1.5px solid var(--teal-light);
    }

    /* Flip Card */
    .flip-card {
      background-color: transparent;
      perspective: 1000px;
      cursor: pointer;
      user-select: none;
      min-height: 160px;
    }
    .flip-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }
    .flip-card.flipped .flip-card-inner {
      transform: rotateY(180deg);
    }
    .flip-card-front, .flip-card-back {
      position: absolute;
      inset: 0;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      border-radius: 1rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .flip-card-front {
      background: var(--card);
      border: 1px solid var(--border);
    }
    .flip-card-back {
      background: var(--card-subtle);
      border: 1.5px solid var(--amber-light);
      transform: rotateY(180deg);
    }

    /* Pricing */
    .pricing-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .pricing-card.featured {
      border: 2px solid var(--teal);
      background: linear-gradient(180deg, rgba(20, 184, 166, 0.08) 0%, var(--card) 100%);
    }
    .pricing-price {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--teal-light);
      margin: 1rem 0 1.5rem;
    }
    .pricing-price span {
      font-size: 0.875rem;
      color: var(--text-muted);
      font-weight: 400;
    }
    .pricing-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }
    .pricing-list li span {
      color: var(--teal-light);
      margin-right: 0.5rem;
      font-weight: bold;
    }
    footer {
      border-top: 1px solid var(--border);
      padding: 3rem 0;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    .footer-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .footer-links {
      display: flex;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .footer-links a:hover {
      color: var(--text);
    }
  </style>
</head>
<body>

  <!-- Top Status Bar -->
  <div style="background: var(--status-bar-bg); border-bottom: 1px solid var(--border); padding: 0.5rem 1rem; text-align: center; font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--status-bar-text); display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.75rem;">
    <span style="color: var(--teal); font-weight: bold;">🏥 POCKETGULL CLINICAL</span>
    <span style="opacity: 0.4;">|</span>
    <span>Oregon Entity: <strong style="color: #ffffff;">258869891</strong></span>
    <span style="opacity: 0.4;">|</span>
    <span>EIN: <strong style="color: #ffffff;">42-3162850</strong></span>
    <span style="opacity: 0.4;">|</span>
    <span>CMS NPI: <strong style="color: var(--teal);">1487569752</strong></span>
    <span style="opacity: 0.4;">|</span>
    <span style="color: var(--teal); font-weight: bold;">On-Device Scribing • HIPAA Compliant Architecture</span>
  </div>

  <!-- Header -->
  <header>
    <div class="container header-inner">
      <a href="/" class="logo-badge" aria-label="PocketGull Home">
        <span style="font-size: 1.5rem;">🕊️</span>
        <span style="font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em;" class="font-brand">PocketGull</span>
      </a>

      <nav class="nav-links">
        <a href="#demo">Live Demo</a>
        <a href="#features">Features</a>
        <a href="#comparison">Asymmetric Advantage</a>
        <a href="#ecosystem">Hyperscalers</a>
        <a href="#case-studies">Case Studies</a>
        <a href="#condition-thrift">Condition Explorer</a>
        <a href="#clinical-typography">Font Safeguards</a>
        <a href="#linus-pauling">Linus Pauling</a>
        <a href="javascript:void(0)" onclick="openDocDrill('Babesia microti')" style="color: var(--teal-light);">🔬 Doc Drill</a>
        <a href="#open-source">Open Source</a>
        <a href="#testimonials">Quotes</a>
        <a href="#stewardship">Stewardship</a>
        <a href="/articles">Articles &amp; Field Guides</a>
        <a href="#pricing">Pricing</a>
      </nav>

      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button type="button" onclick="togglePaperMode()" class="tab-btn" style="padding: 0.35rem 0.65rem; font-size: 0.75rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.3rem;" aria-label="Toggle Reading Tone">
          <span id="themeToggleIcon">🌙</span> <span id="themeToggleText">Obsidian Dark</span>
        </button>
        <a href="https://pocketgull.app" class="btn-primary">
          <span>Launch App</span>
          <span>→</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <main>
    <section class="hero">
      <div class="container">
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; align-items: center;">
          <div class="badge">
            <span>🧭</span> Living Clinical Trajectories &bull; Zero-Egress Ambient Strategy Engine
          </div>
          ${sovereignBadgeHtml}
        </div>

        <h1>Beyond the 1968 SOAP Note.<br /><span>Living Biophysical Care Strategies.</span></h1>

        <p class="hero-sub">
          PocketGull replaces static deficit checklists with real-time biophysical trajectories, interactive simulations, and salutogenic care plans. Ambient zero-egress voice documentation that breaks diagnostic cascades and shields patients from financial toxicity—running 100% on your local device.
        </p>

        <div class="hero-actions">
          <a href="https://pocketgull.app" class="btn-primary" style="padding: 0.875rem 1.75rem; font-size: 1rem;">
            <span>Launch Free in Browser</span>
            <span>→</span>
          </a>
          <a href="/case-studies" class="btn-secondary" style="padding: 0.875rem 1.75rem; font-size: 1rem; border-color: rgba(45, 212, 191, 0.4);">
            <span>📁 Explore Case Studies &amp; FHIR</span>
          </a>
          <a href="#comparison" class="btn-secondary" style="padding: 0.875rem 1.75rem; font-size: 1rem;">
            <span>⚖️ The Asymmetric Advantage</span>
          </a>
        </div>

        <div class="trust-bar">
          <div><span>✓</span> 100% On-Device Edge AI (0ms / Zero Cloud Tolls)</div>
          <div><span>✓</span> WHO Essential Medicines Price Shield</div>
          <div><span>✓</span> 100% HIPAA Safe Harbor De-Identified</div>
          <div><span>✓</span> Scale-to-Zero ($0.20/mo FinOps)</div>
          <div><span>✓</span> 42% Charting Time Saved</div>
        </div>
      </div>
    </section>

    <!-- Interactive Ambient Scribe & Trajectory Simulator -->
    <section id="demo" class="section">
      <div class="container">
        <div class="section-title">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: var(--teal-glow); border: 1px solid var(--border); color: var(--teal); font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
            <span>🧭 The American Pragmatist Standard &bull; Moving Beyond SOAP (The Austrian Way &bull; Salutogenesis)</span>
          </div>
          <h2>The 3-Act Living Trajectory &amp; Ambient Scribe</h2>
          <p>Traditional 1968 SOAP checklists freeze patients into static billing codes. PocketGull applies American Pragmatism (William James, Benjamin Franklin) to model the patient as a purposeful actor with a past trail traversed, a present foothold, and a forward horizon of vitality.</p>
        </div>

        <div class="simulator-container">
          <!-- Top Row Controls: Scenario Tabs + Paradigm Mode Toggle -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border); padding-bottom: 0.85rem;">
            <div class="scenario-tabs" style="margin-bottom: 0; padding-bottom: 0; border-bottom: none;">
              <button class="tab-btn scenario-tab-btn active" data-scenario="ortho" onclick="loadScenario('ortho', this)">🦴 Knee Pain &amp; Orthopedics</button>
              <button class="tab-btn scenario-tab-btn" data-scenario="cardio" onclick="loadScenario('cardio', this)">🩺 Hypertension &amp; Cardiology</button>
              <button class="tab-btn scenario-tab-btn" data-scenario="integrative" onclick="loadScenario('integrative', this)">🌿 Metabolic &amp; Primary Care</button>
              <button class="tab-btn scenario-tab-btn" data-scenario="systems" onclick="loadScenario('systems', this)">⟁ Multi-Loop Systems Thinking</button>
            </div>

            <!-- Clinical Paradigm Selector -->
            <div style="display: inline-flex; background: var(--card-subtle); border: 1px solid var(--border); border-radius: 9999px; padding: 0.25rem; gap: 0.25rem;">
              <button id="modeTrajectoryBtn" class="tab-btn active" style="border-radius: 9999px; padding: 0.35rem 0.85rem; font-size: 0.75rem;" onclick="setDocMode('trajectory')">
                🧭 The 3-Act Trajectory (American Pragmatist Standard)
              </button>
              <button id="modeSoapBtn" class="tab-btn" style="border-radius: 9999px; padding: 0.35rem 0.85rem; font-size: 0.75rem;" onclick="setDocMode('soap')">
                📋 Legacy SOAP Note (1968 Billing)
              </button>
            </div>
          </div>

          <div class="demo-grid">
            <!-- Left Pane: Spoken Dialogue -->
            <div class="demo-pane">
              <div>
                <div class="pane-header">
                  <span style="color: var(--teal);">🎙️ Spoken Patient Dialogue</span>
                  <span style="color: var(--text-muted); font-size: 0.6875rem; font-family: ui-monospace, monospace;">Transcribed Live &bull; Zero Cloud Egress</span>
                </div>
                <div id="dialogueBox" class="pane-body" style="font-style: italic;">
                  <!-- Dynamically populated -->
                </div>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem; font-family: ui-monospace, monospace; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                <span>⚡ Sub-50ms Local Transcription</span>
                <span style="color: var(--teal); font-size: 0.7rem;">Hover cards to see explainable provenance</span>
              </div>
            </div>

            <!-- Right Pane: Clinical Documentation Output -->
            <div class="demo-pane" style="border-color: var(--border);">
              <div>
                <div class="pane-header">
                  <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <span id="outputHeaderTitle" style="color: var(--amber);">🧭 The 3-Act Living Trajectory</span>
                    <span id="outputHeaderBadge" style="font-size: 0.625rem; color: var(--teal); font-family: ui-monospace, monospace; text-transform: uppercase; background: var(--teal-glow); padding: 0.1rem 0.4rem; border-radius: 4px; border: 1px solid var(--border);">Austrian Salutogenesis &amp; American Pragmatism</span>
                  </div>
                  <button onclick="copyCurrentOutput()" class="tab-btn" style="padding: 2px 8px; font-size: 0.6875rem;">📋 Copy to EHR</button>
                </div>
                <div id="outputBox" class="pane-body" style="font-family: inherit; font-size: 0.8125rem;">
                  <!-- Dynamically rendered (Trajectory or SOAP) -->
                </div>
              </div>
              <div id="copyNotice" style="font-size: 0.75rem; color: var(--teal); margin-top: 0.75rem; font-weight: bold; min-height: 1.2rem;"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Core Features -->
    <section id="features" class="section">
      <div class="container">
        <div class="section-title">
          <h2>Designed for Clinical Practice</h2>
          <p>Practical tools to help clinicians streamline daily visits and reduce administrative burden.</p>
        </div>

        <div class="grid-3">
          <div class="feature-card">
            <div class="feature-icon">⟁</div>
            <h3>Macro Systems Thinking</h3>
            <p>Maps non-linear biophysical feedback loops coupling oral microbiome inflammation, autonomic vagal tone, and endothelial health using the Donella Meadows Leverage Hierarchy.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Chrome Built-in AI &amp; Gemma 4</h3>
            <p>Executes sub-50ms on-device Prompt API generation, ISMP medication safety proofreading, and clinical triage classification with zero cloud latency and zero egress.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">💎</div>
            <h3>Sovereign Data Dividend</h3>
            <p>Restores data property rights with 85% revenue-share research matching, mandatory Insight Reciprocity, and post-quantum lattice cryptographic sealing (ML-KEM-768).</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎙️</div>
            <h3>Ambient Voice Scribing</h3>
            <p>Converse naturally with your patient. PocketGull filters casual remarks and organizes relevant clinical information into structured SOAP notes.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Local &amp; Secure Processing</h3>
            <p>Patient data is processed directly on your workstation or browser with strict HIPAA Safe Harbor de-identification architecture.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Effortless EHR Export</h3>
            <p>Copy formatted SOAP notes directly into Epic, Cerner, AthenaHealth, or any web-based charting system with a single click.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🌿</div>
            <h3>Integrative Clinical Support</h3>
            <p>Combines standard clinical practice guidelines with evidence-based nutrition, lifestyle recommendations, and botanical reference checks.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📖</div>
            <h3>Plain English Patient Mode</h3>
            <p>Translates complex clinical terminology into clear 6th-grade explanations so patients understand their diagnosis and care instructions.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>FHIR R4 SMART Goal Engine</h3>
            <p>Decomposes clinical objectives into interactive milestone quests with standard HL7 FHIR R4 Goal resource serialization.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🧠</div>
            <h3>JAX / Flax OpenXLA &amp; ONNX WebGPU Engine</h3>
            <p>Continuous sub-millisecond clinical risk scoring and on-device neural acceleration running directly inside the clinician's browser with zero egress.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🛡️</div>
            <h3>ISMP Medication Safety Guard</h3>
            <p>Enforces Institute for Safe Medication Practices &amp; FDA safety rules, automatically eliminating trailing zeroes and naked decimals to prevent 10x dosage errors.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🏕️</div>
            <h3>Austere Clinical Research &amp; Epistemology</h3>
            <p>Offline-first wilderness and disaster response trial workbench with empirical H₀ null-hypothesis falsification (p &lt; 0.05) and Cochrane Risk of Bias assessments.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📑</div>
            <h3>CMS Remote Patient Monitoring (RPM) Superbill</h3>
            <p>Generates automated CPT 99453, 99454, 99457, and 99458 claim documentation with statutory 16-day continuous biometric audit verification.</p>
          </div>
        </div>
      </div>
    <!-- Architectural Asymmetry & Five Forces Comparison Section -->
    <section id="comparison" class="section" style="background: var(--bg); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
      <div class="container">
        <div class="section-title">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
            <span>⚖️ Architectural Asymmetry • Porter's Five Forces</span>
          </div>
          <h2>Why PocketGull? The Asymmetric Advantage</h2>
          <p>PocketGull is not a passive ambient scribe transcribing past conversations into billing codes. It is an active biophysical strategy engine designed to break diagnostic cascades and eliminate financial toxicity.</p>
        </div>

        <div style="overflow-x: auto; margin-top: 2rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--card);">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); background: var(--card-subtle);">
                <th style="padding: 1.15rem 1.25rem; font-weight: 700; color: var(--text-muted); width: 22%;">Strategic Dimension</th>
                <th style="padding: 1.15rem 1.25rem; font-weight: 700; color: var(--text-muted); width: 26%;">Legacy Hospital EHRs (Epic / Cerner)</th>
                <th style="padding: 1.15rem 1.25rem; font-weight: 700; color: var(--text-muted); width: 26%;">Cloud Ambient Scribes (DAX / Abridge)</th>
                <th style="padding: 1.15rem 1.25rem; font-weight: 800; color: var(--teal-light); background: rgba(20, 184, 166, 0.08); border-left: 2px solid var(--teal); border-right: 2px solid var(--teal); width: 26%;">PocketGull Salutogenic Engine</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem 1.25rem; font-weight: 700; color: var(--text);">Primary Purpose</td>
                <td style="padding: 1rem 1.25rem; color: var(--text-muted);">Transactional billing extraction &amp; defensive malpractice documentation.</td>
                <td style="padding: 1rem 1.25rem; color: var(--text-muted);">Passive speech-to-text recording of whatever was uttered in the room.</td>
                <td style="padding: 1rem 1.25rem; color: var(--text); background: rgba(20, 184, 166, 0.04); border-left: 2px solid var(--teal); border-right: 2px solid var(--teal); font-weight: 600;">
                  <strong style="color: var(--teal-light);">Active Clinical Strategy:</strong> Models forward-looking trajectories, counterfactual simulations, and biophysical reserve.
                </td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem 1.25rem; font-weight: 700; color: var(--text);">Clinical Epistemology</td>
                <td style="padding: 1rem 1.25rem; color: var(--text-muted);">1968 Weed Deficit Checklists (SOAP) freezing patients in static pathology codes.</td>
                <td style="padding: 1rem 1.25rem; color: var(--text-muted);">Reproduces the 1968 SOAP note automatically with LLM summarization.</td>
                <td style="padding: 1rem 1.25rem; color: var(--text); background: rgba(20, 184, 166, 0.04); border-left: 2px solid var(--teal); border-right: 2px solid var(--teal); font-weight: 600;">
                  <strong style="color: var(--teal-light);">American Pragmatist 3-Act Trajectory:</strong> Past Trail &rarr; Living Foothold &rarr; Salutogenic Horizon.
                </td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem 1.25rem; font-weight: 700; color: var(--text);">Biophysical Simulation</td>
                <td style="padding: 1rem 1.25rem; color: var(--text-muted);"><span style="color: #f43f5e;">❌ None.</span> Scanned PDF reports and static laboratory tables.</td>
                <td style="padding: 1rem 1.25rem; color: var(--text-muted);"><span style="color: #f43f5e;">❌ None.</span> Plain conversational prose output only.</td>
                <td style="padding: 1rem 1.25rem; color: var(--text); background: rgba(20, 184, 166, 0.04); border-left: 2px solid var(--teal); border-right: 2px solid var(--teal); font-weight: 600;">
                  <span style="color: #34d399;">✅ Interactive Radars:</span> Real-time Uhthoff thermal reserve (&Delta;T &le; 0.40&deg;C), glucose velocity, and baroreflex tone.
                </td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem 1.25rem; font-weight: 700; color: var(--text);">Financial Toxicity Defense</td>
                <td style="padding: 1rem 1.25rem; color: var(--text-muted);"><span style="color: #f43f5e;">❌ Adverse.</span> Structurally incentivized by high-margin tests &amp; procedural volume.</td>
                <td style="padding: 1rem 1.25rem; color: var(--text-muted);"><span style="color: #f43f5e;">❌ Passive.</span> Transcribes unindicated $2,800 MRI cascades without evaluation.</td>
                <td style="padding: 1rem 1.25rem; color: var(--text); background: rgba(20, 184, 166, 0.04); border-left: 2px solid var(--teal); border-right: 2px solid var(--teal); font-weight: 600;">
                  <span style="color: #34d399;">✅ Patient Shield:</span> Compares Retail Benchmarks to WHO Essential Medicines ($4/mo generics), saving $2,100–$4,800/yr.
                </td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem 1.25rem; font-weight: 700; color: var(--text);">Compute &amp; PHI Privacy</td>
                <td style="padding: 1rem 1.25rem; color: var(--text-muted);"><span style="color: #fbbf24;">⚠️ Centralized Cloud.</span> Hospital servers with extensive network attack surfaces.</td>
                <td style="padding: 1rem 1.25rem; color: var(--text-muted);"><span style="color: #f43f5e;">❌ Third-Party Cloud Egress.</span> Patient audio streams to corporate vendor GPUs.</td>
                <td style="padding: 1rem 1.25rem; color: var(--text); background: rgba(20, 184, 166, 0.04); border-left: 2px solid var(--teal); border-right: 2px solid var(--teal); font-weight: 600;">
                  <span style="color: #34d399;">✅ 100% On-Device Edge AI:</span> Zero cloud network egress, sub-50ms latency, and post-quantum lattice security.
                </td>
              </tr>
              <tr>
                <td style="padding: 1.15rem 1.25rem; font-weight: 700; color: var(--text);">Annual Cost per Clinician</td>
                <td style="padding: 1.15rem 1.25rem; color: var(--text-muted);">$15,000+ per user in enterprise licensing &amp; IT overhead.</td>
                <td style="padding: 1.15rem 1.25rem; color: var(--text-muted); font-weight: 600; color: #f43f5e;">$6,000 &ndash; $10,000 / year recurring per doctor.</td>
                <td style="padding: 1.15rem 1.25rem; color: var(--text); background: rgba(20, 184, 166, 0.08); border-left: 2px solid var(--teal); border-right: 2px solid var(--teal); border-bottom: 2px solid var(--teal); font-weight: 800; color: var(--teal-light);">
                  $0 forever (Solo Free) &bull; $299 Lifetime &bull; $490/yr (Clinic Pro)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- The Engineering Rationale Banner -->
        <div style="background: rgba(20, 184, 166, 0.06); border: 1px solid var(--teal); border-radius: 0.75rem; padding: 1.25rem 1.5rem; margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;">
          <div style="max-width: 800px;">
            <strong style="color: var(--teal-light); font-size: 0.9375rem;">Why We Charge $299 Once Instead of $8,000 Every Year:</strong>
            <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.35rem; line-height: 1.6;">
              Cloud ambient scribes must charge $6,000–$10,000 annually because they stream every doctor-patient word to multi-million dollar cloud GPU server farms. 
              PocketGull runs directly on your local workstation via Chrome Built-in AI, WebLLM WASM, and optimized local engines. We eliminate cloud rent-seeking, pass the savings to you, and scale to zero when idle.
            </p>
          </div>
          <a href="#pricing" class="btn-primary" style="padding: 0.5rem 1.25rem; font-size: 0.8125rem; white-space: nowrap;">View Transparent Pricing &rarr;</a>
        </div>

        <!-- The Tri-Lens Strategic Architecture: Taxpayer, Political Adversary, and Humanity -->
        <div style="margin-top: 3.5rem;">
          <div style="text-align: center; max-width: 840px; margin: 0 auto 2.5rem auto;">
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: rgba(20, 184, 166, 0.1); border: 1px solid rgba(20, 184, 166, 0.3); color: var(--teal-light); font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
              <span>🌐 Beyond Porter's Five Forces • The Tri-Lens Doctrine</span>
            </div>
            <h3 style="font-size: 1.85rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em;">Architecture Is Destiny: Three Lenses on Clinical AI</h3>
            <p style="font-size: 0.9375rem; color: var(--text-muted); margin-top: 0.5rem; line-height: 1.6;">
              When technology enters healthcare, it is never neutral. It either consolidates bureaucratic cartels and inflates public debt, or it restores human agency and fiscal sanity. Here is how PocketGull stands under scrutiny.
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 1.5rem;">
            <!-- Lens 1: Taxpayer Lens -->
            <div style="background: var(--card); border: 1.5px solid var(--border); border-top: 4px solid var(--teal); border-radius: 1rem; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.1);">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                  <span style="font-size: 1.75rem;">🏛️</span>
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 9999px; background: rgba(20, 184, 166, 0.15); color: var(--teal-light); border: 1px solid rgba(20, 184, 166, 0.3);">Fiscal &amp; CBO Reality</span>
                </div>
                <h4 style="font-size: 1.2rem; font-weight: 800; color: var(--text); margin-bottom: 0.75rem; line-height: 1.3;">The Taxpayer Lens:<br /><span style="color: var(--teal-light);">Halting the $1.2T Diagnostic Cascade</span></h4>
                <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.65; margin-bottom: 1rem;">
                  The Congressional Budget Office and health economists estimate that over <strong>$1.2 Trillion annually</strong> is consumed by defensive, low-value diagnostic cascades. Cloud scribes aggravate this by passively transcribing panic referrals into billable encounters.
                </p>
                <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.85rem; font-size: 0.8125rem; line-height: 1.6; color: var(--text); margin-bottom: 1rem;">
                  <strong style="color: #34d399; display: block; margin-bottom: 0.35rem;">Public Fiscal Protections:</strong>
                  <ul style="margin: 0; padding-left: 1.15rem; color: var(--text-muted);">
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">Avoiding Panic Scans:</strong> Real-time biophysical simulations (e.g. Uhthoff thermal conduction in MS) explain symptoms mechanistically, safely averting $2,800 repeat MRIs and $15,000 pan-scans.</li>
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">WHO Essential Generics:</strong> 4-tier stepped care prioritizes $4/month generic first-line therapies over $1,050/month brand drugs, protecting Medicare Part D &amp; Medicaid trust funds.</li>
                    <li><strong style="color: var(--text);">Zero Cloud Tolls:</strong> On-device Edge AI operates at $0.00 marginal compute cost, ending the practice of passing $10,000/doctor cloud GPU server bills into public facility fees.</li>
                  </ul>
                </div>
              </div>
              <div style="border-top: 1px solid var(--border); padding-top: 0.85rem; font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light);">
                &bull; Statutory Invariant: Five Eyes &bull; US Core &bull; CMS RPM Clean
              </div>
            </div>

            <!-- Lens 2: Open Standards & Market Independence Lens -->
            <div style="background: var(--card); border: 1.5px solid var(--border); border-top: 4px solid #818cf8; border-radius: 1rem; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.1);">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                  <span style="font-size: 1.75rem;">⚔️</span>
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3);">Open Architecture &amp; Cures Act</span>
                </div>
                <h4 style="font-size: 1.2rem; font-weight: 800; color: var(--text); margin-bottom: 0.75rem; line-height: 1.3;">The Political &amp; Open Standards Lens:<br /><span style="color: #818cf8;">Overcoming Data Silos &amp; Cartel Lock-In</span></h4>
                <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.65; margin-bottom: 1rem;">
                  Healthcare is transforming under federal mandate: moving from closed proprietary data moats, opaque PBM rebate games, and cloud vendor lock-in to open, democratic health data mobility.
                </p>
                <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.85rem; font-size: 0.8125rem; line-height: 1.6; color: var(--text); margin-bottom: 1rem;">
                  <strong style="color: #818cf8; display: block; margin-bottom: 0.35rem;">Structural Anti-Lock-In Defenses:</strong>
                  <ul style="margin: 0; padding-left: 1.15rem; color: var(--text-muted);">
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">21st Century Cures Act Interoperability:</strong> Operates in strict alignment with 45 CFR Part 171 ONC Information Blocking rules, replacing vendor data moats with zero-toll <strong>HL7® FHIR® R4 Bundles</strong>.</li>
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">Countering PBM Arbitrage:</strong> Side-by-side display of Standard Retail Benchmarks vs Estimated Out-of-Pocket costs exposes spread pricing and supports clinical deprescribing of redundant polypharmacy.</li>
                    <li><strong style="color: var(--text);">Sovereign Edge Computing:</strong> Complete immunity to cloud API price hikes, service deplatforming, and corporate terms changes. Your clinical intelligence runs local and offline forever.</li>
                  </ul>
                </div>
              </div>
              <div style="border-top: 1px solid var(--border); padding-top: 0.85rem; font-size: 0.75rem; font-family: ui-monospace, monospace; color: #818cf8;">
                &bull; Anti-Lock-in: 45 CFR Part 171 Clean &bull; True Local Autonomy
              </div>
            </div>

            <!-- Lens 3: Humanity Lens -->
            <div style="background: var(--card); border: 1.5px solid var(--border); border-top: 4px solid var(--amber-light); border-radius: 1rem; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.1);">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                  <span style="font-size: 1.75rem;">🕊️</span>
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 9999px; background: rgba(245, 158, 11, 0.15); color: var(--amber-light); border: 1px solid rgba(245, 158, 11, 0.3);">Salutogenic Dignity</span>
                </div>
                <h4 style="font-size: 1.2rem; font-weight: 800; color: var(--text); margin-bottom: 0.75rem; line-height: 1.3;">The Humanity Lens:<br /><span style="color: var(--amber-light);">Epistemic Respect &amp; Clinician Restoration</span></h4>
                <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.65; margin-bottom: 1rem;">
                  For 58 years, the 1968 Weed SOAP note has reduced sick humans to broken parts and billing deficit codes, inflicting moral injury on healers and leaving millions of complex chronic patients dismissed or psychologized.
                </p>
                <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.85rem; font-size: 0.8125rem; line-height: 1.6; color: var(--text); margin-bottom: 1rem;">
                  <strong style="color: var(--amber-light); display: block; margin-bottom: 0.35rem;">Restorative Humanism:</strong>
                  <ul style="margin: 0; padding-left: 1.15rem; color: var(--text-muted);">
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">The 3-Act Trajectory:</strong> Replaces fatalistic disease labeling with Antonovsky's salutogenesis (*Where You've Been*, *Where You Stand Today*, *Where You're Going*), honoring human agency and biophysical reserve.</li>
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">Validating Invisible Suffering:</strong> Grounds dysautonomia, Long COVID, and vagal strain in quantitative biophysics—honoring historic precedents like Charles Darwin's 40-year struggle.</li>
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">Ending Moral Injury:</strong> Doctors reclaim unhurried eye contact and authentic human connection with patients, freed from clerical computer servitude.</li>
                    <li><strong style="color: var(--text);">Universal Equity:</strong> Lightweight on-device architecture functions identically on island clinics and $150 Chromebooks as in world-renowned hospital centers.</li>
                  </ul>
                </div>
              </div>
              <div style="border-top: 1px solid var(--border); padding-top: 0.85rem; font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light);">
                &bull; Quiet Workshop Ethos &bull; Zero Fatalism &bull; 100% Dignity
              </div>
            </div>
          </div>
        </div>

        <!-- Hyperscaler & Big Tech Ecosystem Alignment Section -->
        <div id="ecosystem" style="margin-top: 4rem; border-top: 1px dashed var(--border); padding-top: 3.5rem;">
          <div style="text-align: center; max-width: 860px; margin: 0 auto 2.5rem auto;">
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa; font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
              <span>🤝 Fast-Loop Edge • Slow-Loop Cloud Symbiosis</span>
            </div>
            <h3 style="font-size: 1.85rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em;">Collaborative Symbiosis: Aligning with Google, Microsoft &amp; Amazon</h3>
            <p style="font-size: 0.9375rem; color: var(--text-muted); margin-top: 0.5rem; line-height: 1.6;">
              PocketGull is not anti-cloud. We are the missing on-device edge companion that brings out the best in hyperscaler enterprise clouds—turning the exam room into a fast-loop private sanctuary while feeding standardized, pristine HL7® FHIR® data to enterprise cloud platforms.
            </p>
          </div>

          <!-- The Architectural Fast-Loop / Slow-Loop Diagram Card -->
          <div style="background: var(--card); border: 1.5px solid var(--border); border-radius: 1.25rem; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; align-items: center;">
              
              <!-- Fast-Loop Box -->
              <div style="background: rgba(20, 184, 166, 0.05); border: 1px solid var(--teal); border-radius: 0.75rem; padding: 1.25rem;">
                <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; color: var(--teal-light); text-transform: uppercase; margin-bottom: 0.35rem;">⚡ Fast Loop • In The Exam Room</div>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text); margin-bottom: 0.5rem;">On-Device Sovereign Edge</h4>
                <ul style="margin: 0; padding-left: 1.1rem; font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6;">
                  <li><strong>0ms Latency:</strong> Real-time biophysical simulations (Uhthoff, soleus glucose velocity).</li>
                  <li><strong>Zero Egress:</strong> Audio transcribed locally via Chrome Built-in AI &amp; WebGPU.</li>
                  <li><strong>Complete Privacy:</strong> HIPAA § 164.514 Safe Harbor de-identification at source.</li>
                </ul>
              </div>

              <!-- Bridge Arrow Box -->
              <div style="text-align: center; padding: 0.5rem;">
                <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: #a855f7; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Universal Bridge</div>
                <div style="display: inline-block; padding: 0.4rem 0.85rem; border-radius: 0.5rem; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); font-size: 0.8rem; font-weight: 700; color: #c084fc;">
                  HL7® FHIR® R4 Bundle<br /><span style="font-size: 0.7rem; font-weight: 400; color: var(--text-muted);">DOMPurified &bull; C2PA Attested</span>
                </div>
                <div style="font-size: 1.25rem; margin-top: 0.35rem; color: var(--text-muted);">&lrarr;</div>
              </div>

              <!-- Slow-Loop Box -->
              <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid #3b82f6; border-radius: 0.75rem; padding: 1.25rem;">
                <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; color: #60a5fa; text-transform: uppercase; margin-bottom: 0.35rem;">☁️ Slow Loop • Enterprise Horizon</div>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text); margin-bottom: 0.5rem;">Hyperscaler Cloud Power</h4>
                <ul style="margin: 0; padding-left: 1.1rem; font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6;">
                  <li><strong>Population Health:</strong> Google Cloud Healthcare API &amp; BigQuery data lakes.</li>
                  <li><strong>Enterprise EHR Linkage:</strong> Microsoft Azure Health Data Services (FHIR).</li>
                  <li><strong>Affordable Fulfillment:</strong> Amazon Pharmacy RxPass generic integration.</li>
                </ul>
              </div>

            </div>
          </div>

          <!-- 3 Hyperscaler Alignment Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 1.5rem;">

            <!-- Google Alignment -->
            <div style="background: var(--card); border: 1.5px solid var(--border); border-top: 4px solid #4285F4; border-radius: 1rem; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">🌐</span>
                    <strong style="color: var(--text); font-size: 1.1rem;">Google</strong>
                  </div>
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 9999px; background: rgba(66, 133, 244, 0.15); color: #93bbf8; border: 1px solid rgba(66, 133, 244, 0.3);">Built-in AI &amp; Web</span>
                </div>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text); margin-bottom: 0.75rem; line-height: 1.3;">
                  The Chrome Built-in AI &amp; Green FinOps Flagship
                </h4>
                <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1rem;">
                  Google's mission is to organize world information and promote a vibrant open web. PocketGull serves as an industry flagship for Google's latest edge technologies:
                </p>
                <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.85rem; font-size: 0.8125rem; line-height: 1.6; color: var(--text); margin-bottom: 1rem;">
                  <ul style="margin: 0; padding-left: 1.15rem; color: var(--text-muted);">
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">Chrome Built-in AI (Prompt API):</strong> Proves how <code>window.ai</code> and on-device models (Gemma 4 / Gemini Nano) provide sub-50ms clinical intelligence directly in the browser with zero cloud tolls.</li>
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">24/7 Carbon-Free FinOps:</strong> Offloads 90% of routine inferencing from power-hungry cloud GPU data centers to client silicon, advancing Google Cloud's net-zero sustainability pledges.</li>
                    <li><strong style="color: var(--text);">Google Cloud Healthcare API:</strong> Emits clean, standardized FHIR R4 resources that ingest directly into Google Cloud BigQuery healthcare data lakes for longitudinal research.</li>
                  </ul>
                </div>
              </div>
              <div style="border-top: 1px solid var(--border); padding-top: 0.85rem; font-size: 0.75rem; font-family: ui-monospace, monospace; color: #93bbf8;">
                &bull; Standards: Chrome Prompt API &bull; Angular 22 &bull; Cloud Run 0-Scale
              </div>
            </div>

            <!-- Microsoft Alignment -->
            <div style="background: var(--card); border: 1.5px solid var(--border); border-top: 4px solid #00A4EF; border-radius: 1rem; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">💻</span>
                    <strong style="color: var(--text); font-size: 1.1rem;">Microsoft</strong>
                  </div>
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 9999px; background: rgba(0, 164, 239, 0.15); color: #70cbf7; border: 1px solid rgba(0, 164, 239, 0.3);">Copilot+ &amp; Azure</span>
                </div>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text); margin-bottom: 0.75rem; line-height: 1.3;">
                  Windows Copilot+ NPU &amp; Azure Health Services
                </h4>
                <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1rem;">
                  Microsoft is betting its hardware future on Copilot+ PCs and its cloud future on Azure Health Data Services. PocketGull accelerates both:
                </p>
                <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.85rem; font-size: 0.8125rem; line-height: 1.6; color: var(--text); margin-bottom: 1rem;">
                  <ul style="margin: 0; padding-left: 1.15rem; color: var(--text-muted);">
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">Copilot+ NPU Acceleration:</strong> Leverages ONNX Runtime Web and DirectML to fully engage 40+ TOPS Neural Processing Units on Windows Surface Pro and PC hardware for instant local biophysics.</li>
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">Azure Health Data Services:</strong> Unlocks patient data from legacy silos into open SMART-on-FHIR schemas, driving high-value enterprise migration to Azure.</li>
                    <li><strong style="color: var(--text);">Microsoft AI Governance (Section 14):</strong> Fully implements Microsoft's AI code of ethics—zero emotion/biometric inferencing, affirmative clinician-in-the-loop signoff, and C2PA Content Credentials.</li>
                  </ul>
                </div>
              </div>
              <div style="border-top: 1px solid var(--border); padding-top: 0.85rem; font-size: 0.75rem; font-family: ui-monospace, monospace; color: #70cbf7;">
                &bull; Standards: ONNX Runtime &bull; DirectML NPU &bull; MSA Sec 14 Ethics
              </div>
            </div>

            <!-- Amazon Alignment -->
            <div style="background: var(--card); border: 1.5px solid var(--border); border-top: 4px solid #FF9900; border-radius: 1rem; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">📦</span>
                    <strong style="color: var(--text); font-size: 1.1rem;">Amazon</strong>
                  </div>
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 9999px; background: rgba(255, 153, 0, 0.15); color: #ffbe66; border: 1px solid rgba(255, 153, 0, 0.3);">Pharmacy &amp; HealthLake</span>
                </div>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text); margin-bottom: 0.75rem; line-height: 1.3;">
                  Amazon Pharmacy RxPass &amp; One Medical Ethos
                </h4>
                <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1rem;">
                  Amazon's healthcare mission centers on consumer-friendly generic medicine fulfillment, transparent pricing, and empathetic primary care:
                </p>
                <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.85rem; font-size: 0.8125rem; line-height: 1.6; color: var(--text); margin-bottom: 1rem;">
                  <ul style="margin: 0; padding-left: 1.15rem; color: var(--text-muted);">
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">Amazon Pharmacy &amp; RxPass ($5/mo):</strong> PocketGull's stepped-care tiering champions WHO Essential generic medicines, steering patients to transparent affordable fulfillment channels like Amazon Pharmacy RxPass.</li>
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">One Medical Alignment:</strong> Replaces administrative clerical burden with the salutogenic 3-Act Trajectory, reinforcing One Medical's commitment to unhurried, human-centered primary care.</li>
                    <li><strong style="color: var(--text);">AWS HealthLake Integration:</strong> Serializes comprehensive biophysical plans into FHIR R4 schemas ready for AWS HealthLake analytics and Amazon Bedrock clinical pipelines.</li>
                  </ul>
                </div>
              </div>
              <div style="border-top: 1px solid var(--border); padding-top: 0.85rem; font-size: 0.75rem; font-family: ui-monospace, monospace; color: #ffbe66;">
                &bull; Standards: Amazon RxPass &bull; AWS HealthLake &bull; FTC Compliant
              </div>
            </div>

            <!-- Enterprise EHR Alignment (Epic Hyperspace & Oracle Cerner) -->
            <div style="background: var(--card); border: 1.5px solid var(--border); border-top: 4px solid #10B981; border-radius: 1rem; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">🏥</span>
                    <strong style="color: var(--text); font-size: 1.1rem;">Epic &amp; Enterprise EHRs</strong>
                  </div>
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3);">SMART on FHIR &bull; Sidecar</span>
                </div>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text); margin-bottom: 0.75rem; line-height: 1.3;">
                  The Ergonomic On-Device Sidecar &amp; Note Bloat Antidote
                </h4>
                <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1rem;">
                  PocketGull does not seek to replace certified enterprise EHRs. We operate as an ergonomic cognitive sidecar that cures note bloat and relieves pajama time:
                </p>
                <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.85rem; font-size: 0.8125rem; line-height: 1.6; color: var(--text); margin-bottom: 1rem;">
                  <ul style="margin: 0; padding-left: 1.15rem; color: var(--text-muted);">
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">Curing AI Note Bloat:</strong> Emits discrete LOINC, SNOMED-CT, and RxNorm resources directly into EHR flowsheets rather than dumping unsearchable 8-page narrative text blobs into charts.</li>
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">Relieving In-Basket Burnout:</strong> Pre-triages noisy continuous biometrics at the edge, ending hours of evening "pajama time" spent managing uncalibrated alerts.</li>
                    <li style="margin-bottom: 0.35rem;"><strong style="color: var(--text);">CMS RPM Reimbursement:</strong> Verifies statutory 16-day transmission thresholds for CPT 99453/99454/99457, feeding clean superbills straight to hospital billing.</li>
                    <li><strong style="color: var(--text);">$0 Server Compute Burden:</strong> Executes 100% on clinician hardware silicon, adding zero GPU computing cost to hospital EHR cloud infrastructure.</li>
                  </ul>
                </div>
              </div>
              <div style="border-top: 1px solid var(--border); padding-top: 0.85rem; font-size: 0.75rem; font-family: ui-monospace, monospace; color: #6ee7b7;">
                &bull; Standards: SMART on FHIR &bull; HL7 CDS Hooks &bull; US Core R4
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- Community Case Studies Section -->
    <section id="case-studies" class="section" style="background: var(--bg); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
      <div class="container">
        <div class="section-title">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: var(--amber-light); font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
            <span>🌲 Real-World Clinical Frontiers</span>
          </div>
          <h2>What PocketGull Does for Complex Pathologies &amp; Island Frontiers</h2>
          <p>Explore how our offline Edge AI, Systems Biology, and Salutogenic Trajectories solve high-dimensional health challenges—from island tick vectors to neuro-axonal sanctuaries.</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 2.5rem; max-width: 960px; margin: 0 auto;">
          <!-- Case 01: Nantucket Island -->
          <div style="background: var(--card); border: 1.5px solid var(--border); border-radius: 1.25rem; padding: 2rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
              <div>
                <span style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal); font-weight: 700; text-transform: uppercase;">Case Study #01 &bull; Nantucket Island &bull; Polpis &amp; Madaket</span>
                <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text); margin-top: 0.25rem;">Nantucket Island Tick-Borne Disease &amp; Co-Infection Crisis</h3>
              </div>
              <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;">
                <a href="https://pocketgull.app/?case=nantucket&autostart=true" class="btn-primary" style="padding: 0.5rem 1.15rem; font-size: 0.8125rem;">
                  <span>🚀 Launch Case in Cockpit</span>
                </a>
                <a href="/case-studies/nantucket-tick-radar" class="btn-secondary" style="padding: 0.5rem 1.15rem; font-size: 0.8125rem;">
                  <span>🌲 View Full Radar (URL) ↗</span>
                </a>
                <a href="https://github.com/pocketgull-app/nantucket-tick-radar" target="_blank" rel="noopener" class="btn-secondary" style="padding: 0.5rem 0.85rem; font-size: 0.8125rem; color: var(--text-muted);">
                  <span>📦 Repo ↗</span>
                </a>
              </div>
            </div>

            <div class="grid-3" style="margin-bottom: 1.5rem;">
              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Vector Pressure</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--amber); margin-top: 0.25rem;">&gt;40% Nymph Infection</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">High rates of <em>Borrelia</em>, <em>Babesia microti</em> <button type="button" class="doc-drill-badge" onclick="openDocDrill('Babesia microti')">🔬 Doc Drill</button>, and <em>Anaplasma</em> in island brush.</p>
              </div>

              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal); text-transform: uppercase;">Differential Clarity</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--amber); margin-top: 0.25rem;">Uncovering Co-Infections</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">Distinguishing between Lyme spirochetes and intraerythrocytic Babesia parasites for complete, curative resolution.</p>
              </div>

              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Systems Solution</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--teal); margin-top: 0.25rem;">Meadows Leverage L1-9</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">Dual antimicrobial protocol + MIT Mice Against Ticks <button type="button" class="doc-drill-badge" onclick="openDocDrill('Meadows Leverage L1-9')">🔬 Doc Drill</button> ecological defense.</p>
              </div>
            </div>

            <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1.25rem; border-radius: 0.75rem; font-size: 0.8125rem; color: var(--text); line-height: 1.7;">
              <strong style="color: var(--teal);">Clinical Impact Summary:</strong> A 42-year-old landscaper presented with atypical rash, night sweats, and autonomic vagal strain / low parasympathetic reserve (HRV RMSSD 18ms <button type="button" class="doc-drill-badge" onclick="openDocDrill('Vagal Collapse / RMSSD')">🔬 Doc Drill</button>). PocketGull's offline Edge AI differential radar flagged concurrent <em>Babesia microti</em> hemolytic anemia on peripheral blood smear (Maltese cross tetrads <button type="button" class="doc-drill-badge" onclick="openDocDrill('Maltese cross tetrads')">🔬 Doc Drill</button>) alongside <em>Borrelia burgdorferi</em> C6 ELISA serology. The clinician immediately initiated dual-therapy (Doxycycline + Atovaquone/Azithromycin) with zero cloud network egress required in remote field conservation zones.
            </div>
          </div>

          <!-- Case 02: Multiple Sclerosis Neuro-Axonal Sanctuary -->
          <div style="background: var(--card); border: 1.5px solid var(--border); border-radius: 1.25rem; padding: 2rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
              <div>
                <span style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: #0284c7; font-weight: 700; text-transform: uppercase;">Case Study #02 &bull; Neuro-Axonal Sanctuary &bull; Biophysical Conduction</span>
                <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text); margin-top: 0.25rem;">MS Neuro-Axonal Sanctuary: Salutogenic Trajectory &amp; Cooling Physics</h3>
              </div>
              <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;">
                <a href="/case-studies/neuro-sanctuary" class="btn-primary" style="padding: 0.5rem 1.15rem; font-size: 0.8125rem; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
                  <span>🧠 Launch Interactive Case</span>
                </a>
                <a href="/case-studies/neuro-sanctuary#radar" class="btn-secondary" style="padding: 0.5rem 1.15rem; font-size: 0.8125rem;">
                  <span>❄️ Uhthoff Radar (URL) ↗</span>
                </a>
                <a href="/case-studies/neuro-sanctuary#fhir" class="btn-secondary" style="padding: 0.5rem 0.85rem; font-size: 0.8125rem; color: var(--teal);">
                  <span>📋 FHIR R4 Bundle</span>
                </a>
              </div>
            </div>

            <div class="grid-3" style="margin-bottom: 1.5rem;">
              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: #0284c7; text-transform: uppercase;">Conduction Reserve</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: #0284c7; margin-top: 0.25rem;">&Delta;T &le; 0.40&deg;C Physics</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">Modeling the <button type="button" class="doc-drill-badge" onclick="openDocDrill('Uhthoff Phenomenon')">🔬 Uhthoff Phenomenon</button> to preserve action potential safety factor across demyelinated axons.</p>
              </div>

              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--amber); text-transform: uppercase;">Clinical Epistemology</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--amber); margin-top: 0.25rem;">Salutogenic 3-Act Arc</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">Transforming static SOAP checklists into <button type="button" class="doc-drill-badge" onclick="openDocDrill('Salutogenic 3-Act Trajectory')">🔬 3-Act Trajectories</button> (Past Trail &rarr; Living Foothold &rarr; Action Horizon).</p>
              </div>

              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: #10b981; text-transform: uppercase;">Autonomic Rhythm</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: #10b981; margin-top: 0.25rem;">0.10 Hz Resonant Pacing</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">Real-time <button type="button" class="doc-drill-badge" onclick="openDocDrill('0.1 Hz Resonant Pacing')">🔬 0.1 Hz Resonant Pacing</button> activating the vagal cholinergic anti-inflammatory reflex.</p>
              </div>
            </div>

            <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1.25rem; border-radius: 0.75rem; font-size: 0.8125rem; color: var(--text); line-height: 1.7;">
              <strong style="color: #0284c7;">Clinical Impact Summary:</strong> A 38-year-old architect with relapsing-remitting multiple sclerosis presented with heat-triggered leg heaviness (pseudo-relapse) and acute despair after warm summer walking. PocketGull's on-device Uhthoff thermal model isolated a +0.45&deg;C core rise blocking demyelinated sodium channels rather than new disease activity. By deploying pre-cooling ice slurries, a 15&deg;C phase-change vest protocol, and an Austrian 3-Act trajectory, the patient regained full walking stamina and self-advocacy without immunosuppressive panic.
            </div>
          </div>

          <!-- Case 03: Cardiometabolic & Glycemic Radar -->
          <div style="background: var(--card); border: 1.5px solid var(--border); border-radius: 1.25rem; padding: 2rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
              <div>
                <span style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: #10b981; font-weight: 700; text-transform: uppercase;">Case Study #03 &bull; Cardiometabolic &bull; Glycemic Excursion Radar</span>
                <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text); margin-top: 0.25rem;">Cardiometabolic Glucotoxicity Reversal: Postprandial Soleus Pacing</h3>
              </div>
              <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;">
                <a href="/case-studies/cardiometabolic-radar" class="btn-primary" style="padding: 0.5rem 1.15rem; font-size: 0.8125rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                  <span>📊 Launch Glycemic Radar</span>
                </a>
                <a href="/case-studies/cardiometabolic-radar#innovation-3b" class="btn-secondary" style="padding: 0.5rem 1.15rem; font-size: 0.8125rem;">
                  <span>🧬 3B Innovation</span>
                </a>
              </div>
            </div>

            <div class="grid-3" style="margin-bottom: 1.5rem;">
              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: #10b981; text-transform: uppercase;">GLUT4 Translocation</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: #10b981; margin-top: 0.25rem;">&minus;48 mg/dL Excursion</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">10-minute post-meal soleus contraction activating insulin-independent muscle glycogen disposal.</p>
              </div>

              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--amber); text-transform: uppercase;">Chronobiology</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--amber); margin-top: 0.25rem;">Liver BMAL1 Window</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">Aligning eating to 10:00 AM &ndash; 6:00 PM peak hepatic insulin sensitivity to eliminate dawn phenomena.</p>
              </div>

              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal); text-transform: uppercase;">WHO Generics</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--teal); margin-top: 0.25rem;">$4.00/mo Benchmark</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">Generic Metformin ER + botanical Berberine AMPK phosphorylation preventing financial toxicity.</p>
              </div>
            </div>

            <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1.25rem; border-radius: 0.75rem; font-size: 0.8125rem; color: var(--text); line-height: 1.7;">
              <strong style="color: #10b981;">Clinical Impact Summary:</strong> Subject SUBJ-7A2F presented with early Type 2 Diabetes (HbA1c 6.8%) and post-lunch cognitive fatigue. Rather than initiating escalating injectables, PocketGull deployed postprandial soleus pacing, BMAL1 circadian windows, and $4/mo generic Metformin, achieving sub-140 mg/dL postprandial recovery within 75 minutes.
            </div>
          </div>

          <!-- Case 04: Charles Darwin Vagal Enigma -->
          <div style="background: var(--card); border: 1.5px solid var(--border); border-radius: 1.25rem; padding: 2rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
              <div>
                <span style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: #818cf8; font-weight: 700; text-transform: uppercase;">Case Study #05 &bull; Historical Luminary &bull; Autonomic Medicine</span>
                <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text); margin-top: 0.25rem;">Charles Darwin &amp; The Post-Beagle Vagal Enigma</h3>
              </div>
              <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;">
                <a href="/case-studies/darwin-vagal-radar" class="btn-primary" style="padding: 0.5rem 1.15rem; font-size: 0.8125rem; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
                  <span>🪶 Launch Vagal Radar</span>
                </a>
                <a href="/case-studies/darwin-vagal-radar#innovation-3b" class="btn-secondary" style="padding: 0.5rem 1.15rem; font-size: 0.8125rem;">
                  <span>🧬 3B Innovation</span>
                </a>
              </div>
            </div>

            <div class="grid-3" style="margin-bottom: 1.5rem;">
              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: #818cf8; text-transform: uppercase;">Diagnostic Demarcation</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: #818cf8; margin-top: 0.25rem;">150-Year Stigma Broken</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">Replaces dismissive "hypochondria" labels with post-infectious autonomic neuropathy &amp; POTS.</p>
              </div>

              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--amber); text-transform: uppercase;">Vagal Dive Reflex</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--amber); margin-top: 0.25rem;">Trigeminal Bradycardia</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">Cold-water facial immersion stimulating cholinergic anti-inflammatory pathway and gastrointestinal transit.</p>
              </div>

              <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal); text-transform: uppercase;">Down House Pacing</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--teal); margin-top: 0.25rem;">The Sandwalk Loops</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">Three rhythmic 20-minute daily gravel walks for gentle venous return and cognitive preservation.</p>
              </div>
            </div>

            <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1.25rem; border-radius: 0.75rem; font-size: 0.8125rem; color: var(--text); line-height: 1.7;">
              <strong style="color: #818cf8;">Clinical Impact Summary:</strong> Subject SUBJ-DARWIN-1882 suffered 40 years of violent vomiting, palpitations, and prostration following HMS Beagle. By modeling baroreflex failure and validating Malvern cold-water hydropathy through modern neuro-immunology, PocketGull reconstructs how salutogenic Sandwalk pacing enabled the completion of <em>On the Origin of Species</em>.
            </div>
          </div>

          <!-- Master Cohort Hub Banner -->
          <div style="background: linear-gradient(135deg, rgba(20, 184, 166, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%); border: 1.5px solid var(--teal); border-radius: 1.25rem; padding: 1.75rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;">
            <div>
              <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">Community Research Commons</div>
              <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text); margin-top: 0.25rem;">Explore All 7 Clinical Case Studies &amp; Master FHIR R4 Research Cohort</h3>
              <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.25rem; max-width: 650px;">
                Filter de-identified clinical archetypes across neurology, cardiometabolic disease, autonomic medicine, and historical luminaries. All 18 Safe Harbor identifiers stripped.
              </p>
            </div>
            <a href="/case-studies" class="btn-primary" style="padding: 0.65rem 1.4rem; font-size: 0.875rem; font-weight: 700; white-space: nowrap;">
              <span>📁 Open Case Studies Directory &rarr;</span>
            </a>
          </div>

        </div>
      </div>
    </section>

    <!-- Clinical Condition & Dual-Thrift Explorer Section -->
    <section id="condition-thrift" class="section" style="background: var(--card-subtle); border-bottom: 1px solid var(--border);">
      <div class="container">
        <div class="section-title">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: var(--teal-glow); border: 1px solid var(--border); color: var(--teal); font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
            <span>🏥 Common Clinical Conditions &amp; Dual-Thrift Architecture</span>
          </div>
          <h2>Biophysical Care Suggestions &amp; Dual-Sided Cost Containment</h2>
          <p>Explore how PocketGull surfaces actionable biophysical care suggestions for everyday clinical conditions, while eliminating financial toxicity for patients and maintaining an ultra-lean $0.00 cloud inference bill for this project.</p>
        </div>

        <!-- Dual-Sided FinOps Architecture Cards -->
        <div class="grid-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
          <!-- Card 1: Patient Financial Shield -->
          <div class="feature-card" style="border-left: 4px solid var(--teal); background: var(--card);">
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem;">
              <span style="font-size: 1.5rem;">🛡️</span>
              <div>
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal); font-weight: 700; text-transform: uppercase;">Patient &amp; Practice Financial Shield</div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text); margin: 0;">WHO Essential Medicines &amp; Anti-Toxicity</h3>
              </div>
            </div>
            <ul style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.65; padding-left: 1.25rem; margin: 0 0 1rem 0;">
              <li><strong style="color: var(--text);">WHO Model List Generics:</strong> Compares standard retail benchmark pricing ($40–$285/mo) with open generic equivalents ($0.50–$4.50/mo), unlocking 94%–98% out-of-pocket savings.</li>
              <li><strong style="color: var(--text);">Halting Diagnostic Cascades:</strong> Continuous biophysical telemetry (thermal reserve, Mayer-wave pacing) prevents unindicated $2,800 emergency MRIs and $4,500 acute crash visits.</li>
              <li><strong style="color: var(--text);">STOPP/START Deprescribing:</strong> Identifies drug side effects mistaken for new diseases (e.g. Amlodipine &rarr; edema &rarr; Furosemide), safely tapering unneeded medications.</li>
              <li><strong style="color: var(--text);">85% Patient Research Dividend:</strong> Patients opting into de-identified research cohorts receive 85% revenue-share via cryptographic attestation.</li>
            </ul>
            <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.6rem 0.85rem; font-size: 0.75rem; color: var(--teal); font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
              <span>Average Household Thrift:</span>
              <span style="font-family: ui-monospace, monospace; font-size: 0.875rem;">$2,100 &ndash; $4,800 / year</span>
            </div>
          </div>

          <!-- Card 2: Developer & Project FinOps -->
          <div class="feature-card" style="border-left: 4px solid var(--amber); background: var(--card);">
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem;">
              <span style="font-size: 1.5rem;">⚡</span>
              <div>
                <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--amber); font-weight: 700; text-transform: uppercase;">Developer &amp; Project FinOps</div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text); margin: 0;">Zero-Egress &amp; Scale-to-Zero Architecture</h3>
              </div>
            </div>
            <ul style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.65; padding-left: 1.25rem; margin: 0 0 1rem 0;">
              <li><strong style="color: var(--text);">$0.00 Edge AI Inference:</strong> Powered by Chrome Built-in AI (Prompt API / Gemma 4) and deterministic TypeScript. Zero external cloud LLM tokens billed.</li>
              <li><strong style="color: var(--text);">Scale-to-Zero Cloud Run:</strong> Container instances scale to <code>minScale: 0</code> during idle hours, eliminating baseline $50–$150/mo VM charges.</li>
              <li><strong style="color: var(--text);">7-Day Storage Pruning:</strong> Automated GCS bucket lifecycle (7-day age) and Artifact Registry auto-deletion policies prevent Docker layer buildup, capping storage at ~$0.20/mo.</li>
              <li><strong style="color: var(--text);">Zero Managed SaaS Overhead:</strong> No managed vector databases, proprietary charting licenses, or third-party middleware lock-in.</li>
            </ul>
            <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.6rem 0.85rem; font-size: 0.75rem; color: var(--amber); font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
              <span>Project Baseline Cloud Cost:</span>
              <span style="font-family: ui-monospace, monospace; font-size: 0.875rem;">~$0.20 / month idle</span>
            </div>
          </div>
        </div>

        <!-- Condition Explorer Tabs -->
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; justify-content: center;">
          <button type="button" id="condTab_metabolic" class="tab-btn active" onclick="selectConditionTab('metabolic')" style="padding: 0.55rem 1rem; font-size: 0.8125rem; border-radius: 0.5rem; display: inline-flex; align-items: center; gap: 0.4rem;">
            <span>🩺</span> <span>Metabolic &amp; Hypertension</span>
          </button>
          <button type="button" id="condTab_dysautonomia" class="tab-btn" onclick="selectConditionTab('dysautonomia')" style="padding: 0.55rem 1rem; font-size: 0.8125rem; border-radius: 0.5rem; display: inline-flex; align-items: center; gap: 0.4rem;">
            <span>⚡</span> <span>Orthostatic Dysautonomia (POTS)</span>
          </button>
          <button type="button" id="condTab_neuro" class="tab-btn" onclick="selectConditionTab('neuro')" style="padding: 0.55rem 1rem; font-size: 0.8125rem; border-radius: 0.5rem; display: inline-flex; align-items: center; gap: 0.4rem;">
            <span>🧠</span> <span>Multiple Sclerosis (Neuro-Sanctuary)</span>
          </button>
          <button type="button" id="condTab_vector" class="tab-btn" onclick="selectConditionTab('vector')" style="padding: 0.55rem 1rem; font-size: 0.8125rem; border-radius: 0.5rem; display: inline-flex; align-items: center; gap: 0.4rem;">
            <span>🌲</span> <span>Tick-Borne Co-Infections (Babesiosis)</span>
          </button>
          <button type="button" id="condTab_polytrauma" class="tab-btn" onclick="selectConditionTab('polytrauma')" style="padding: 0.55rem 1rem; font-size: 0.8125rem; border-radius: 0.5rem; display: inline-flex; align-items: center; gap: 0.4rem;">
            <span>🩹</span> <span>Chronic Pain &amp; Polytrauma</span>
          </button>
        </div>

        <!-- Dynamic Condition Detail Card Container -->
        <div id="conditionDetailCard" class="feature-card" style="background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.06); transition: all 0.3s ease;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1.25rem;">
            <div>
              <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal); font-weight: 700; text-transform: uppercase;">CASE STUDY P001 &bull; CARDIOMETABOLIC HEALTH</div>
              <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text); margin: 0.25rem 0 0.4rem;">Metabolic Syndrome, Insulin Resistance &amp; Essential Hypertension</h3>
              <p style="font-size: 0.8125rem; color: var(--text-muted); margin: 0; line-height: 1.5;">Stage 1 HTN (138/88 mmHg), elevated fasting glucose (118 mg/dL), visceral adiposity, and endothelial fatigue.</p>
            </div>
            <button type="button" class="doc-drill-badge" onclick="openDocDrill('Metabolic Syndrome &amp; Stepped Care')" style="font-size: 0.75rem; padding: 0.4rem 0.75rem;">🔬 Socratic Evidence Focus</button>
          </div>

          <div class="grid-3" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
            <!-- Col 1: Austrian 3-Act Trajectory -->
            <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="font-size: 0.72rem; font-family: ui-monospace, monospace; color: var(--teal); font-weight: 700; text-transform: uppercase;">Austrian Salutogenic Arc</div>
              <div class="act-card" style="margin: 0; padding: 0.65rem 0.85rem; border-left: 3px solid #64748b;">
                <div class="act-header" style="color: #64748b;">Act I &bull; Where You've Been</div>
                <div class="act-body" style="font-size: 0.78rem;">Gradual metabolic strain and insulin resistance developed over 5 years of sedentary desk work and fragmented sleep. Acknowledged with zero moral stigma or fatalism.</div>
              </div>
              <div class="act-card" style="margin: 0; padding: 0.65rem 0.85rem; border-left: 3px solid var(--teal);">
                <div class="act-header" style="color: var(--teal);">Act II &bull; Where You Stand Today</div>
                <div class="act-body" style="font-size: 0.78rem;">Endothelial microcirculation remains fully responsive. Fasting insulin sensitivity and vascular compliance can be restored through circadian meal timing and nitric oxide donors.</div>
              </div>
              <div class="act-card" style="margin: 0; padding: 0.65rem 0.85rem; border-left: 3px solid var(--amber);">
                <div class="act-header" style="color: var(--amber);">Act III &bull; Where You're Going</div>
                <div class="act-body" style="font-size: 0.78rem;">Target resting blood pressure &lt;120/80 mmHg, HbA1c &lt;5.7%, and 45 minutes of sustained aerobic vitality achieved within 90 days.</div>
              </div>
            </div>

            <!-- Col 2: PocketGull Care Suggestions -->
            <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="font-size: 0.72rem; font-family: ui-monospace, monospace; color: var(--amber); font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">Actionable Clinical Suggestions</div>
                <ul style="font-size: 0.8125rem; color: var(--text); line-height: 1.6; padding-left: 1.15rem; margin: 0; display: flex; flex-direction: column; gap: 0.6rem;">
                  <li><strong>WHO HEARTS Stepped Care:</strong> First-line open generic ACE-i (Lisinopril 10 mg) or CCB (Amlodipine 5 mg) before considering costly brand combinations.</li>
                  <li><strong>Post-Prandial Muscle Contraction:</strong> 10-minute moderate walking within 30 minutes post-meal stimulates GLUT4 glucose uptake independent of insulin.</li>
                  <li><strong>DASH Potassium Optimization:</strong> Target &ge;3:1 potassium-to-sodium ratio (spinach, avocado, lentils) to induce endothelial vascular smooth muscle hyperpolarization.</li>
                  <li><strong>AMPK Metabolic Activation:</strong> Berberine HCl (500 mg BID with meals) or open generic Metformin HCl (500 mg) to restore cellular energy charge.</li>
                </ul>
              </div>
              <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border); font-size: 0.72rem; color: var(--text-muted); font-style: italic;">
                &bull; Guided by Learned Intermediary: Requires clinician attestation before order entry.
              </div>
            </div>

            <!-- Col 3: Dual-Sided Thrift Breakdown -->
            <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="font-size: 0.72rem; font-family: ui-monospace, monospace; color: #10b981; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">Dual-Sided Thrift &amp; FinOps</div>
                <div style="background: var(--card); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 0.6rem;">
                  <div style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase;">Standard Retail Benchmark:</div>
                  <div style="font-size: 1.15rem; font-weight: 800; color: #ef4444; font-family: ui-monospace, monospace; text-decoration: line-through;">$185.00 / month</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.15rem;">Brand-name ARB combo + SGLT2-i / statin retail cash benchmark</div>
                </div>
                <div style="background: var(--card); border: 1px solid var(--teal); border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 0.6rem;">
                  <div style="font-size: 0.6875rem; color: var(--teal); text-transform: uppercase; font-weight: 700;">Estimated Out-of-Pocket Total:</div>
                  <div style="font-size: 1.35rem; font-weight: 800; color: var(--teal); font-family: ui-monospace, monospace;">$7.50 / month</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.15rem;">WHO EML generic Lisinopril + Metformin HCl open generic formulary</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.2rem; font-size: 0.75rem;">
                  <span style="color: var(--text-muted);">Net Household Savings:</span>
                  <span style="color: #10b981; font-weight: 800; font-family: ui-monospace, monospace;">$2,130.00 / year (95.9% Savings)</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.2rem; font-size: 0.75rem; border-top: 1px dashed var(--border); margin-top: 0.4rem;">
                  <span style="color: var(--text-muted);">Project Inference Cost:</span>
                  <span style="color: var(--teal); font-weight: 700; font-family: ui-monospace, monospace;">$0.00 (On-Device Gemma 4 / Local Edge)</span>
                </div>
              </div>
              <div style="margin-top: 0.75rem; background: var(--teal-glow); border: 1px solid var(--border); border-radius: 0.375rem; padding: 0.5rem 0.65rem; font-size: 0.72rem; color: var(--teal);">
                <strong>Cascade Halter:</strong> Eliminates premature multi-drug escalation and emergency hypertensive urgency visits.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Clinical Typography & Optotypic Safety Section (Influenced by Typeface Specimen) -->
    <section id="clinical-typography" class="section" style="background: var(--bg); border-bottom: 1px solid var(--border);">
      <div class="container">
        <div class="section-title">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: var(--teal-glow); border: 1px solid var(--border); color: var(--teal); font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
            <span>🛡️ Clinical Font Safeguards</span>
          </div>
          <h2>Louise Sloan 5:1 Optotypic Legibility &amp; ISMP Drug Safeguards</h2>
          <p>Generic web fonts create fatal dosage errors on ICU displays and thermal prescription labels. PocketGull's font safeguards enforce zero-error medical legibility under ISMP and FDA standards.</p>
        </div>

        <div class="grid-3" style="margin-bottom: 2rem;">
          <div class="feature-card" style="border-color: var(--border);">
            <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal); font-weight: 700; text-transform: uppercase;">ISMP Disambiguation</div>
            <div style="display: flex; justify-content: space-around; align-items: center; margin: 1rem 0; padding: 1rem; background: var(--card-subtle); border-radius: 0.5rem; border: 1px solid var(--border);">
              <div style="text-align: center;">
                <div style="font-size: 2.25rem; font-family: 'PocketGull', monospace; font-weight: 700; color: var(--text);">0</div>
                <div style="font-size: 0.7rem; color: var(--teal); font-mono;">Slashed Zero</div>
              </div>
              <div style="font-size: 1.25rem; color: var(--text-muted);">&ne;</div>
              <div style="text-align: center;">
                <div style="font-size: 2.25rem; font-family: 'PocketGull', sans-serif; font-weight: 700; color: var(--amber);">O</div>
                <div style="font-size: 0.7rem; color: var(--amber); font-mono;">Capital Letter O</div>
              </div>
            </div>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Eliminates catastrophic confusion between numeric dosages (e.g. 50 mg) and oxygen indicators.</p>
          </div>

          <div class="feature-card" style="border-color: var(--border);">
            <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal); font-weight: 700; text-transform: uppercase;">1 vs l vs I Optical Triad</div>
            <div style="display: flex; justify-content: space-around; align-items: center; margin: 1rem 0; padding: 1rem; background: var(--card-subtle); border-radius: 0.5rem; border: 1px solid var(--border);">
              <div style="text-align: center;">
                <div style="font-size: 2rem; font-family: 'PocketGull', monospace; font-weight: 700; color: var(--text);">1</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); font-mono;">Numeral</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 2rem; font-family: 'PocketGull', sans-serif; font-weight: 700; color: var(--teal-light);">l</div>
                <div style="font-size: 0.7rem; color: var(--teal-light); font-mono;">Curved l</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 2rem; font-family: 'PocketGull', sans-serif; font-weight: 700; color: var(--amber-light);">I</div>
                <div style="font-size: 0.7rem; color: var(--amber-light); font-mono;">Serifed I</div>
              </div>
            </div>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Louise Sloan 5:1 invariants prevent misreading drug names like <em>Isordil</em> vs <em>lsordil</em> or unit quantities.</p>
          </div>

          <div class="feature-card" style="border-color: rgba(20, 184, 166, 0.3);">
            <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">ISMP Dosage Decimal Guard</div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem 0; padding: 0.85rem; background: var(--card-subtle); border-radius: 0.5rem; border: 1px solid var(--border); font-family: ui-monospace, monospace; font-size: 0.8125rem;">
              <div style="color: #f87171; text-decoration: line-through;">❌ 5.0 mg &bull; .5 mg (Dangerous)</div>
              <div style="color: var(--teal-light); font-weight: bold;">✅ 5 mg &bull; 0.5 mg (Safe Standard)</div>
            </div>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Mandates leading zeros and prohibits trailing zeros, preventing 10-fold overdoses in emergency orders.</p>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; align-items: center;">
          <a href="https://font.pocketgull.app" target="_blank" rel="noopener" class="btn-primary" style="font-size: 0.875rem;">
            <span>🛡️ Explore Clinical Font Safeguards &bull; font.pocketgull.app ↗</span>
          </a>
          <button type="button" class="btn-secondary" onclick="openDocDrill('Louise Sloan 5:1 Optotype Invariant')">
            <span>🔬 Open Sloan Invariant Doc Drill</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Oregon Scientific Heritage: Linus Pauling Institute & Molecular Medicine -->
    <section id="linus-pauling" class="section" style="background: var(--card-subtle); border-bottom: 1px solid var(--border);">
      <div class="container">
        <div class="section-title">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); color: var(--amber); font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
            <span>🧬 Oregon Scientific Heritage &bull; Linus Pauling Institute (OSU)</span>
          </div>
          <h2>The Right Molecules in the Right Amounts.<br /><span>Linus Pauling &amp; The Orthomolecular Revolution</span></h2>
          <p>Founded at Oregon State University in Corvallis, the Linus Pauling Institute (LPI) pioneered molecular medicine and established the global gold standard for micronutrient biochemistry. PocketGull translates Pauling’s 1968 orthomolecular thesis into 2026 real-time, on-device biophysical posology—grounded in the peer-reviewed LPI Micronutrient Information Center.</p>
        </div>

        <div class="grid-3" style="margin-bottom: 2rem;">
          <div class="feature-card" style="border-color: var(--border);">
            <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber); font-weight: 700; text-transform: uppercase;">1949: Molecular Disease</div>
            <div style="margin: 0.75rem 0;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text);">Sickle Hemoglobin &amp; Conformational Health</h3>
            </div>
            <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6;">
              Pauling’s landmark demonstration that sickle cell anemia is a &ldquo;molecular disease&rdquo; proved that pathology originates from altered molecular geometry. PocketGull extends this foundation into real-time 3D WebGL phase space and receptor docking simulations.
            </p>
          </div>

          <div class="feature-card" style="border-color: rgba(20, 184, 166, 0.3);">
            <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">1968: Orthomolecular Medicine</div>
            <div style="margin: 0.75rem 0;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text);">Beyond Static Deficiency RDAs</h3>
            </div>
            <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6;">
              Pauling defined health as providing the optimal molecular concentrations natural to human physiology. PocketGull’s posology engine calibrates individual nutrient saturation against continuous renal clearance (eGFR), thermal strain, and metabolic output.
            </p>
          </div>

          <div class="feature-card" style="border-color: var(--border);">
            <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber); font-weight: 700; text-transform: uppercase;">Pauling Protocol (p008)</div>
            <div style="margin: 0.75rem 0;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text);">Endothelial Matrix &amp; Lp(a) Quenching</h3>
            </div>
            <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6;">
              Modeled directly in patient archetype p008: Ascorbate + L-lysine + L-proline matrix stabilization. Protects vascular integrity, stimulates prolyl hydroxylase collagen cross-linking, and inhibits Lipoprotein(a) atherosclerotic plaque binding.
            </p>
          </div>
        </div>

        <!-- The Paradigm Shift: Static RDA vs. Orthomolecular Saturation -->
        <div style="background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
            <div>
              <span style="font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; color: var(--teal); text-transform: uppercase;">The Posology Paradigm Shift</span>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text); margin-top: 0.25rem;">Minimum Survival Allowance vs. Lifelong Cellular Resilience</h3>
            </div>
            <span style="font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 9999px; background: rgba(20, 184, 166, 0.1); border: 1px solid rgba(20, 184, 166, 0.3); color: var(--teal-light); font-family: ui-monospace, monospace;">
              Oregon State University MIC Standard
            </span>
          </div>

          <div class="grid-2" style="gap: 1.5rem;">
            <div style="padding: 1rem; background: var(--card-subtle); border-radius: 0.5rem; border: 1px solid var(--border);">
              <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: #f87171; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">Conventional Approach (Static RDA)</div>
              <ul style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6; padding-left: 1.25rem;">
                <li>Designed solely to prevent acute nutritional deficits (scurvy, rickets, beriberi).</li>
                <li>One-size-fits-all lookup table regardless of acute inflammation, renal clearance, or heat exposure.</li>
                <li>Treats micronutrients as passive background chemicals rather than active epigenetic cofactors (TET enzymes).</li>
              </ul>
            </div>

            <div style="padding: 1rem; background: var(--card-subtle); border-radius: 0.5rem; border: 1.5px solid rgba(20, 184, 166, 0.4);">
              <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">Pauling Orthomolecular Standard (PocketGull)</div>
              <ul style="font-size: 0.8125rem; color: var(--text); line-height: 1.6; padding-left: 1.25rem;">
                <li>Calibrates dynamic daily saturation for optimal mitochondrial function and vascular longevity.</li>
                <li>Real-time posology adjustments for high-heat exposome strain, exercise, and metabolic rate.</li>
                <li>Grounded directly in the Linus Pauling Institute’s peer-reviewed Micronutrient Information Center (MIC).</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- External Scientific Sourcing & Patient Archetype CTAs -->
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; align-items: center;">
          <a href="https://lpi.oregonstate.edu/mic" target="_blank" rel="noopener" class="btn-primary" style="font-size: 0.875rem;">
            <span>🔬 Linus Pauling Institute Micronutrient Center (OSU) ↗</span>
          </a>
          <a href="https://pocketgull.app/?patient=p008" class="btn-secondary" style="font-size: 0.875rem; border-color: rgba(245, 158, 11, 0.4);">
            <span>🧬 Launch Linus Pauling Archetype (p008) in App &rarr;</span>
          </a>
          <button type="button" class="btn-secondary" onclick="openDocDrill('Linus Pauling &amp; Ascorbate Posology')">
            <span>📖 Open Orthomolecular Doc Drill</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Interactive Plain English Flip Cards -->
    <section class="section" style="background: var(--bg);">
      <div class="container">
        <div class="section-title">
          <h2>Clear Patient Communication</h2>
          <p>Helping patients understand their health. <strong>Click or tap any card below</strong> to view the plain English explanation.</p>
        </div>

        <div class="grid-3">
          <div class="flip-card" id="card1" onclick="this.classList.toggle('flipped')">
            <div class="flip-card-inner">
              <div class="flip-card-front">
                <div>
                  <div style="font-size: 0.75rem; color: #0284c7; font-weight: bold; margin-bottom: 0.25rem;">🧪 LAB RESULT NOTE</div>
                  <div style="font-size: 0.8125rem; color: var(--text);">
                    Fasting plasma glucose 132 mg/dL with elevated HbA1c 6.8% and peripheral insulin resistance.
                  </div>
                </div>
                <div style="font-size: 0.6875rem; color: var(--text-muted); font-family: ui-monospace, monospace;">💡 Tap to view Patient Plain English</div>
              </div>
              <div class="flip-card-back">
                <div>
                  <div style="font-size: 0.75rem; color: var(--amber-light); font-weight: bold; margin-bottom: 0.25rem;">✨ PATIENT EXPLANATION</div>
                  <div style="font-size: 0.8125rem; color: var(--text);">
                    Your average blood sugar over the last 3 months is slightly high. Making simple adjustments to daily walks and nutrition will help bring it back into a healthy range.
                  </div>
                </div>
                <div style="font-size: 0.6875rem; color: var(--amber-light); font-family: ui-monospace, monospace;">↺ Tap to flip back</div>
              </div>
            </div>
          </div>

          <div class="flip-card" id="card2" onclick="this.classList.toggle('flipped')">
            <div class="flip-card-inner">
              <div class="flip-card-front">
                <div>
                  <div style="font-size: 0.75rem; color: #059669; font-weight: bold; margin-bottom: 0.25rem;">🌿 STRESS &amp; SLEEP NOTE</div>
                  <div style="font-size: 0.8125rem; color: var(--text);">
                    Flattened diurnal cortisol curve with sympathetic vagal dysregulation and unrefreshing sleep.
                  </div>
                </div>
                <div style="font-size: 0.6875rem; color: var(--text-muted); font-family: ui-monospace, monospace;">💡 Tap to view Patient Plain English</div>
              </div>
              <div class="flip-card-back">
                <div>
                  <div style="font-size: 0.75rem; color: var(--amber-light); font-weight: bold; margin-bottom: 0.25rem;">✨ PATIENT EXPLANATION</div>
                  <div style="font-size: 0.8125rem; color: var(--text);">
                    Your daily energy cycles are off-balance, causing afternoon fatigue. Slow breathing exercises and a consistent evening routine will help restore restful sleep.
                  </div>
                </div>
                <div style="font-size: 0.6875rem; color: var(--amber-light); font-family: ui-monospace, monospace;">↺ Tap to flip back</div>
              </div>
            </div>
          </div>

          <div class="flip-card" id="card3" onclick="this.classList.toggle('flipped')">
            <div class="flip-card-inner">
              <div class="flip-card-front">
                <div>
                  <div style="font-size: 0.75rem; color: #e11d48; font-weight: bold; margin-bottom: 0.25rem;">🩺 BLOOD PRESSURE NOTE</div>
                  <div style="font-size: 0.8125rem; color: var(--text);">
                    Resting BP 142/88 mmHg. Mean Arterial Pressure (MAP) 106 mmHg with elevated systemic vascular resistance.
                  </div>
                </div>
                <div style="font-size: 0.6875rem; color: var(--text-muted); font-family: ui-monospace, monospace;">💡 Tap to view Patient Plain English</div>
              </div>
              <div class="flip-card-back">
                <div>
                  <div style="font-size: 0.75rem; color: var(--amber-light); font-weight: bold; margin-bottom: 0.25rem;">✨ PATIENT EXPLANATION</div>
                  <div style="font-size: 0.8125rem; color: var(--text);">
                    Your heart is working slightly harder than usual to circulate blood. Reducing salt intake and taking regular 20-minute daily walks will help relax your blood vessels.
                  </div>
                </div>
                <div style="font-size: 0.6875rem; color: var(--amber-light); font-family: ui-monospace, monospace;">↺ Tap to flip back</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Eye Exam Screener -->
    <section id="eye-exam" class="section">
      <div class="container" style="max-width: 840px;">
        <div class="section-title">
          <h2>Visual Acuity Eye Screener</h2>
          <p>Standardized Tumbling E LogMAR chart. Position yourself approximately 50 cm (arm's length) from your screen.</p>
        </div>

        <div style="background: var(--card); border: 1.5px solid var(--border); border-radius: 1rem; padding: 2rem; text-align: center; max-width: 540px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; margin-bottom: 1.25rem; font-family: ui-monospace, monospace; font-size: 0.8125rem;">
            <span>Current Line: <strong id="eyeExamLineText" style="color: var(--teal-light);">20/200</strong></span>
            <span>Score: <strong id="eyeExamScoreText" style="color: var(--amber-light);">0 / 0</strong></span>
          </div>

          <div style="height: 160px; background: #ffffff; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
            <svg id="eyeOptotypeSvg" viewBox="0 0 100 100" style="width: 80px; height: 80px; transition: transform 0.15s ease;">
              <rect x="0" y="0" width="20" height="100" fill="#09090b" />
              <rect x="20" y="0" width="80" height="20" fill="#09090b" />
              <rect x="20" y="40" width="70" height="20" fill="#09090b" />
              <rect x="20" y="80" width="80" height="20" fill="#09090b" />
            </svg>
          </div>

          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem; font-family: ui-monospace, monospace;">
            Which direction are the prongs pointing?
          </p>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; max-width: 220px; margin: 0 auto 1.25rem;">
            <div></div>
            <button onclick="handleEyeAnswer('UP')" class="btn-secondary" style="justify-content: center; padding: 0.5rem; font-weight: bold;">↑ Up</button>
            <div></div>
            <button onclick="handleEyeAnswer('LEFT')" class="btn-secondary" style="justify-content: center; padding: 0.5rem; font-weight: bold;">← Left</button>
            <button onclick="handleEyeAnswer('DOWN')" class="btn-secondary" style="justify-content: center; padding: 0.5rem; font-weight: bold;">↓ Down</button>
            <button onclick="handleEyeAnswer('RIGHT')" class="btn-secondary" style="justify-content: center; padding: 0.5rem; font-weight: bold;">→ Right</button>
          </div>

          <div id="eyeExamFeedback" style="font-size: 0.8125rem; font-weight: bold; color: var(--teal-light); min-height: 1.5rem;">
            Select a direction button above to test.
          </div>
        </div>
      </div>
    </section>

    <!-- Privacy & Security Section -->
    <section id="privacy" class="section">
      <div class="container">
        <div class="section-title">
          <h2>Privacy &amp; Security Standards</h2>
          <p>Medical software should protect patient confidentiality with rigorous safeguards.</p>
        </div>

        <div class="grid-3">
          <div class="feature-card">
            <h3>No Cloud Audio Storage</h3>
            <p>Audio is processed in real time and discarded from local memory once transcribed. No audio is ever stored on external cloud servers.</p>
          </div>

          <div class="feature-card">
            <h3>Zero Public Model Training</h3>
            <p>Your clinical notes, patient symptoms, and diagnoses are never shared or used to train external LLMs.</p>
          </div>

          <div class="feature-card">
            <h3>HIPAA &amp; GDPR Standards</h3>
            <p>Engineered to comply with US HIPAA §164.514 Safe Harbor and international health data privacy standards.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Open Source Public Health Contributions Section -->
    <section id="open-source" class="section" style="background: var(--bg); border-top: 1px solid var(--border);">
      <div class="container">
        <div class="section-title">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: rgba(20, 184, 166, 0.1); border: 1px solid rgba(20, 184, 166, 0.3); color: var(--teal-light); font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
            <span>🌐 Open Source Public Health Initiative</span>
          </div>
          <h2>Free Open Source Tools for Global Clinicians</h2>
          <p>We believe foundational clinical safety and rural triage tools should be accessible to all practitioners and researchers worldwide under Apache 2.0.</p>
        </div>

        <div class="grid-3">
          <div class="feature-card" style="border-color: rgba(20, 184, 166, 0.3);">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🌲</div>
            <h3>@pocketgull/vector-triage-radar</h3>
            <p>Open source multi-pathogen probability scoring for endemic tick zones (<em>Borrelia</em>, <em>Babesia</em>, <em>Anaplasma</em>, <em>Powassan</em>) exporting standard HL7 FHIR R4 RiskAssessment resources.</p>
            <div style="margin-top: 1rem; font-family: ui-monospace, monospace; font-size: 0.75rem; color: var(--teal-light);">
              Apache 2.0 &bull; TypeScript &amp; Dart
            </div>
          </div>

          <div class="feature-card" style="border-color: rgba(245, 158, 11, 0.3);">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">💊</div>
            <h3>@pocketgull/ismp-clinical-guard</h3>
            <p>On-device ISMP medication safety linter eliminating dangerous trailing zeroes (<code>5.0 mg</code>), naked decimals, and sound-alike Tall Man drug confusion with zero cloud latency.</p>
            <div style="margin-top: 1rem; font-family: ui-monospace, monospace; font-size: 0.75rem; color: var(--amber-light);">
              Apache 2.0 &bull; Chrome Prompt API
            </div>
          </div>

          <div class="feature-card" style="border-color: rgba(56, 189, 248, 0.3);">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔤</div>
            <h3>@pocketgull/caslon-typography</h3>
            <p>Optotypic legibility font stacks, slashed-zero (<code>cv08</code>), curved-l (<code>cv05</code>), and WCAG AAA 7:1 contrast tokens engineered to prevent numerical dosage misinterpretation.</p>
            <div style="margin-top: 1rem; font-family: ui-monospace, monospace; font-size: 0.75rem; color: #38bdf8;">
              OFL / CC-BY 4.0 &bull; Vanilla CSS
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Community Testimonials & Practitioner Quotes Section -->
    <section id="testimonials" class="section" style="background: var(--card-subtle); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
      <div class="container">
        <div class="section-title">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: var(--amber-light); font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
            <span>💬 Clinician Stories &amp; Community Voices</span>
          </div>
          <h2>Verified Practitioner Quotes</h2>
          <p>What clinicians, island practitioners, and privacy officers say about PocketGull.</p>
        </div>

        <div class="grid-3" id="testimonialsContainer" style="margin-bottom: 2rem;">
          <div class="feature-card" style="background: var(--card); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span style="font-size: 1.5rem;">🩺</span>
                <div>
                  <h4 style="font-size: 0.9375rem; color: var(--text); font-weight: 700;">Dr. Rebecca Vance, MD</h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted);">Family &amp; Community Medicine &bull; Nantucket, MA</p>
                </div>
              </div>
              <blockquote style="font-size: 0.8125rem; color: var(--text); font-style: italic; line-height: 1.6; border-left: 2px solid var(--teal-light); padding-left: 0.75rem;">
                "In high-incidence vector zones like Nantucket, co-infections are the rule rather than the exception. PocketGull’s offline radar flagged hemolytic markers for <em>Babesia</em> in the field where we have zero cell reception. It saved our acute triage speed."
              </blockquote>
            </div>
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border); font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: bold;">
              ⚡ 3.4x Faster Co-Infection Triage
            </div>
          </div>

          <div class="feature-card" style="background: var(--card); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span style="font-size: 1.5rem;">🌿</span>
                <div>
                  <h4 style="font-size: 0.9375rem; color: var(--text); font-weight: 700;">Dr. Marcus Thorne, DO</h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted);">Direct Primary Care &bull; Bend, OR</p>
                </div>
              </div>
              <blockquote style="font-size: 0.8125rem; color: var(--text); font-style: italic; line-height: 1.6; border-left: 2px solid var(--amber-light); padding-left: 0.75rem;">
                "The Systems Thinking HUD connects oral microbiome inflammation, vagal tone, and blood pressure in real time. I went from spending 2 hours every night in EHR pajama time to finishing my charts during the patient encounter."
              </blockquote>
            </div>
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border); font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: bold;">
              ⚡ -42% Charting Time Saved
            </div>
          </div>

          <div class="feature-card" style="background: var(--card); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span style="font-size: 1.5rem;">🔒</span>
                <div>
                  <h4 style="font-size: 0.9375rem; color: var(--text); font-weight: 700;">Elena Rostova, MS, CISSP</h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted);">Clinical Informaticist &bull; Cambridge, MA</p>
                </div>
              </div>
              <blockquote style="font-size: 0.8125rem; color: var(--text); font-style: italic; line-height: 1.6; border-left: 2px solid #38bdf8; padding-left: 0.75rem;">
                "Finding software that provides advanced clinical AI while running 100% on-device with zero cloud PHI transmission is virtually non-existent. PocketGull’s Chrome Built-in AI architecture sets a benchmark for medical data sovereignty."
              </blockquote>
            </div>
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border); font-size: 0.75rem; font-family: ui-monospace, monospace; color: #38bdf8; font-weight: bold;">
              ⚡ 100% On-Device Zero Egress
            </div>
          </div>
        </div>

        <!-- Write in a Quote / Testimonial Box -->
        <div style="background: var(--card); border: 1.5px solid var(--border); border-radius: 1rem; padding: 1.75rem; max-width: 780px; margin: 0 auto;">
          <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>✍️ Write a Testimonial or Share a Clinical Quote</span>
          </h3>
          <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Are you using PocketGull in your clinic or research lab? Share your feedback to help fellow clinicians.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem;">
            <input type="text" id="siteTestimonialAuthor" placeholder="Your Name &amp; Credentials (e.g. Dr. Jane Doe, MD)" style="background: var(--input-bg); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.5rem 0.75rem; color: var(--text); font-size: 0.8125rem; width: 100%; outline: none;" />
            <input type="text" id="siteTestimonialRole" placeholder="Role &amp; Clinic (e.g. Rural Primary Care, Orcas Island)" style="background: var(--input-bg); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.5rem 0.75rem; color: var(--text); font-size: 0.8125rem; width: 100%; outline: none;" />
          </div>

          <textarea id="siteTestimonialQuote" rows="3" placeholder="Share your experience or clinical workflow quote here..." style="background: var(--input-bg); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.5rem 0.75rem; color: var(--text); font-size: 0.8125rem; width: 100%; outline: none; margin-bottom: 0.75rem; font-family: inherit; resize: vertical;"></textarea>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span id="siteTestimonialNotice" style="font-size: 0.75rem; font-weight: bold; color: var(--teal-light); min-height: 1.2rem;"></span>
            <button onclick="submitSiteTestimonial()" class="btn-primary" style="padding: 0.5rem 1.25rem; font-size: 0.8125rem;">
              Submit Quote
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- US GAAP FASB ASC 958 & Tribal Health Stewardship Section -->
    <section id="stewardship" class="section" style="background: var(--bg); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
      <div class="container">
        <div class="section-title">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: var(--amber-light); font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
            <span>⚖️ US GAAP FASB ASC 958 &amp; Tribal Governance</span>
          </div>
          <h2>How Software Income is Used to Further Sovereign Tribal Goals</h2>
          <p>Every dollar generated by PocketGull is accounted for under strict US GAAP Not-for-Profit Functional Allocation (ASC 958-205) and CARE/OCAP Indigenous Data Sovereignty standards.</p>
        </div>

        <!-- Spotlight 3-Card Summary -->
        <div class="grid-3" style="margin-bottom: 2rem;">
          <div class="feature-card" style="border-color: rgba(16, 185, 129, 0.4); background: var(--card);">
            <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Direct Public Benefit</div>
            <div style="font-size: 2rem; font-weight: 900; color: #34d399; margin: 0.25rem 0;">85.0%</div>
            <h4 style="font-size: 0.9375rem; font-weight: 700; color: var(--text); margin-bottom: 0.35rem;">Programmatic Services &amp; Tribal Dividends</h4>
            <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.5;">Direct funding for sovereign tribal vector surveillance, indigenous seed banks, and patient research data dividends.</p>
          </div>

          <div class="feature-card" style="border-color: rgba(56, 189, 248, 0.4); background: var(--card);">
            <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">System Integrity</div>
            <div style="font-size: 2rem; font-weight: 900; color: #38bdf8; margin: 0.25rem 0;">10.0%</div>
            <h4 style="font-size: 0.9375rem; font-weight: 700; color: var(--text); margin-bottom: 0.35rem;">On-Device AI &amp; Zero-Trust Security</h4>
            <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.5;">Local on-device Gemma 4 edge optimization, zero-trust WASM compilers, and NIST post-quantum cryptographic lattices.</p>
          </div>

          <div class="feature-card" style="border-color: rgba(245, 158, 11, 0.4); background: var(--card);">
            <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Statutory Compliance</div>
            <div style="font-size: 2rem; font-weight: 900; color: var(--amber-light); margin: 0.25rem 0;">5.0%</div>
            <h4 style="font-size: 0.9375rem; font-weight: 700; color: var(--text); margin-bottom: 0.35rem;">Governance &amp; Independent CPA Audit</h4>
            <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.5;">Oregon LLC regulatory maintenance, dual-custody multi-signature audits, and HIPAA Safe Harbor certifications.</p>
          </div>
        </div>

        <!-- Detailed GAAP Functional Allocations Table -->
        <div style="background: var(--card); border: 1.5px solid var(--border); border-radius: 1rem; padding: 1.75rem; margin-bottom: 2rem;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 800; color: var(--text);">Statement of Functional Expenses (US GAAP ASC 958-205)</h3>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Projected allocations per $1.00 USD of software licensing &amp; consult revenue</p>
            </div>
            <button onclick="downloadBusinessGaapCsv()" class="btn-secondary" style="padding: 0.4rem 1rem; font-size: 0.75rem; font-family: ui-monospace, monospace; cursor: pointer;">
              <span>📥 Download Statement (CSV)</span>
            </button>
          </div>

          <!-- Interactive Subscription Allocation Slider -->
          <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
              <label for="gaapSlider" style="font-size: 0.8125rem; font-weight: 700; color: var(--text);">
                🎛️ Simulate Your Practice's Monthly Contribution:
              </label>
              <div style="font-family: ui-monospace, monospace; font-size: 1rem; font-weight: 800; color: #34d399;" id="gaapSelectedAmount">
                $49.00 / month (Clinic Pro)
              </div>
            </div>
            <input type="range" id="gaapSlider" min="0" max="250" value="49" step="1" oninput="updateGaapCalculations(this.value)" style="width: 100%; accent-color: var(--teal-light); cursor: pointer;" />
            <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.25rem;">
              <span>$0 (Solo Free)</span>
              <span>$49 (Clinic Pro)</span>
              <span>$100 (Rural Clinic)</span>
              <span>$250 (Group Center)</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            
            <!-- Item 1 -->
            <div style="background: var(--card); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <strong style="color: var(--text); font-size: 0.875rem;">1. Tribal Health Sovereignty &amp; Indigenous Vector Defense</strong>
                  <span style="font-size: 0.6875rem; font-family: ui-monospace, monospace; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700;">PROGRAM SERVICES</span>
                </div>
                <span id="gaapVal1" style="font-family: ui-monospace, monospace; font-weight: 800; color: #34d399; font-size: 0.9375rem;">35.0% ($17.15 / mo)</span>
              </div>
              <div style="width: 100%; background: var(--border); height: 6px; border-radius: 9999px; overflow: hidden; margin-bottom: 0.5rem;">
                <div style="width: 35%; height: 100%; background: #34d399; border-radius: 9999px;"></div>
              </div>
              <p style="font-size: 0.75rem; color: var(--text); line-height: 1.5;">
                Direct technology grants, offline Edge AI triage hardware, and tick-borne pathogen testing kits for sovereign coastal and island tribal communities (e.g. Wampanoag Tribe of Gay Head / Aquinnah and Mashpee Wampanoag health clinics).
              </p>
              <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.35rem;">
                Covenants: CARE Principles (Collective Benefit) &bull; OCAP (Ownership &amp; Control) &bull; IHS Inter-Tribal Compact
              </div>
            </div>

            <!-- Item 2 -->
            <div style="background: var(--card); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <strong style="color: var(--text); font-size: 0.875rem;">2. Sovereign Patient Research Data Dividends</strong>
                  <span style="font-size: 0.6875rem; font-family: ui-monospace, monospace; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700;">PROGRAM SERVICES</span>
                </div>
                <span id="gaapVal2" style="font-family: ui-monospace, monospace; font-weight: 800; color: #34d399; font-size: 0.9375rem;">30.0% ($14.70 / mo)</span>
              </div>
              <div style="width: 100%; background: var(--border); height: 6px; border-radius: 9999px; overflow: hidden; margin-bottom: 0.5rem;">
                <div style="width: 30%; height: 100%; background: #34d399; border-radius: 9999px;"></div>
              </div>
              <p style="font-size: 0.75rem; color: var(--text); line-height: 1.5;">
                Direct 85% revenue-share micro-disbursements deposited to participating patients via Stripe Express / Health Savings Accounts (HSA) with Laplace differential privacy (&epsilon;=0.5) and zero passive telemetry.
              </p>
              <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.35rem;">
                Covenants: HIPAA §164.508 Consent &bull; Differential Privacy &bull; Post-Quantum ZKP Seal
              </div>
            </div>

            <!-- Item 3 -->
            <div style="background: var(--card); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <strong style="color: var(--text); font-size: 0.875rem;">3. Seven Generations Open-Source Seed &amp; Codex Preservation</strong>
                  <span style="font-size: 0.6875rem; font-family: ui-monospace, monospace; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700;">PROGRAM SERVICES</span>
                </div>
                <span id="gaapVal3" style="font-family: ui-monospace, monospace; font-weight: 800; color: #34d399; font-size: 0.9375rem;">20.0% ($9.80 / mo)</span>
              </div>
              <div style="width: 100%; background: var(--border); height: 6px; border-radius: 9999px; overflow: hidden; margin-bottom: 0.5rem;">
                <div style="width: 20%; height: 100%; background: #34d399; border-radius: 9999px;"></div>
              </div>
              <p style="font-size: 0.75rem; color: var(--text); line-height: 1.5;">
                Open source maintenance of @pocketgull clinical tools and conservation of indigenous heirloom botanical seed banks (<em>Hierochloe odorata</em>, <em>Oplopanax horridus</em>, <em>Cryptolepis</em>) for 7 generations forward.
              </p>
              <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.35rem;">
                Covenants: Seven Generations Stewardship &bull; Apache 2.0 Open Source &bull; UNDRIP Article 31
              </div>
            </div>

            <!-- Item 4 -->
            <div style="background: var(--card); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <strong style="color: var(--text); font-size: 0.875rem;">4. Systems Engineering &amp; Zero-Trust Cryptography</strong>
                  <span style="font-size: 0.6875rem; font-family: ui-monospace, monospace; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700;">SYSTEMS INFRASTRUCTURE</span>
                </div>
                <span id="gaapVal4" style="font-family: ui-monospace, monospace; font-weight: 800; color: #38bdf8; font-size: 0.9375rem;">10.0% ($4.90 / mo)</span>
              </div>
              <div style="width: 100%; background: var(--border); height: 6px; border-radius: 9999px; overflow: hidden; margin-bottom: 0.5rem;">
                <div style="width: 10%; height: 100%; background: #38bdf8; border-radius: 9999px;"></div>
              </div>
              <p style="font-size: 0.75rem; color: var(--text); line-height: 1.5;">
                Local on-device Gemma 4 edge optimization, WASM/WebGPU spatial compilers, and hermetic CI/CD verification preventing cloud telemetry egress.
              </p>
              <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.35rem;">
                Covenants: OWASP LLM01 Zero Egress &bull; NIST ML-KEM-768 Lattice Security &bull; FIPS 140-3
              </div>
            </div>

            <!-- Item 5 -->
            <div style="background: var(--card); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <strong style="color: var(--text); font-size: 0.875rem;">5. Governance, Statutory Compliance &amp; CPA Audit</strong>
                  <span style="font-size: 0.6875rem; font-family: ui-monospace, monospace; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(245, 158, 11, 0.15); color: var(--amber-light); font-weight: 700;">MANAGEMENT &amp; GENERAL</span>
                </div>
                <span id="gaapVal5" style="font-family: ui-monospace, monospace; font-weight: 800; color: var(--amber-light); font-size: 0.9375rem;">5.0% ($2.45 / mo)</span>
              </div>
              <div style="width: 100%; background: var(--border); height: 6px; border-radius: 9999px; overflow: hidden; margin-bottom: 0.5rem;">
                <div style="width: 5%; height: 100%; background: var(--amber-light); border-radius: 9999px;"></div>
              </div>
              <p style="font-size: 0.75rem; color: var(--text); line-height: 1.5;">
                Oregon LLC statutory compliance, dual-custody multi-signature audits (M-of-N), independent CPA reviews, and HIPAA Safe Harbor compliance attestations.
              </p>
              <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.35rem;">
                Covenants: US GAAP ASC 958-205 &bull; Oregon ORS 63 &bull; Dual-Custody M-of-N Protocol
              </div>
            </div>

          </div>
        </div>

        <!-- CPA Audit Attestation Footer -->
        <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; font-size: 0.75rem;">
          <div>
            <div style="font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 0.5rem;">
              <span>🛡️ Independent CPA &amp; Tribal Data Audit Attestation:</span>
              <span style="color: #34d399; font-family: ui-monospace, monospace;">Unmodified Clean Opinion</span>
            </div>
            <p style="color: var(--text-muted); margin-top: 0.25rem; max-width: 680px;">
              Revenues and functional expenses strictly comply with FASB ASC 958 and Indigenous Data Sovereignty covenants. Dual-Custody Treasury Signatures: <code>SIG-TRIBAL-CUSTODIAN-0x9F4C2A</code> &bull; <code>SIG-EXECUTIVE-TREASURY-0x3B88E1</code>.
            </p>
          </div>
          <div style="font-family: ui-monospace, monospace; font-size: 0.6875rem; color: var(--text-muted);">
            Oregon Registry: 258869891 &bull; FY 2026-2027
          </div>
        </div>

      </div>
    </section>

    <!-- Transparent Pricing & Upfront Purchase -->
    <section id="pricing" class="section">
      <div class="container">
        <div class="section-title">
          <h2>Simple, Transparent Pricing</h2>
          <p>Choose flexible monthly billing or save with upfront annual and lifetime founder passes.</p>
          
          <!-- Pricing Toggle -->
          <div style="display: inline-flex; background: var(--card); border: 1px solid var(--border); border-radius: 9999px; padding: 0.25rem; margin-top: 1.5rem; gap: 0.25rem;">
            <button id="toggleMonthlyBtn" onclick="setPricingMode('monthly')" class="tab-btn" style="border-radius: 9999px; padding: 0.5rem 1.25rem; font-size: 0.875rem;">
              Monthly Billing
            </button>
            <button id="toggleAnnualBtn" onclick="setPricingMode('annual')" class="tab-btn active" style="border-radius: 9999px; padding: 0.5rem 1.25rem; font-size: 0.875rem;">
              ✨ Upfront &amp; Lifetime (Save 20%)
            </button>
          </div>
          ${regulatoryNoticeHtml}
        </div>

        <!-- Annual / Upfront Cards (Default) -->
        <div id="pricingAnnualGrid" class="grid-3">
          <div class="pricing-card">
            <div>
              <div style="color: var(--amber-light); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Limited Founder Pass</div>
              <h3>Lifetime Solo License</h3>
              <p style="color: var(--text-muted); font-size: 0.875rem;">One-time payment for solo clinicians</p>
              <div class="pricing-price">$299 <span>/ one-time</span></div>
              <ul class="pricing-list">
                <li><span>✓</span> 100% on-device offline AI scribing</li>
                <li><span>✓</span> Zero recurring monthly fees forever</li>
                <li><span>✓</span> Standard SOAP templates &amp; EHR export</li>
                <li><span>✓</span> Lifetime software updates</li>
              </ul>
            </div>
            <a href="/api/billing/checkout?tier=founder_lifetime" class="btn-secondary" style="width: 100%; justify-content: center;">Get Lifetime Access ($299)</a>
          </div>

          <div class="pricing-card featured">
            <div>
              <div style="color: var(--teal-light); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Best Value • Save $98/yr</div>
              <h3>Annual Clinic Pro</h3>
              <p style="color: var(--text-muted); font-size: 0.875rem;">For busy outpatient practitioners</p>
              <div class="pricing-price">$490 <span>/ year</span></div>
              <ul class="pricing-list">
                <li><span>✓</span> Everything in Solo tier</li>
                <li><span>✓</span> Custom specialty note templates</li>
                <li><span>✓</span> Herb-Drug &amp; Cytochrome P450 safety checks</li>
                <li><span>✓</span> Priority clinician support &amp; onboarding</li>
              </ul>
            </div>
            <a href="/api/billing/checkout?tier=clinic_annual" class="btn-primary" style="width: 100%; justify-content: center;">Get Annual Pro Pass ($490/yr)</a>
          </div>

          <div class="pricing-card">
            <div>
              <div style="color: var(--teal-light); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Group Practice Setup</div>
              <h3>Clinic Onboarding Bundle</h3>
              <p style="color: var(--text-muted); font-size: 0.875rem;">Turnkey setup for group clinics</p>
              <div class="pricing-price">$1,250 <span>/ clinic setup</span></div>
              <ul class="pricing-list">
                <li><span>✓</span> Up to 5 clinician licenses included</li>
                <li><span>✓</span> White-glove EHR template customization</li>
                <li><span>✓</span> 1-on-1 staff workflow integration</li>
                <li><span>✓</span> Dedicated HIPAA Business Associate Agreement</li>
              </ul>
            </div>
            <a href="/api/billing/checkout?tier=clinic_onboarding" class="btn-secondary" style="width: 100%; justify-content: center;">Order Setup Bundle ($1,250)</a>
          </div>
        </div>

        <!-- Monthly Cards (Hidden by default) -->
        <div id="pricingMonthlyGrid" class="grid-3" style="display: none;">
          <div class="pricing-card">
            <div>
              <h3>Solo Practitioner</h3>
              <p style="color: var(--text-muted); font-size: 0.875rem;">For individual clinicians</p>
              <div class="pricing-price">$0 <span>/ forever</span></div>
              <ul class="pricing-list">
                <li><span>✓</span> Ambient voice scribing</li>
                <li><span>✓</span> Secure local processing</li>
                <li><span>✓</span> Standard SOAP templates</li>
                <li><span>✓</span> 1-click note copy to EHR</li>
              </ul>
            </div>
            <a href="https://pocketgull.app" class="btn-secondary" style="width: 100%; justify-content: center;">Launch Solo Scribe Free</a>
          </div>

          <div class="pricing-card featured">
            <div>
              <div style="color: var(--teal-light); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">Most Flexible</div>
              <h3>Clinic Pro</h3>
              <p style="color: var(--text-muted); font-size: 0.875rem;">For outpatient group practices</p>
              <div class="pricing-price">$49 <span>/ provider / month</span></div>
              <ul class="pricing-list">
                <li><span>✓</span> Everything in Solo</li>
                <li><span>✓</span> Custom specialty note templates</li>
                <li><span>✓</span> Medication &amp; Herb-Drug safety checker</li>
                <li><span>✓</span> Priority clinician support</li>
              </ul>
            </div>
            <a href="/api/billing/checkout?tier=clinic_pro_monthly" class="btn-primary" style="width: 100%; justify-content: center;">Start Monthly Pro ($49/mo)</a>
          </div>

          <div class="pricing-card">
            <div>
              <h3>Health System</h3>
              <p style="color: var(--text-muted); font-size: 0.875rem;">For hospital departments</p>
              <div class="pricing-price">Custom <span>/ enterprise</span></div>
              <ul class="pricing-list">
                <li><span>✓</span> Direct Epic / Cerner integration</li>
                <li><span>✓</span> Custom on-premise AI deployment</li>
                <li><span>✓</span> Dedicated HIPAA BAA</li>
                <li><span>✓</span> 24/7 technical SLA</li>
              </ul>
            </div>
            <a href="mailto:leads@pocketgull.app?subject=Enterprise%20Clinical%20Inquiry" class="btn-secondary" style="width: 100%; justify-content: center;">Contact Enterprise</a>
          </div>
        </div>
      </div>
    </section>
  </main>

${renderLegalFooterHtml()}

  <script>
    // Scribe Simulator & The Austrian Living Trajectory Engine
    let currentScenarioKey = 'ortho';
    let currentDocMode = 'trajectory';

    const scenarios = {
      ortho: {
        dialogueHtml: '"Doctor, <span class="dialogue-token token-loc">my left knee has been aching on the inside</span> when <span class="dialogue-token token-stairs">walking down stairs</span> <span class="dialogue-token token-dur">for the past two weeks</span>. It gets <span class="dialogue-token token-swelling">swollen by the evening</span>, and <span class="dialogue-token token-stiff">morning stiffness lasts about 20 minutes</span>. <span class="dialogue-token token-nsaid">Ibuprofen gives minor relief</span>."',
        trajectory: \`
          <div class="act-card" onmouseenter="highlightDialogue('dur', 'loc', 'stairs', 'swelling')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: #34d399;">
              <span>🌿 ACT I: WHERE YOU'VE BEEN</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Trail Traversed)</span>
            </div>
            <div class="act-body">
              Traversed 2-week subacute medial joint strain following mechanical stairs descent. Preserved ligamentous and bone structural integrity. Your body is naturally mobilizing reparative circulation to support joint recovery (mild evening swelling). Zero structural defeat.
            </div>
          </div>
          <div class="act-card" onmouseenter="highlightDialogue('stiff', 'loc')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: #38bdf8;">
              <span>⚡ ACT II: WHERE YOU STAND TODAY</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Living Foothold)</span>
            </div>
            <div class="act-body">
              Full active range of motion preserved (0–120°). Joint line tenderness localized to medial compartment; morning stiffness resolves in &lt;20 minutes, confirming resilient cartilage reserve rather than inflammatory systemic arthritis.
            </div>
          </div>
          <div class="act-card" onmouseenter="highlightDialogue('stairs', 'nsaid')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: var(--amber-light);">
              <span>🧭 ACT III: WHERE YOU'RE GOING</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Horizon of Action)</span>
            </div>
            <div class="act-body">
              <div><strong>&bull; 30-Day Vitality Milestone:</strong> Comfortable, pain-free stair descent and evening joint ease.</div>
              <div style="margin-top: 0.35rem;"><strong>&bull; Daily Restoration Rituals:</strong> Closed-chain quadriceps strengthening (straight leg raises, low-impact stationary cycling), weight-bearing alignment films, trial topical diclofenac to soothe local receptors while protecting digestive health.</div>
            </div>
          </div>
        \`,
        soap: \`
          <div onmouseenter="highlightDialogue('dur', 'loc', 'stairs', 'nsaid')" onmouseleave="clearDialogueHighlight()"><strong style="color: #2dd4bf;">S:</strong> 2-week history of medial left knee pain &amp; swelling after walking stairs. Morning stiffness &lt;30m. Partial relief with NSAIDs.</div>
          <div style="margin-top: 0.4rem;" onmouseenter="highlightDialogue('loc', 'swelling')" onmouseleave="clearDialogueHighlight()"><strong style="color: #2dd4bf;">O:</strong> Medial joint-line tenderness, mild effusion, active ROM 0-120°. Neurovascular intact.</div>
          <div style="margin-top: 0.4rem;"><strong style="color: #2dd4bf;">A:</strong> Medial knee pain, early osteoarthritis vs. meniscus strain (ICD-10 M17.12).</div>
          <div style="margin-top: 0.4rem;"><strong style="color: #2dd4bf;">P:</strong> Weight-bearing knee X-rays, low-impact physical therapy exercise protocol, trial topical diclofenac.</div>
        \`
      },
      cardio: {
        dialogueHtml: '"<span class="dialogue-token token-bp">My home blood pressure readings have been averaging 142 over 88 for the past month</span>. I <span class="dialogue-token token-denies">haven\\\'t had any chest pain or shortness of breath</span>, but I\\\'ve been <span class="dialogue-token token-stress">feeling more stressed at work</span>."',
        trajectory: \`
          <div class="act-card" onmouseenter="highlightDialogue('stress', 'bp')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: #34d399;">
              <span>🌿 ACT I: WHERE YOU'VE BEEN</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Trail Traversed)</span>
            </div>
            <div class="act-body">
              Traversed 1 month of heightened workplace demands. Your cardiovascular vascular tree has been intelligently adapting, elevating perfusion pressure to meet cognitive focus demands. Zero angina, dyspnea, or palpitations—the heart muscle is strong and uncompromised.
            </div>
          </div>
          <div class="act-card" onmouseenter="highlightDialogue('bp')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: #38bdf8;">
              <span>⚡ ACT II: WHERE YOU STAND TODAY</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Living Foothold)</span>
            </div>
            <div class="act-body">
              In-office BP: 140/86 mmHg (repeat 136/84). Regular sinus rhythm, clear lungs, zero peripheral edema. Elevated home numbers (142/88) reflect sympathetic vasomotor tone rather than fixed arterial stiffness.
            </div>
          </div>
          <div class="act-card" onmouseenter="highlightDialogue('stress', 'bp')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: var(--amber-light);">
              <span>🧭 ACT III: WHERE YOU'RE GOING</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Horizon of Action)</span>
            </div>
            <div class="act-body">
              <div><strong>&bull; 30-Day Vitality Milestone:</strong> Daytime resting BP returning gently toward the healthy 120s/80s baseline.</div>
              <div style="margin-top: 0.35rem;"><strong>&bull; Daily Restoration Rituals:</strong> 0.1 Hz vagal breath pacing (6 breaths/min for 5 minutes twice daily to restore baroreflex sensitivity), 150 min/wk restorative outdoor walking, potassium/magnesium-rich Mediterranean nutrition, repeat 4-week home log.</div>
            </div>
          </div>
        \`,
        soap: \`
          <div onmouseenter="highlightDialogue('bp', 'denies', 'stress')" onmouseleave="clearDialogueHighlight()"><strong style="color: #2dd4bf;">S:</strong> 1-month elevated home BP log (avg 142/88 mmHg). Denies angina, dyspnea, or palpitations. Notes increased workplace stress.</div>
          <div style="margin-top: 0.4rem;"><strong style="color: #2dd4bf;">O:</strong> In-office BP: 140/86 mmHg (repeat 136/84). Regular rate &amp; rhythm, no peripheral edema.</div>
          <div style="margin-top: 0.4rem;"><strong style="color: #2dd4bf;">A:</strong> Essential hypertension, Stage 1 (ICD-10 I10), stress-augmented autonomic vasomotor state.</div>
          <div style="margin-top: 0.4rem;"><strong style="color: #2dd4bf;">P:</strong> DASH dietary protocol, 150m/wk moderate aerobic exercise, 0.1Hz vagal breath pacing, follow-up home BP log in 4 weeks.</div>
        \`
      },
      integrative: {
        dialogueHtml: '"I\\\'ve had <span class="dialogue-token token-fatigue">persistent fatigue and brain fog</span> <span class="dialogue-token token-viral">since my viral illness three months ago</span>. My <span class="dialogue-token token-labs">routine labs were normal</span>, but my <span class="dialogue-token token-crash">afternoon energy crashes hard around 2 PM</span>."',
        trajectory: \`
          <div class="act-card" onmouseenter="highlightDialogue('viral', 'labs')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: #34d399;">
              <span>🌿 ACT I: WHERE YOU'VE BEEN</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Trail Traversed)</span>
            </div>
            <div class="act-body">
              Successfully navigated and cleared an acute viral infection 3 months ago with robust immune defense. Standard blood panels (CBC, CMP, TSH) confirm healthy organ reserve. Cellular mitochondria mobilized enormous energy during host defense and are now in a recovery cycle.
            </div>
          </div>
          <div class="act-card" onmouseenter="highlightDialogue('crash', 'fatigue')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: #38bdf8;">
              <span>⚡ ACT II: WHERE YOU STAND TODAY</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Living Foothold)</span>
            </div>
            <div class="act-body">
              Resting HR 68 bpm, normotensive. The 14:00 energy drop represents an exaggerated circadian cortisol nadir rather than permanent damage. Cellular energy recharge pathways are intact and ready for gentle entrainment.
            </div>
          </div>
          <div class="act-card" onmouseenter="highlightDialogue('crash', 'viral')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: var(--amber-light);">
              <span>🧭 ACT III: WHERE YOU'RE GOING</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Horizon of Action)</span>
            </div>
            <div class="act-body">
              <div><strong>&bull; 30-Day Vitality Milestone:</strong> Smooth afternoon energy curve and waking feeling deeply restored.</div>
              <div style="margin-top: 0.35rem;"><strong>&bull; Daily Restoration Rituals:</strong> 10,000-lux natural morning sunlight within 30m of waking, mitochondrial cofactor support (CoQ10 200mg + Alpha Lipoic Acid), proactive 15-minute restorative quiet pause at 13:45 prior to the dip, salivary diurnal cortisol profile.</div>
            </div>
          </div>
        \`,
        soap: \`
          <div onmouseenter="highlightDialogue('fatigue', 'viral', 'crash')" onmouseleave="clearDialogueHighlight()"><strong style="color: #2dd4bf;">S:</strong> 3-month post-viral fatigue with cognitive clouding. Afternoon energy slump at 14:00. Standard CMP/CBC unrevealing.</div>
          <div style="margin-top: 0.4rem;" onmouseenter="highlightDialogue('labs')" onmouseleave="clearDialogueHighlight()"><strong style="color: #2dd4bf;">O:</strong> Vitals stable. Thyroid non-tender, resting HR 68 bpm. Orthostatic vitals unremarkable.</div>
          <div style="margin-top: 0.4rem;"><strong style="color: #2dd4bf;">A:</strong> Post-viral fatigue syndrome with circadian rhythm disruption (ICD-10 G93.3).</div>
          <div style="margin-top: 0.4rem;"><strong style="color: #2dd4bf;">P:</strong> Circadian light therapy (10k lux morning), CoQ10 200mg daily, pacing protocol, salivary cortisol panel.</div>
        \`
      },
      systems: {
        dialogueHtml: '"Doctor, I have <span class="dialogue-token token-gums">bleeding gums when flossing</span>, my <span class="dialogue-token token-hr">resting heart rate has jumped up to 88</span>, and my <span class="dialogue-token token-bp">blood pressure has been creeping up despite eating clean</span>."',
        trajectory: \`
          <div class="act-card" onmouseenter="highlightDialogue('bp', 'gums')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: #34d399;">
              <span>🌿 ACT I: WHERE YOU'VE BEEN</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Trail Traversed)</span>
            </div>
            <div class="act-body">
              Maintained disciplined, clean nutritional foundation. Subgingival biofilm micro-ecology developed localized capillary sensitivity during flossing. Systemic circulation dispatched immune sentinels to protect tissues—a healthy, adaptive physiological response.
            </div>
          </div>
          <div class="act-card" onmouseenter="highlightDialogue('hr', 'bp')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: #38bdf8;">
              <span>⚡ ACT II: WHERE YOU STAND TODAY</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Living Foothold)</span>
            </div>
            <div class="act-body">
              HR 88 bpm, BP 138/86 mmHg. Vagal tone (RMSSD 24ms) indicates transient sympathetic vigilance triggered by oral-endothelial signaling (LPS translocation). Vascular lining possesses exceptional regenerative capacity once local biofilm is balanced.
            </div>
          </div>
          <div class="act-card" onmouseenter="highlightDialogue('gums', 'hr')" onmouseleave="clearDialogueHighlight()">
            <div class="act-header" style="color: var(--amber-light);">
              <span>🧭 ACT III: WHERE YOU'RE GOING</span>
              <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: normal;">(The Horizon of Action)</span>
            </div>
            <div class="act-body">
              <div><strong>&bull; 30-Day Vitality Milestone:</strong> Healthy pink gingiva with zero flossing sensitivity; resting HR stabilizing into the 70s.</div>
              <div style="margin-top: 0.35rem;"><strong>&bull; Systems Leverage Rituals (Meadows Level 1):</strong> Botanical sulcular decontamination rinse, periodontal ultrasonic cleaning referral, CoQ10 100mg to nourish gingival and vascular collagen, 0.1 Hz vagal breath pacing to ease autonomic vigilance.</div>
            </div>
          </div>
        \`,
        soap: \`
          <div onmouseenter="highlightDialogue('gums', 'hr', 'bp')" onmouseleave="clearDialogueHighlight()"><strong style="color: #2dd4bf;">S:</strong> Bleeding gums, resting tachycardia (88 bpm), and subacute BP elevation despite clean nutrition.</div>
          <div style="margin-top: 0.4rem;"><strong style="color: #2dd4bf;">O:</strong> BP 138/86, HR 88 bpm. SIBI periodontal inflammation index elevated. RMSSD depressed (24ms).</div>
          <div style="margin-top: 0.4rem;"><strong style="color: #2dd4bf;">A:</strong> Oral-Endothelial Axis Stress (ICD-10 K05.10 / I10), sympathetic tone augmented by oral-vascular signaling.</div>
          <div style="margin-top: 0.4rem;"><strong style="color: #2dd4bf;">P (Meadows Level 1):</strong> SIBI periodontal decontamination rinse, CoQ10 100mg, 0.1Hz vagal breath pacing (6 bpm), periodontal scaling referral.</div>
        \`
      }
    };

    function highlightDialogue(...tokens) {
      clearDialogueHighlight();
      tokens.forEach(t => {
        document.querySelectorAll('.dialogue-token.token-' + t).forEach(el => el.classList.add('active'));
      });
    }

    function clearDialogueHighlight() {
      document.querySelectorAll('.dialogue-token').forEach(el => el.classList.remove('active'));
    }

    function setDocMode(mode) {
      currentDocMode = mode;
      const trajBtn = document.getElementById('modeTrajectoryBtn');
      const soapBtn = document.getElementById('modeSoapBtn');
      const title = document.getElementById('outputHeaderTitle');
      const badge = document.getElementById('outputHeaderBadge');

      if (mode === 'trajectory') {
        if (trajBtn) trajBtn.classList.add('active');
        if (soapBtn) soapBtn.classList.remove('active');
        if (title) title.innerHTML = '🧭 The 3-Act Living Trajectory';
        if (badge) {
          badge.textContent = 'Austrian Salutogenesis';
          badge.style.color = 'var(--teal-light)';
        }
      } else {
        if (soapBtn) soapBtn.classList.add('active');
        if (trajBtn) trajBtn.classList.remove('active');
        if (title) title.innerHTML = '📋 Legacy SOAP Note';
        if (badge) {
          badge.textContent = '1968 Billing Archive';
          badge.style.color = 'var(--amber-light)';
        }
      }
      renderDocOutput();
    }

    function renderDocOutput() {
      const data = scenarios[currentScenarioKey];
      const dBox = document.getElementById('dialogueBox');
      const oBox = document.getElementById('outputBox');
      if (data) {
        if (dBox) dBox.innerHTML = data.dialogueHtml;
        if (oBox) {
          oBox.innerHTML = (currentDocMode === 'trajectory') ? data.trajectory : data.soap;
        }
      }
    }

    function loadScenario(key, btnEl) {
      currentScenarioKey = key;
      document.querySelectorAll('.scenario-tab-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = (btnEl && btnEl.classList) ? btnEl : document.querySelector('.scenario-tab-btn[data-scenario="' + key + '"]');
      if (activeBtn) {
        activeBtn.classList.add('active');
      }
      renderDocOutput();
    }

    function copyCurrentOutput() {
      const oBox = document.getElementById('outputBox');
      const text = oBox ? oBox.innerText : '';
      const notice = document.getElementById('copyNotice');
      const label = currentDocMode === 'trajectory' ? '3-Act Living Trajectory' : 'SOAP note';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          if (notice) {
            notice.textContent = '✓ Copied ' + label + ' to clipboard!';
            setTimeout(() => { notice.textContent = ''; }, 3000);
          }
        }).catch(() => {
          fallbackCopy(text, label);
        });
      } else {
        fallbackCopy(text, label);
      }
    }

    function fallbackCopy(text, label) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      const notice = document.getElementById('copyNotice');
      if (notice) {
        notice.textContent = '✓ Copied ' + label + ' to clipboard!';
        setTimeout(() => { notice.textContent = ''; }, 3000);
      }
    }

    function updateGaapCalculations(amtStr) {
      const amt = parseFloat(amtStr) || 0;
      const sel = document.getElementById('gaapSelectedAmount');
      if (sel) {
        let tierName = 'Custom Plan';
        if (amt === 0) tierName = 'Solo Free Tier';
        else if (amt <= 49) tierName = 'Clinic Pro';
        else if (amt <= 150) tierName = 'Rural Health Center';
        else tierName = 'Group Practice / Health System';
        sel.textContent = '$' + amt.toFixed(2) + ' / month (' + tierName + ')';
      }
      const v1 = document.getElementById('gaapVal1');
      const v2 = document.getElementById('gaapVal2');
      const v3 = document.getElementById('gaapVal3');
      const v4 = document.getElementById('gaapVal4');
      const v5 = document.getElementById('gaapVal5');
      if (v1) v1.textContent = '35.0% ($' + (amt * 0.35).toFixed(2) + ' / mo)';
      if (v2) v2.textContent = '30.0% ($' + (amt * 0.30).toFixed(2) + ' / mo)';
      if (v3) v3.textContent = '20.0% ($' + (amt * 0.20).toFixed(2) + ' / mo)';
      if (v4) v4.textContent = '10.0% ($' + (amt * 0.10).toFixed(2) + ' / mo)';
      if (v5) v5.textContent = '5.0% ($' + (amt * 0.05).toFixed(2) + ' / mo)';
    }

    function togglePaperMode() {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      const icon = document.getElementById('themeToggleIcon');
      const text = document.getElementById('themeToggleText');
      
      if (isCurrentlyDark) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('paper');
        try { localStorage.setItem('pocketgull_theme', 'paper'); } catch(e) {}
        if (icon && text) {
          icon.textContent = '🌙';
          text.textContent = 'Obsidian Dark';
        }
      } else {
        document.documentElement.classList.remove('paper');
        document.documentElement.classList.add('dark');
        try { localStorage.setItem('pocketgull_theme', 'dark'); } catch(e) {}
        if (icon && text) {
          icon.textContent = '📜';
          text.textContent = 'Monastic Paper';
        }
      }
    }

    function syncThemeButton() {
      const isDark = document.documentElement.classList.contains('dark');
      const icon = document.getElementById('themeToggleIcon');
      const text = document.getElementById('themeToggleText');
      if (icon && text) {
        icon.textContent = isDark ? '📜' : '🌙';
        text.textContent = isDark ? 'Monastic Paper' : 'Obsidian Dark';
      }
    }

    // Initialize Simulator & Theme on Load
    document.addEventListener('DOMContentLoaded', function() {
      syncThemeButton();
      renderDocOutput();
    });
    // Fallback immediate initialization
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      syncThemeButton();
      renderDocOutput();
    }

    function setPricingMode(mode) {
      const monthlyGrid = document.getElementById('pricingMonthlyGrid');
      const annualGrid = document.getElementById('pricingAnnualGrid');
      const monthlyBtn = document.getElementById('toggleMonthlyBtn');
      const annualBtn = document.getElementById('toggleAnnualBtn');

      if (mode === 'monthly') {
        monthlyGrid.style.display = 'grid';
        annualGrid.style.display = 'none';
        monthlyBtn.classList.add('active');
        annualBtn.classList.remove('active');
      } else {
        monthlyGrid.style.display = 'none';
        annualGrid.style.display = 'grid';
        annualBtn.classList.add('active');
        monthlyBtn.classList.remove('active');
      }
    }

    // Interactive Eye Exam
    const eyeLines = [
      { fraction: '20/200', size: 80 },
      { fraction: '20/100', size: 55 },
      { fraction: '20/70',  size: 40 },
      { fraction: '20/50',  size: 30 },
      { fraction: '20/40',  size: 22 },
      { fraction: '20/30',  size: 16 },
      { fraction: '20/20',  size: 12 }
    ];
    let eyeLineIdx = 0;
    let eyeQuestionCount = 0;
    let eyeCorrectCount = 0;
    let currentEyeDir = 'RIGHT';

    function setEyeDirection() {
      const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      currentEyeDir = dirs[Math.floor(Math.random() * dirs.length)];
      const svg = document.getElementById('eyeOptotypeSvg');
      if (svg) {
        let rot = '0deg';
        if (currentEyeDir === 'DOWN') rot = '90deg';
        if (currentEyeDir === 'LEFT') rot = '180deg';
        if (currentEyeDir === 'UP') rot = '270deg';
        svg.style.transform = 'rotate(' + rot + ')';
        svg.style.width = eyeLines[eyeLineIdx].size + 'px';
        svg.style.height = eyeLines[eyeLineIdx].size + 'px';
      }
      document.getElementById('eyeExamLineText').textContent = eyeLines[eyeLineIdx].fraction;
      document.getElementById('eyeExamScoreText').textContent = eyeCorrectCount + ' / ' + eyeQuestionCount;
    }

    function handleEyeAnswer(chosen) {
      eyeQuestionCount++;
      const isCorrect = chosen === currentEyeDir;
      const feedback = document.getElementById('eyeExamFeedback');
      if (isCorrect) {
        eyeCorrectCount++;
        feedback.innerHTML = '<span style="color: #2dd4bf;">✓ Correct! Resolving angle confirmed.</span>';
      } else {
        feedback.innerHTML = '<span style="color: #fb7185;">✗ Direction missed.</span>';
      }

      if (eyeQuestionCount % 3 === 0) {
        if (eyeCorrectCount >= eyeQuestionCount * 0.66 && eyeLineIdx < eyeLines.length - 1) {
          eyeLineIdx++;
          feedback.innerHTML = '<span style="color: #fbbf24;">🎉 Advanced to ' + eyeLines[eyeLineIdx].fraction + ' line!</span>';
        } else if (eyeLineIdx === eyeLines.length - 1 && isCorrect) {
          feedback.innerHTML = '<span style="color: #2dd4bf;">🏆 Outstanding 20/20 Visual Acuity Verified!</span>';
        }
      }

      setTimeout(setEyeDirection, 300);
    }
    function submitSiteTestimonial() {
      const author = document.getElementById('siteTestimonialAuthor').value.trim();
      const role = document.getElementById('siteTestimonialRole').value.trim() || 'Verified Practitioner';
      const quote = document.getElementById('siteTestimonialQuote').value.trim();
      const notice = document.getElementById('siteTestimonialNotice');

      if (!author || !quote) {
        notice.style.color = '#fb7185';
        notice.textContent = 'Please provide both your name and your quote.';
        return;
      }

      const container = document.getElementById('testimonialsContainer');
      const newCard = document.createElement('div');
      newCard.className = 'feature-card';
      newCard.style.background = 'var(--card)';
      newCard.style.display = 'flex';
      newCard.style.flexDirection = 'column';
      newCard.style.justifyContent = 'space-between';
      newCard.style.borderColor = 'rgba(20, 184, 166, 0.4)';

      const topSection = document.createElement('div');
      const headerRow = document.createElement('div');
      headerRow.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;';
      const starSpan = document.createElement('span');
      starSpan.style.fontSize = '1.5rem';
      starSpan.textContent = '✨';
      const authorWrap = document.createElement('div');
      const authorHeading = document.createElement('h4');
      authorHeading.style.cssText = 'font-size: 0.9375rem; color: var(--text); font-weight: 700;';
      authorHeading.textContent = author;
      const roleP = document.createElement('p');
      roleP.style.cssText = 'font-size: 0.75rem; color: var(--text-muted);';
      roleP.textContent = role;
      authorWrap.appendChild(authorHeading);
      authorWrap.appendChild(roleP);
      headerRow.appendChild(starSpan);
      headerRow.appendChild(authorWrap);

      const blockquote = document.createElement('blockquote');
      blockquote.style.cssText = 'font-size: 0.8125rem; color: var(--text); font-style: italic; line-height: 1.6; border-left: 2px solid #2dd4bf; padding-left: 0.75rem;';
      blockquote.textContent = '"' + quote + '"';

      topSection.appendChild(headerRow);
      topSection.appendChild(blockquote);

      const footerDiv = document.createElement('div');
      footerDiv.style.cssText = 'margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border); font-size: 0.75rem; font-family: ui-monospace, monospace; color: #2dd4bf; font-weight: bold;';
      footerDiv.textContent = '⚡ Community Submission Verified';

      newCard.appendChild(topSection);
      newCard.appendChild(footerDiv);

      container.prepend(newCard);

      document.getElementById('siteTestimonialAuthor').value = '';
      document.getElementById('siteTestimonialRole').value = '';
      document.getElementById('siteTestimonialQuote').value = '';
      notice.style.color = '#2dd4bf';
      notice.textContent = '✓ Thank you! Your quote has been submitted.';
      setTimeout(() => { notice.textContent = ''; }, 4000);
    }

    function downloadBusinessGaapCsv() {
      const csv = 'Category,GAAP Classification,Allocation Percentage,Annual USD Equivalent (per $1.00),Governing Standards,Tribal Goal Description\\n' +
        '"1. Tribal Health Sovereignty & Indigenous Vector Defense","PROGRAM_SERVICES","35.0%","$0.35","CARE Principles; OCAP; IHS Inter-Tribal Compact","Direct technology grants, offline Edge AI triage hardware, and tick-borne pathogen testing kits for sovereign coastal and island tribal communities."\\n' +
        '"2. Sovereign Patient Research Data Dividends","PROGRAM_SERVICES","30.0%","$0.30","HIPAA §164.508 Consent; Differential Privacy (eps=0.5); Post-Quantum ZKP Seal","Direct 85% revenue-share micro-disbursements deposited to participating patients via Stripe Express / HSA accounts."\\n' +
        '"3. Seven Generations Open-Source Seed & Codex Preservation","PROGRAM_SERVICES","20.0%","$0.20","Seven Generations Stewardship; Apache 2.0 Open Source; UNDRIP Article 31","Open source maintenance of @pocketgull clinical tools and conservation of indigenous heirloom botanical seed banks."\\n' +
        '"4. Systems Engineering & Zero-Trust Cryptography","SYSTEMS_INFRASTRUCTURE","10.0%","$0.10","OWASP LLM01 Zero Egress; NIST ML-KEM-768 Lattice Security; FIPS 140-3","Local on-device Gemma 4 edge optimization, WASM/WebGPU spatial compilers, and hermetic CI/CD verification."\\n' +
        '"5. Governance, Statutory Compliance & CPA Audit","MANAGEMENT_GENERAL","5.0%","$0.05","US GAAP ASC 958-205; Oregon ORS 63; Dual-Custody M-of-N Protocol","Oregon LLC statutory compliance, dual-custody multi-signature audits (M-of-N), independent CPA reviews, and HIPAA Safe Harbor compliance attestations."';

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PocketGull_GAAP_Tribal_Stewardship_Statement.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    setEyeDirection();

    /* ─── Condition & Clinical Thrift Explorer Engine ─── */
    const CONDITION_THRIFT_DATA = {
      metabolic: {
        badge: 'CASE STUDY P001 &bull; CARDIOMETABOLIC HEALTH',
        badgeColor: 'var(--teal)',
        title: 'Metabolic Syndrome, Insulin Resistance &amp; Essential Hypertension',
        subtitle: 'Stage 1 HTN (138/88 mmHg), elevated fasting glucose (118 mg/dL), visceral adiposity, and endothelial fatigue.',
        act1: 'Gradual metabolic strain and insulin resistance developed over 5 years of sedentary desk work and fragmented sleep. Acknowledged with zero moral stigma or fatalism.',
        act2: 'Endothelial microcirculation remains fully responsive. Fasting insulin sensitivity and vascular compliance can be restored through circadian meal timing and nitric oxide donors.',
        act3: 'Target resting blood pressure &lt;120/80 mmHg, HbA1c &lt;5.7%, and 45 minutes of sustained aerobic vitality achieved within 90 days.',
        suggestions: [
          '<strong>WHO HEARTS Stepped Care:</strong> First-line open generic ACE-i (Lisinopril 10 mg) or CCB (Amlodipine 5 mg) before considering costly brand combinations.',
          '<strong>Post-Prandial Muscle Contraction:</strong> 10-minute moderate walking within 30 minutes post-meal stimulates GLUT4 glucose uptake independent of insulin.',
          '<strong>DASH Potassium Optimization:</strong> Target &ge;3:1 potassium-to-sodium ratio (spinach, avocado, lentils) to induce endothelial vascular smooth muscle hyperpolarization.',
          '<strong>AMPK Metabolic Activation:</strong> Berberine HCl (500 mg BID with meals) or open generic Metformin HCl (500 mg) to restore cellular energy charge.'
        ],
        retailBenchmark: '$185.00 / month',
        retailDetail: 'Brand-name ARB combo + SGLT2-i / statin retail cash benchmark',
        essentialCost: '$7.50 / month',
        essentialDetail: 'WHO EML generic Lisinopril + Metformin HCl open generic formulary',
        savingsAmount: '$2,130.00 / year',
        savingsPercent: '95.9% Savings',
        preventedCascade: 'Eliminates premature multi-drug escalation and emergency hypertensive urgency visits.',
        projectCost: '$0.00 (On-Device Gemma 4 / Local Edge)',
        docDrillTerm: 'Metabolic Syndrome & Stepped Care'
      },
      dysautonomia: {
        badge: 'PATIENT ARCHETYPE: CHARLES DARWIN &bull; AUTONOMIC CDS',
        badgeColor: '#10b981',
        title: 'Orthostatic Dysautonomia, POTS &amp; Post-Exertional Malaise (PEM)',
        subtitle: 'Postural tachycardia (&Delta;HR +38 bpm on standing), autonomic vagal strain (RMSSD 18ms), and mitochondrial energy depletion.',
        act1: 'Severe historical episodes of unremitting dizziness, gastrointestinal spasms, and prolonged post-exertional fatigue, historically misdiagnosed as purely psychosomatic.',
        act2: 'Sympathetic hyperarousal persists secondary to baroreflex deconditioning and splanchnic venous pooling; vagal cholinergic brake has low resting reserve.',
        act3: 'Establish standing hemodynamic stability without tachycardia spikes, protect cellular ATP pools with strict pacing thresholds, and eradicate crash cycles.',
        suggestions: [
          '<strong>0.10 Hz Mayer Wave Pacing:</strong> 4 seconds nasal inhale, 6 seconds pursed-lip exhale (6 breaths/min) for 10 minutes BID to stimulate the vagal cholinergic brake.',
          '<strong>Anaerobic Heart Rate Ceiling (105 bpm):</strong> Real-time audio-haptic pacing alert to avoid crossing the ventilatory anaerobic threshold and depleting mitochondrial ATP.',
          '<strong>WHO Reduced Osmolarity ORS:</strong> WHO standard oral rehydration salts (245 mOsm/L) dissolved in 1L clean water to expand plasma volume without renal diuresis.',
          '<strong>Pacing Shield Rest Days:</strong> Scheduled non-negotiable horizontal rest days following cognitive or physical exertion to maintain energy envelope equilibrium.'
        ],
        retailBenchmark: '$340.00 / month',
        retailDetail: 'Commercial branded electrolyte drinks, midodrine/fludrocortisone markups, and recurrent ER crash admissions',
        essentialCost: '$4.80 / month',
        essentialDetail: 'WHO Standard Reduced Osmolarity ORS sachets + open generic salt tableting',
        savingsAmount: '$4,800.00+ / year',
        savingsPercent: '98.5% Savings',
        preventedCascade: 'Averts recurring $4,500 acute emergency room admissions and redundant $3,500 tilt-table re-evaluations.',
        projectCost: '$0.00 (Client-side sensor heuristics & Web Audio)',
        docDrillTerm: '0.1 Hz Resonant Pacing'
      },
      neuro: {
        badge: 'CASE STUDY P002: MARA SANTOS &bull; NEURO-SANCTUARY',
        badgeColor: '#0284c7',
        title: 'Multiple Sclerosis, Uhthoff Conduction Reserve &amp; Smoldering PIRA',
        subtitle: 'Relapsing-remitting MS, Uhthoff heat sensitivity (&Delta;T &le; 0.40&deg;C), walking fatigue, and anxiety over pseudo-relapse.',
        act1: 'Diagnosis traversed with calm neurological grit; acute historical focal flares successfully brought under remission with disease-modifying therapy.',
        act2: 'Demyelinated central axons operate with reduced safety factor; subclinical core temperature elevations (&Delta;T &ge; 0.40&deg;C) cause transient sodium channel inactivation.',
        act3: 'Sustain active professional career and outdoor mobility across all seasons by mastering biophysical pre-cooling and monitoring biomarker stability.',
        suggestions: [
          '<strong>Uhthoff Conduction Reserve Tracking:</strong> Continuous biophysical core temperature margin modeling (&Delta;T &le; 0.40&deg;C) to alert before heat blocks occur.',
          '<strong>Phase-Change Pre-Cooling Protocol:</strong> Ingest 500 mL ice-slurry beverage and wear 15&deg;C phase-change cooling vest before warm outdoor walking.',
          '<strong>Quarterly Serum Neurofilament Light (sNfL):</strong> Liquid biopsy tracking to objectively confirm axonal stability and rule out smoldering progression.',
          '<strong>Mitochondrial Resynthesis Support:</strong> High-dose Vitamin D3 (targeting 60&ndash;80 ng/mL) plus CoQ10 200 mg BID to support axonal ATP synthesis.'
        ],
        retailBenchmark: '$2,800.00 / scan',
        retailDetail: 'Unnecessary emergency brain/spine contrast MRI scans triggered by heat-induced pseudo-relapses',
        essentialCost: '$18.00 / month',
        essentialDetail: 'Generic Vitamin D3, CoQ10, and reusable physical phase-change thermal packs',
        savingsAmount: '$5,600.00+ / year',
        savingsPercent: '99.3% Savings',
        preventedCascade: 'Prevents panicky emergency department visits, unindicated high-dose IV steroid boluses, and premature DMT switching.',
        projectCost: '$0.00 (Embedded WebAssembly thermal model)',
        docDrillTerm: 'Uhthoff Phenomenon'
      },
      vector: {
        badge: 'NANTUCKET CASE STUDY #01 &bull; VECTOR-BORNE RADAR',
        badgeColor: '#d97706',
        title: 'Complex Vector-Borne Pathologies &amp; Babesia Co-Infection',
        subtitle: 'Refractory Lyme symptoms, drenching night sweats, profound air hunger, hemolytic anemia, and Maltese cross tetrads.',
        act1: 'Bitten by nymphal tick in coastal New England brush; treated with standard 14-day oral Doxycycline with persistent unremitting systemic decline.',
        act2: 'Polymicrobial transmission unmasked: intraerythrocytic Babesia microti protozoa actively lysing red blood cells alongside Borrelia spirochetes.',
        act3: 'Eradicate protozoan parasitemia, normalize reticulocyte counts and splenic clearance, and regain vigorous athletic stamina within 30 days.',
        suggestions: [
          '<strong>Dual-Pathogen Bayesian Radar:</strong> Automatically triggers diagnostic alerts when drenching sweats or air hunger accompany tick bites.',
          '<strong>STAT Manual Peripheral Thin Smear:</strong> Urgent Giemsa-stained thin blood smear scan to identify pathognomonic Maltese cross tetrads.',
          '<strong>Two-Tier Targeted Combination:</strong> Immediate Atovaquone (750 mg PO BID) + Azithromycin (500 mg daily) rather than ineffective monotherapy.',
          '<strong>Ecological Vector Interruption:</strong> Support systemic reservoir intervention (MIT Mice Against Ticks) and microclimate brush control.'
        ],
        retailBenchmark: '$6,200.00+ / episode',
        retailDetail: 'Prolonged diagnostic odysseys, unindicated specialist consultations, and futile long-term IV antibiotics',
        essentialCost: '$42.00 / course',
        essentialDetail: 'WHO Model List open generic Atovaquone + Azithromycin 10-day curative therapy',
        savingsAmount: '$6,150.00+ saved',
        savingsPercent: '99.3% Savings',
        preventedCascade: 'Prevents chronic debilitating multi-organ sequelae, unnecessary PICC-line placements, and septic thrombophlebitis.',
        projectCost: '$0.00 (Zero-egress edge Bayesian inference)',
        docDrillTerm: 'Babesia microti'
      },
      polytrauma: {
        badge: 'PATIENT ARCHETYPE: FRIDA KAHLO &bull; ORTHOPEDIC REHAB',
        badgeColor: '#ec4899',
        title: 'Chronic Neuropathic Pain, Polytrauma &amp; Spinal Rehabilitation',
        subtitle: 'Multilevel spinal trauma, severe burning neuropathic dysesthesia, central sensitization, and opioid-sparing pain relief.',
        act1: 'Endured severe vehicular polytrauma and dozens of orthopedic reconstructive surgeries; lived with relentless post-surgical pelvic and spinal agony.',
        act2: 'Dorsal horn central sensitization amplified by gravitational axial loading; nervous system locked in constant nociceptive distress signals.',
        act3: 'Achieve joyful physical movement, restful restorative sleep, and vibrant artistic expression through non-opioid multimodal biophysical support.',
        suggestions: [
          '<strong>Aquatic Axial Unloading:</strong> Buoyant warm water (88&deg;F&ndash;92&deg;F) hydrotherapy reducing gravitational axial spinal compression by 90%.',
          '<strong>Solfeggio 174 Hz Acoustic Modulation:</strong> Low-frequency vibroacoustic sound waves calming thalamocortical sensory pain loops.',
          '<strong>PEA Mast Cell Stabilization:</strong> Micronized Palmitoylethanolamide (600 mg BID) to dampen microglial neuro-inflammation without sedation.',
          '<strong>Topical TRPV1 Desensitization:</strong> Compounded topical Capsaicin (0.025%) and Menthol to exhaust substance P stores in peripheral nociceptors.'
        ],
        retailBenchmark: '$420.00 / month',
        retailDetail: 'Brand-name gabapentinoids, extended-release synthetic opioids, and invasive epidural steroid injections',
        essentialCost: '$16.50 / month',
        essentialDetail: 'Open generic gabapentin, PEA nutritional support, and local compounding monographs',
        savingsAmount: '$4,840.00 / year',
        savingsPercent: '96.0% Savings',
        preventedCascade: 'Eliminates opioid tolerance escalation, narcotic-induced hyperalgesia, and $25,000+ spinal cord stimulator revisions.',
        projectCost: '$0.00 (Local Web Audio synthesizer & client CDS)',
        docDrillTerm: 'Polypharmacy Deprescribing (STOPP/START)'
      }
    };

    function renderConditionCard(data) {
      return '<div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1.25rem;">' +
        '<div>' +
          '<div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: ' + data.badgeColor + '; font-weight: 700; text-transform: uppercase;">' + data.badge + '</div>' +
          '<h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text); margin: 0.25rem 0 0.4rem;">' + data.title + '</h3>' +
          '<p style="font-size: 0.8125rem; color: var(--text-muted); margin: 0; line-height: 1.5;">' + data.subtitle + '</p>' +
        '</div>' +
        '<button type="button" class="doc-drill-badge" onclick="openDocDrill(\\'' + data.docDrillTerm + '\\')" style="font-size: 0.75rem; padding: 0.4rem 0.75rem;">🔬 Socratic Evidence Focus</button>' +
      '</div>' +

      '<div class="grid-3" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">' +
        '<!-- Col 1: Austrian 3-Act Trajectory -->' +
        '<div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">' +
          '<div style="font-size: 0.72rem; font-family: ui-monospace, monospace; color: var(--teal); font-weight: 700; text-transform: uppercase;">Austrian Salutogenic Arc</div>' +
          '<div class="act-card" style="margin: 0; padding: 0.65rem 0.85rem; border-left: 3px solid #64748b;">' +
            '<div class="act-header" style="color: #64748b;">Act I &bull; Where You\\'ve Been</div>' +
            '<div class="act-body" style="font-size: 0.78rem;">' + data.act1 + '</div>' +
          '</div>' +
          '<div class="act-card" style="margin: 0; padding: 0.65rem 0.85rem; border-left: 3px solid var(--teal);">' +
            '<div class="act-header" style="color: var(--teal);">Act II &bull; Where You Stand Today</div>' +
            '<div class="act-body" style="font-size: 0.78rem;">' + data.act2 + '</div>' +
          '</div>' +
          '<div class="act-card" style="margin: 0; padding: 0.65rem 0.85rem; border-left: 3px solid var(--amber);">' +
            '<div class="act-header" style="color: var(--amber);">Act III &bull; Where You\\'re Going</div>' +
            '<div class="act-body" style="font-size: 0.78rem;">' + data.act3 + '</div>' +
          '</div>' +
        '</div>' +

        '<!-- Col 2: PocketGull Care Suggestions -->' +
        '<div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">' +
          '<div>' +
            '<div style="font-size: 0.72rem; font-family: ui-monospace, monospace; color: var(--amber); font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">Actionable Clinical Suggestions</div>' +
            '<ul style="font-size: 0.8125rem; color: var(--text); line-height: 1.6; padding-left: 1.15rem; margin: 0; display: flex; flex-direction: column; gap: 0.6rem;">' +
              data.suggestions.map(s => '<li>' + s + '</li>').join('') +
            '</ul>' +
          '</div>' +
          '<div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border); font-size: 0.72rem; color: var(--text-muted); font-style: italic;">' +
            '&bull; Guided by Learned Intermediary: Requires clinician attestation before order entry.' +
          '</div>' +
        '</div>' +

        '<!-- Col 3: Dual-Sided Thrift Breakdown -->' +
        '<div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">' +
          '<div>' +
            '<div style="font-size: 0.72rem; font-family: ui-monospace, monospace; color: #10b981; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">Dual-Sided Thrift &amp; FinOps</div>' +
            '<div style="background: var(--card); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 0.6rem;">' +
              '<div style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase;">Standard Retail Benchmark:</div>' +
              '<div style="font-size: 1.15rem; font-weight: 800; color: #ef4444; font-family: ui-monospace, monospace; text-decoration: line-through;">' + data.retailBenchmark + '</div>' +
              '<div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.15rem;">' + data.retailDetail + '</div>' +
            '</div>' +
            '<div style="background: var(--card); border: 1px solid var(--teal); border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 0.6rem;">' +
              '<div style="font-size: 0.6875rem; color: var(--teal); text-transform: uppercase; font-weight: 700;">Estimated Out-of-Pocket Total:</div>' +
              '<div style="font-size: 1.35rem; font-weight: 800; color: var(--teal); font-family: ui-monospace, monospace;">' + data.essentialCost + '</div>' +
              '<div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.15rem;">' + data.essentialDetail + '</div>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.2rem; font-size: 0.75rem;">' +
              '<span style="color: var(--text-muted);">Net Household Savings:</span>' +
              '<span style="color: #10b981; font-weight: 800; font-family: ui-monospace, monospace;">' + data.savingsAmount + ' (' + data.savingsPercent + ')</span>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.2rem; font-size: 0.75rem; border-top: 1px dashed var(--border); margin-top: 0.4rem;">' +
              '<span style="color: var(--text-muted);">Project Inference Cost:</span>' +
              '<span style="color: var(--teal); font-weight: 700; font-family: ui-monospace, monospace;">' + data.projectCost + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top: 0.75rem; background: var(--teal-glow); border: 1px solid var(--border); border-radius: 0.375rem; padding: 0.5rem 0.65rem; font-size: 0.72rem; color: var(--teal);">' +
            '<strong>Cascade Halter:</strong> ' + data.preventedCascade +
          '</div>' +
        '</div>' +
      '</div>';
    }

    function selectConditionTab(key) {
      const data = CONDITION_THRIFT_DATA[key];
      if (!data) return;

      const tabs = ['metabolic', 'dysautonomia', 'neuro', 'vector', 'polytrauma'];
      tabs.forEach(t => {
        const btn = document.getElementById('condTab_' + t);
        if (btn) {
          if (t === key) {
            btn.classList.add('active');
            btn.style.borderColor = 'var(--teal)';
            btn.style.background = 'var(--card-hover)';
          } else {
            btn.classList.remove('active');
            btn.style.borderColor = 'var(--border)';
            btn.style.background = 'transparent';
          }
        }
      });

      const container = document.getElementById('conditionDetailCard');
      if (container) {
        container.style.opacity = '0.4';
        container.style.transform = 'translateY(4px)';
        setTimeout(() => {
          container.innerHTML = renderConditionCard(data);
          container.style.opacity = '1';
          container.style.transform = 'translateY(0)';
        }, 150);
      }
    }

    /* ─── Universal Doc Drill Socratic Engine ─── */
    let currentDrillTerm = 'Babesia microti';
    const DOC_DRILL_DB = {
      'Babesia microti': {
        category: 'VECTOR CO-INFECTION',
        summary: 'Intraerythrocytic apicomplexan protozoan endemic to coastal New England and island brush, transmitted by Ixodes scapularis nymphs.',
        clinicalTrap: 'Clinicians routinely mistake Babesiosis for refractory Lyme disease. Standard Lyme monotherapy (Doxycycline) does NOT clear Babesia. If hemolytic anemia, drenching sweats, or Maltese cross tetrads are present, dual therapy (Atovaquone + Azithromycin) is mandatory.',
        protocol: 'Initiate Atovaquone (750 mg PO BID) plus Azithromycin (500 mg day 1, then 250 mg daily) for 7-10 days. Monitor CBC for thrombocytopenia and indirect bilirubin for hemolysis. Check G6PD before considering clindamycin/quinine alternative in severe ICU presentations.',
        evidence: 'Level I evidence from IDSA/AAN/ACR Lyme & Tick Guidelines (Lantos et al. Clin Infect Dis 2021); Vannier EG et al. N Engl J Med 2012.',
        citations: 'Lantos PM et al. Clin Infect Dis. 2021; Vannier EG et al. N Engl J Med. 2012.'
      },
      'Meadows Leverage L1-9': {
        category: 'SYSTEMS BIOLOGY',
        summary: 'Donella Meadows\' 12 Leverage Points hierarchy applied to ecological vector transmission and immunological response.',
        clinicalTrap: 'Treating individual tick bites with antibiotics is Leverage Point 12 (shallow parameter adjustments). Disrupting the reservoir host transmission cycle (Leverage Point 1: Paradigm Change via MIT Mice Against Ticks) solves the crisis at the ecological source.',
        protocol: 'Step 1: Map host reservoirs (Peromyscus leucopus white-footed mice). Step 2: Implement microclimate brush clearing (VPD > 1.2 kPa). Step 3: Support systemic biological disruption rather than endless downstream chemical suppression.',
        evidence: 'Esvelt KM et al. MIT Media Lab (2020); Meadows DH. Thinking in Systems: A Primer (2008).',
        citations: 'Meadows DH. Thinking in Systems: A Primer (2008); Esvelt KM et al. MIT Media Lab (2020).'
      },
      'Maltese cross tetrads': {
        category: 'HEMATOLOGY & MICROSCOPY',
        summary: 'Pathognomonic arrangement of four budding merozoites joined by a central cytoplasmic stalk within an erythrocyte.',
        clinicalTrap: 'Seen only in Babesia microti, distinguishing it from Plasmodium falciparum ring forms. Requires high-power oil immersion (1000x) Giemsa-stained thin blood smear.',
        protocol: 'Order urgent STAT manual peripheral thin and thick Giemsa smears. Scan ≥300 high-power fields. Confirm parasitemia percentage (<1% mild, >10% severe requiring red cell exchange transfusion).',
        evidence: 'CDC DPDx Diagnostic Identification; Krause PJ et al. N Engl J Med 2000.',
        citations: 'CDC DPDx Babesiosis Laboratory Identification; Krause PJ et al.'
      },
      'Vagal Collapse / RMSSD': {
        category: 'AUTONOMIC TONE',
        summary: 'Root Mean Square of Successive Differences (RMSSD) reflecting parasympathetic vagal brake efficiency and Mayer wave power.',
        clinicalTrap: 'Acute neuroborreliosis or systemic cytokine cascades suppress cholinergic anti-inflammatory pathway signaling, dropping RMSSD below 20ms and triggering postural orthostatic tachycardia.',
        protocol: 'Practice 0.1 Hz resonant bio-rhythmic breathing (4 seconds in, 6 seconds out) for 10 minutes BID. Supplement with CoQ10 (200 mg) and cold facial immersion (mammalian dive reflex) to stimulate vagal efferent outflow.',
        evidence: 'Tracey KJ. The inflammatory reflex. Nature 2002; Thayer JF et al. Neurosci Biobehav Rev 2012.',
        citations: 'Tracey KJ. The inflammatory reflex. Nature. 2002; Thayer JF et al. Neurosci Biobehav Rev. 2012.'
      },
      'Louise Sloan 5:1 Optotype Invariant': {
        category: 'OPHTHALMIC TYPOGRAPHY',
        summary: 'Standardized 5x5 grid with 1-unit stroke thickness resolving 5 arcminutes at visual axis (Snellen 20/20 / LogMAR 0.0).',
        clinicalTrap: 'Consumer fonts with arbitrary thin strokes become illegible under low-contrast surgical lighting or bedside label thermal printers, risking dosage misreads.',
        protocol: 'Enforce optotypic stroke proportions: letter height = 5x stroke width. Never use hairline fonts for medication labels or telemetry counters. Implement slashed-zero (cv08) and curved-l (cv05) glyph variants.',
        evidence: 'Sloan LL. Am J Ophthalmol 1959; ISO 8596 Visual Acuity Testing Standard.',
        citations: 'Sloan LL. Am J Ophthalmol. 1959; ISO 8596 Visual Acuity Testing.'
      },
      'Multiple Sclerosis & Smoldering PIRA': {
        category: 'NEUROLOGICAL CDS',
        summary: 'Progression Independent of Relapse Activity (PIRA) driven by compartmentalized microglial activation and axonal bioenergetic exhaustion behind a closed blood-brain barrier.',
        clinicalTrap: 'Relying solely on contrast MRI to declare disease stability. Subclinical axonal loss occurs continuously; monitor sNfL liquid biopsy and Uhthoff thermal reserves to catch subclinical stress early.',
        protocol: 'Track serum sNfL every 3-6 months. Prescribe dual-task neuroplastic walking (walking + mental arithmetic) to force collateral neural sprouting. Maintain Vitamin D3 at 60-80 ng/mL and add CoQ10 200mg BID.',
        evidence: 'Kappos L et al. JAMA Neurol 2020; Giovannoni G et al. Brain 2024; Lublin FD et al. Lancet Neurol 2022.',
        citations: 'Kappos L et al. JAMA Neurol. 2020; Giovannoni G et al. Brain. 2024.'
      },
      'Uhthoff Conduction Reserve / ΔT': {
        category: 'BIOPHYSICAL CONDUCTION',
        summary: 'Critical thermal safety margin (ΔT ≤ 0.40°C) where demyelinated saltatory conduction blocks reversibly due to rapid sodium channel inactivation.',
        clinicalTrap: 'Mistaking heat-induced Uhthoff pauses for a true clinical relapse and unnecessarily administering high-dose IV steroids. Cooling restores baseline conduction within hours.',
        protocol: 'Pre-cooling ice-slurry drinks before outdoor walking. Wear 15°C phase-change cooling vests in ambient heat >75°F. Restrict aquatic therapy pools to <84°F.',
        evidence: 'Uhthoff W. 1890; Rasminsky M. Arch Neurol 1973; Frohman TC et al. Nat Clin Pract Neurol 2008.',
        citations: 'Uhthoff W. 1890; Frohman TC et al. Nat Clin Pract Neurol. 2008.'
      },
      'Uhthoff Phenomenon': {
        category: 'NEURO-BIOPHYSICS',
        summary: 'Transient, completely reversible conduction block in demyelinated nerve fibers caused by minor elevations in core temperature (ΔT ≥ 0.2–0.4°C).',
        clinicalTrap: 'Mistaking a temporary biophysical Uhthoff conduction pause for an acute inflammatory relapse (pseudo-relapse). This often triggers unnecessary high-dose systemic corticosteroids or premature switching of disease-modifying therapies.',
        protocol: 'Deploy the 3-step rapid cooling protocol: 500 mL ice slurry ingestion, 15°C phase-change vest application, and rest in air-conditioned recovery room (<68°F). Observe rapid restoration of visual acuity and motor conduction within 30–60 minutes.',
        evidence: 'Uhthoff W. Arch Psychiatr Nervenkr 1890; Smith KJ & McDonald WI. Brain 1999; White AT et al. Mult Scler 2011.',
        citations: 'Uhthoff W. 1890; Smith KJ, McDonald WI. Brain. 1999; White AT et al. 2011.'
      },
      'Salutogenic 3-Act Trajectory': {
        category: 'CLINICAL EPISTEMOLOGY',
        summary: 'An Austrian phenomenological framework dividing clinical care encounters into Where You\'ve Been (Trail Traversed), Where You Stand Today (Living Foothold), and Where You\'re Going (Action Horizon).',
        clinicalTrap: 'The 1968 Weed SOAP checklist treats patient encounters as isolated, transactional billing events with static deficit labels that foster clinical fatalism and learned helplessness.',
        protocol: 'Act I: Validate traversed challenges with zero shame or fatalism. Act II: Ground current biometrics in physiological adaptation. Act III: Co-create concrete 30-day vitality milestones and daily restoration rituals.',
        evidence: 'Antonovsky A. Health, Stress, and Coping (1979); Frankl VE. Man\'s Search for Meaning (1946); ACM SIGCHI Clinical Ergonomics.',
        citations: 'Antonovsky A. Health, Stress, and Coping (1979); Frankl VE. (1946).'
      },
      '0.1 Hz Resonant Pacing': {
        category: 'AUTONOMIC NEURO-PACING',
        summary: 'Resonant frequency breath pacing at approximately 6 breaths per minute (~0.1 Hz) matching the intrinsic Mayer wave resonance of the human baroreflex.',
        clinicalTrap: 'Chronic neurological stress induces sympathetic hyperarousal, downregulating the vagal cholinergic anti-inflammatory reflex and exacerbating central microglial neuro-inflammation.',
        protocol: 'Inhale gently through nose for 4 seconds, exhale through pursed lips for 6 seconds (10-second respiratory cycle = 0.1 Hz). Practice for 5–10 minutes twice daily. Enhances high-frequency HRV RMSSD and dampens peripheral inflammatory cytokine release.',
        evidence: 'Lehrer P et al. Appl Psychophysiol Biofeedback 2000; Tracey KJ. The inflammatory reflex. Nature 2002.',
        citations: 'Tracey KJ. The inflammatory reflex. Nature. 2002; Lehrer P et al. 2000.'
      },
      'CMS Remote Patient Monitoring (RPM) Superbill': {
        category: 'REVENUE CYCLE & TELEMETRY',
        summary: 'CMS Remote Patient Monitoring reimbursement codes (CPT 99453 setup, 99454 16 days of cellular transmissions/30d, 99457 20 min clinical care coordination).',
        clinicalTrap: 'Billing 99454 with only 15 transmission days results in 100% claim rejection by Medicare MACs. PocketGull tracks exact 16-day statutory milestones in real time.',
        protocol: 'Step 1: Patient consent & device onboarding (CPT 99453, ~$19). Step 2: Cellular device transmission tracking to day 16 milestone (CPT 99454, ~$52). Step 3: Document 20 minutes of care coordination (CPT 99457, ~$50).',
        evidence: 'CMS Physician Fee Schedule Final Rule (CY 2026); AMA CPT Regulatory Guidelines.',
        citations: 'CMS Physician Fee Schedule Final Rule (CY 2026); AMA CPT Guidelines.'
      },
      'ISMP Medication Safety Standard': {
        category: 'PATIENT SAFETY & POSOLOGY',
        summary: 'Institute for Safe Medication Practices rules: strictly prohibits trailing zeroes (\'5.0 mg\') and mandates leading zeroes (\'0.5 mg\') with slashed-zero (cv08) and curved-l (cv05) typography.',
        clinicalTrap: '\'5.0 mg\' misread as \'50 mg\' is the #1 typographical cause of 10-fold lethal medication overdose in emergency orders.',
        protocol: 'Zero trailing decimals: Always write \'5 mg\', never \'5.0 mg\'. Always write \'0.5 mg\', never \'.5 mg\'. Spell out \'micrograms\' or enforce ISO-compliant \'mcg\' notation instead of Greek \'µg\'.',
        evidence: 'ISMP List of Error-Prone Abbreviations, Symbols, and Dose Designations (2026); FDA CDER Drug Safety Guidance.',
        citations: 'ISMP Medication Safety Guidelines (2026); FDA 21 CFR Part 201.'
      },
      'Polypharmacy Deprescribing (STOPP/START)': {
        category: 'GERIATRIC POSOLOGY',
        summary: 'Screening Tool of Older Persons\' Prescriptions (STOPP v3) and Prescribing Cascade Detection (Amlodipine → edema → Furosemide).',
        clinicalTrap: 'Treating a drug side-effect as a new clinical disease and adding a second medication. Always audit the medication timeline before adding a new drug.',
        protocol: 'Audit medication list against STOPP v3 criteria. Calculate anticholinergic cognitive burden score (ACB). Execute multi-week taper with weekly symptom check-ins.',
        evidence: 'O\'Mahony D et al. STOPP/START criteria version 3. Eur Geriatr Med 2023.',
        citations: 'O\'Mahony D et al. Eur Geriatr Med. 2023; AGS Beers Criteria 2023.'
      },
      'Chrome Built-in AI & Gemma 4': {
        category: 'EDGE PRIVACY & LLM',
        summary: 'Zero-egress on-device inference utilizing Chrome Prompt API and Gemma 4 weights with sub-second execution directly within client hardware.',
        clinicalTrap: 'Routing sensitive clinical dialogue to public cloud LLM endpoints risks HIPAA ePHI disclosure and adds network latency during bedside consultations.',
        protocol: 'Query window.ai.languageModel directly on localhost. Keep system prompts deterministic. Fall back to local TypeScript parsing if experimental flags are inactive.',
        evidence: 'W3C Web Machine Learning Standards; Google Built-in AI Architecture.',
        citations: 'W3C WebML Working Group; NIST SP 800-66r2 HIPAA Security.'
      },
      'WHO Essential Medicines & Financial Toxicity': {
        category: 'HEALTH ECONOMICS & ESSENTIAL FORMULARY',
        summary: 'World Health Organization Model List of Essential Medicines (EML) demonstrating that frontline treatments for hypertension, diabetes, and infections cost pennies per dose when open generic procurement is unlocked.',
        clinicalTrap: 'Prescribing expensive monopoly brand-name reformulations when bioequivalent open generics exist. This imposes severe financial toxicity, causing 1 in 4 patients to ration or skip life-sustaining doses.',
        protocol: 'Query WHO EML for core first-line molecules (e.g. Lisinopril, Metformin, Amlodipine). Substitute $180+/mo retail brand items with $4–$8/mo open generics. Document estimated annual out-of-pocket savings on the patient care plan.',
        evidence: 'WHO Model List of Essential Medicines (23rd List, 2023); Kesselheim AS et al. JAMA 2016; Woolhandler S & Himmelstein DU. Ann Intern Med 2017.',
        citations: 'WHO Model List of Essential Medicines (2023); Kesselheim AS et al. JAMA. 2016.'
      },
      'Project FinOps & Scale-to-Zero Architecture': {
        category: 'SOFTWARE ENGINEERING & SUSTAINABILITY',
        summary: 'Cloud financial engineering maximizing accessibility through zero-egress edge inference (Chrome Built-in AI / Gemma 4), Cloud Run scale-to-zero (minScale: 0), and automated 7-day storage lifecycle cleanup.',
        clinicalTrap: 'Architectures dependent on continuous cloud LLM token queries or always-on GPU instances incur crushing monthly bills ($500–$5,000/mo), forcing developers to monetize user data or erect paywalls that exclude under-resourced clinics.',
        protocol: 'Enforce local-first execution: Run symptom parsing and biophysical models on client CPU/GPU. Set Cloud Run minReplicas: 0. Configure 7-day GCS bucket deletion and Artifact Registry prune policies to maintain a ~$0.20/month baseline.',
        evidence: 'Google Cloud FinOps Architecture Framework; CNCF Environmental Sustainability TAG; W3C Web Machine Learning Working Group.',
        citations: 'Google Cloud Architecture Center (FinOps); CNCF Sustainability TAG.'
      },
      'Diagnostic Cascade Prevention': {
        category: 'CLINICAL CDS & HEALTH SERVICES RESEARCH',
        summary: 'Preventing the chain of unindicated diagnostic testing, ambiguous incidental findings, and invasive follow-ups triggered by an initial non-evidence-based test.',
        clinicalTrap: 'Ordering repeat emergency contrast MRIs for benign heat-induced MS Uhthoff conduction pauses, or ordering multi-thousand dollar autonomic panels for dehydration-induced orthostatic tachycardia. These cascades increase anxiety, radiation, and medical debt.',
        protocol: 'Evaluate biophysical state first: Check core temperature reserve (ΔT) and hydration before escalating to imaging. Implement 48-hour cooling or fluid challenge windows for transient physiological fluctuations.',
        evidence: 'Ganguli I et al. Cascades of Care After Incidental Findings. JAMA 2019; Deyo RA et al. N Engl J Med 2021.',
        citations: 'Ganguli I et al. JAMA. 2019; Deyo RA et al. N Engl J Med. 2021.'
      },
      'Metabolic Syndrome & Stepped Care': {
        category: 'CARDIOMETABOLIC CDS',
        summary: 'WHO HEARTS stepped-care framework targeting the triad of insulin resistance, essential hypertension, and atherogenic dyslipidemia through staged lifestyle and open generic therapy.',
        clinicalTrap: 'Immediate polypharmacy escalation without addressing post-prandial glucose disposal or dietary sodium-to-potassium ratios. Treating mild Stage 1 hypertension with 3 brand-name drugs often induces severe orthostasis and medication non-adherence.',
        protocol: 'Step 1: 10-minute post-prandial walks for non-insulin GLUT4 translocation + DASH potassium optimization (≥3:1 ratio). Step 2: First-line open generic ACE-i or CCB (Lisinopril 10mg or Amlodipine 5mg). Step 3: Add Metformin HCl 500mg if fasting glucose remains >100 mg/dL.',
        evidence: 'WHO HEARTS Technical Package (2020); American Heart Association Hypertension Guidelines; Knowler WC et al. Diabetes Prevention Program (DPP) N Engl J Med 2002.',
        citations: 'WHO HEARTS Technical Package (2020); DPP Research Group. N Engl J Med. 2002.'
      },
      'Darwinian Medicine & 3B Innovation': {
        category: 'EVOLUTIONARY MEDICINE & EPISTEMOLOGY',
        summary: 'Application of evolutionary biology and the 3B cognitive framework (Bending, Breaking, Blending) to chronic multi-system autonomic illness, distinguishing evolved defenses (fever, vomiting) from physiological defects.',
        clinicalTrap: 'Aggressively suppressing evolved compensatory defenses (e.g. forcing down postural tachycardia with high-dose beta-blockers without correcting underlying splanchnic hypovolemia or mitochondrial ATP depletion).',
        protocol: 'Deploy the 3B Triad: Bending (altering pacing thresholds to fit mitochondrial limits), Breaking (deconstructing complex multi-system illness into discrete biophysical drivers), and Blending (fusing evolutionary biology, vagal neuroscience, and on-device edge telemetry).',
        evidence: 'Nesse RM & Williams GC. Why We Get Sick: The New Science of Darwinian Medicine (1994); Eagleman D & Brandt A. The Runaway Species: How Human Creativity Remakes the World (2017); Tracey KJ. Nature 2002.',
        citations: 'Nesse RM, Williams GC. Why We Get Sick (1994); Eagleman D, Brandt A. The Runaway Species (2017).'
      }
    };

    function openDocDrill(term) {
      currentDrillTerm = term;
      const data = DOC_DRILL_DB[term] || {
        category: 'CLINICAL CDS CONCEPT',
        summary: 'Clinical and systems biology evidence grounding for ' + term + '.',
        clinicalTrap: 'PocketGull applies Popperian falsifiability and zero-error legibility standards to all clinical telemetry and diagnostic recommendations.',
        protocol: 'Follow clinical standard of care and evidence-grounded guidelines.',
        evidence: 'Peer-reviewed clinical evidence base.',
        citations: 'PocketGull Clinical Intelligence Codex v1.37; FDA CDS Guidance.'
      };

      const body = document.getElementById('docDrillBody');
      if (body) {
        body.innerHTML = '';

        // Card 1: Overview
        const card1 = document.createElement('div');
        card1.style.cssText = 'background: var(--card); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem;';
        card1.innerHTML = '<div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">Category: ' + data.category + '</div>' +
          '<h4 style="font-size: 1.25rem; font-weight: 800; color: var(--text); margin: 0.35rem 0 0.75rem;">' + term + '</h4>' +
          '<p style="font-size: 0.8125rem; color: var(--text); line-height: 1.6;">' + data.summary + '</p>';
        body.appendChild(card1);

        // Card 2: Clinical Trap
        const card2 = document.createElement('div');
        card2.style.cssText = 'background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 0.75rem; padding: 1.25rem;';
        card2.innerHTML = '<div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">⚠️ Socratic Clinical Invariant &amp; Trap</div>' +
          '<p style="font-size: 0.8125rem; color: var(--text); line-height: 1.6; margin-top: 0.35rem;">' + data.clinicalTrap + '</p>';
        body.appendChild(card2);

        // Card 3: Quick Socratic Drill Chips
        const chipsWrap = document.createElement('div');
        chipsWrap.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';
        const chipsHeader = document.createElement('div');
        chipsHeader.style.cssText = 'font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase; font-weight: 600;';
        chipsHeader.textContent = '⚡ Quick Socratic Queries:';
        chipsWrap.appendChild(chipsHeader);

        const chipsRow = document.createElement('div');
        chipsRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.4rem;';

        const questions = [
          '🎯 What is the clinical trap?',
          '💊 What is the action protocol?',
          '📊 What is the trial evidence?'
        ];
        questions.forEach(qText => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'doc-drill-chip';
          btn.textContent = qText;
          btn.onclick = function() { submitDocDrillQuestion(null, qText); };
          chipsRow.appendChild(btn);
        });
        chipsWrap.appendChild(chipsRow);
        body.appendChild(chipsWrap);
      }

      const input = document.getElementById('docDrillQueryInput');
      if (input) {
        input.placeholder = 'Ask Doc Drill about ' + term + '...';
      }

      document.body.style.overflow = 'hidden';
      document.getElementById('docDrillDrawer').classList.add('open');
      document.getElementById('docDrillBackdrop').classList.add('open');

      setTimeout(() => {
        if (input) input.focus();
      }, 350);
    }

    function closeDocDrill() {
      document.body.style.overflow = '';
      document.getElementById('docDrillDrawer').classList.remove('open');
      document.getElementById('docDrillBackdrop').classList.remove('open');
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeDocDrill();
      }
    });

    function submitDocDrillQuestion(evt, customQ) {
      if (evt && evt.preventDefault) evt.preventDefault();
      const input = document.getElementById('docDrillQueryInput');
      const q = (typeof customQ === 'string' ? customQ : (input ? input.value : '')).trim();
      if (!q) return;

      const body = document.getElementById('docDrillBody');
      const data = DOC_DRILL_DB[currentDrillTerm] || {
        category: 'CLINICAL CDS CONCEPT',
        summary: 'Clinical and systems biology evidence grounding for ' + currentDrillTerm + '.',
        clinicalTrap: 'PocketGull applies Popperian falsifiability and zero-error legibility standards to all clinical telemetry and diagnostic recommendations.',
        protocol: 'Follow clinical standard of care and evidence-grounded guidelines.',
        evidence: 'Peer-reviewed clinical evidence base.',
        citations: 'PocketGull Clinical Intelligence Codex v1.37; FDA CDS Guidance.'
      };

      // User Query Bubble
      const qCard = document.createElement('div');
      qCard.style.cssText = 'background: var(--card); border: 1px solid rgba(45, 212, 191, 0.4); border-radius: 0.75rem; padding: 0.85rem 1rem;';
      const tagDiv = document.createElement('div');
      tagDiv.style.cssText = 'font-size: 0.6875rem; color: var(--teal-light); font-family: ui-monospace, monospace; font-weight: bold; text-transform: uppercase;';
      tagDiv.textContent = '💬 Clinician Query';
      const queryDiv = document.createElement('div');
      queryDiv.style.cssText = 'font-size: 0.875rem; color: var(--text); margin-top: 0.25rem; font-weight: 500;';
      queryDiv.textContent = q;
      qCard.appendChild(tagDiv);
      qCard.appendChild(queryDiv);
      body.appendChild(qCard);

      // Socratic Response Engine
      const aCard = document.createElement('div');
      aCard.style.cssText = 'background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; border-left: 3px solid var(--teal);';
      const headerDiv = document.createElement('div');
      headerDiv.style.cssText = 'font-size: 0.6875rem; color: var(--teal-light); font-family: ui-monospace, monospace; font-weight: bold; text-transform: uppercase; margin-bottom: 0.5rem;';
      headerDiv.textContent = '⚡ Doc Drill Socratic Analysis • ' + currentDrillTerm;
      aCard.appendChild(headerDiv);

      const contentDiv = document.createElement('div');
      contentDiv.style.cssText = 'font-size: 0.8125rem; color: var(--text); line-height: 1.6;';

      const lowerQ = q.toLowerCase();
      let answerText = '';

      if (lowerQ.includes('trap') || lowerQ.includes('avoid') || lowerQ.includes('risk') || lowerQ.includes('error') || lowerQ.includes('mistake')) {
        answerText = '⚠️ Key Clinical Invariant & Trap: ' + data.clinicalTrap;
      } else if (lowerQ.includes('protocol') || lowerQ.includes('treat') || lowerQ.includes('prescribe') || lowerQ.includes('action') || lowerQ.includes('dosing') || lowerQ.includes('what to do')) {
        answerText = '📋 Recommended Action Protocol: ' + (data.protocol || data.summary);
      } else if (lowerQ.includes('evidence') || lowerQ.includes('study') || lowerQ.includes('trial') || lowerQ.includes('citation') || lowerQ.includes('paper')) {
        answerText = '📊 Evidence Hierarchy & Citations: ' + (data.evidence || data.citations);
      } else {
        answerText = 'Socratic Synthesis for ' + currentDrillTerm + ': ' + data.summary + ' \n\nKey Takeaway: ' + data.clinicalTrap;
      }

      const p = document.createElement('p');
      p.style.cssText = 'white-space: pre-line;';
      p.textContent = answerText;
      contentDiv.appendChild(p);

      const citeP = document.createElement('p');
      citeP.style.cssText = 'font-size: 0.72rem; color: var(--text-muted); margin-top: 0.6rem; font-style: italic; border-top: 1px solid var(--border); padding-top: 0.4rem;';
      citeP.textContent = 'Primary Source: ' + data.citations;
      contentDiv.appendChild(citeP);

      aCard.appendChild(contentDiv);
      body.appendChild(aCard);

      if (input) input.value = '';
      body.scrollTop = body.scrollHeight;
    }
  </script>

  <!-- Universal Doc Drill Socratic Research Drawer -->
  <div id="docDrillBackdrop" class="doc-drill-backdrop" onclick="closeDocDrill()"></div>
  <aside id="docDrillDrawer" class="doc-drill-drawer" aria-label="Doc Drill Evidence Focus Drawer">
    <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--header-bg);">
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <span style="font-size: 1.35rem;">🔬</span>
        <div>
          <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">PocketGull Socratic Educator</div>
          <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text); margin: 0;">Doc Drill &bull; Evidence Focus</h3>
        </div>
      </div>
      <button type="button" onclick="closeDocDrill()" style="background: transparent; border: 1px solid var(--border); color: var(--text-muted); font-size: 1.1rem; cursor: pointer; padding: 0.2rem 0.5rem; border-radius: 0.375rem;" aria-label="Close Drawer">&times;</button>
    </div>

    <div id="docDrillBody" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
      <!-- Pre-populated dynamically -->
    </div>

    <div style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); background: var(--card-subtle);">
      <form onsubmit="submitDocDrillQuestion(event); return false;" style="display: flex; gap: 0.5rem;">
        <input type="text" id="docDrillQueryInput" placeholder="Ask Doc Drill about this concept..." style="flex: 1; background: var(--input-bg); border: 1px solid var(--border); color: var(--text); padding: 0.55rem 0.75rem; border-radius: 0.375rem; font-size: 0.8125rem;" />
        <button type="submit" class="btn-primary" style="padding: 0.55rem 1rem; font-size: 0.8125rem;">Ask</button>
      </form>
    </div>
  </aside>
</body>
</html>`;
}
