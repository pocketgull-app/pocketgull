# `design.philgear.dev` — Zero-Cost Architecture & Google SWE Book Deployment Playbook

This playbook documents the architecture, cost-minimization strategy, and production deployment configuration for **`design.philgear.dev`** (AI Branding Package Generator & BrandDesk Design System), adhering strictly to the **Software Engineering at Google (SWE Book / Abseil)** best practices.

---

## 1. Executive Summary & Cost Model

| Dimension | Legacy / Unoptimized Approach | PocketGull Zero-Cost SWE Architecture |
| :--- | :--- | :--- |
| **Compute / Hosting** | Always-on Node.js VM ($25–$60/mo) | **Firebase Hosting / Cloudflare Pages ($0.00/mo)** |
| **Gemini AI Tokens** | Unstructured chat completions (~$0.02 / run) | **Gemini 2.5 Flash + Strict `responseSchema` ($0.0001 / run)** |
| **Duplicate Requests** | Re-run AI prompt on every tweak | **Client-side SHA-256 Cache in `IndexedDB` ($0.00)** |
| **Color & SVG Math** | Multi-roundtrip LLM prompt engineering | **Client-side Web Worker / Deterministic Engine ($0.00)** |
| **Dependency Model** | Unpinned runtime ESM CDNs (`esm.sh`) | **Hermetic `package-lock.json` with Subresource Integrity** |
| **Total Monthly Cost** | **$30.00 – $100.00/mo** | **~$0.00/mo (Free Tier)** |

---

## 2. Google SWE Book Principles in Practice

### A. Time & Change (Chapters 1–2)
- **Hermetic Build Isolation**: All build dependencies (`@angular/core`, `tailwindcss`, `@google/genai`) are locked in `package.json` with strict semantic versions and compiled via `ng build`. No runtime unpinned CDN imports (`esm.sh/@angular/...^21.1.4`) that could introduce breaking changes or CDN outages.
- **Node.js 24 LTS Lock**: Enforced across development environments and automated pipelines.

### B. Scale & Efficiency (Chapters 3–4)
- **Zero-Waste Token Economics**: Structured JSON schema output (`responseMimeType: "application/json"`) eliminates conversational pleasantries and markdown wrapping, slashing billed token counts by 60–80%.
- **Deterministic Edge Fallback**: If offline or if API limits are reached, the local mathematical engine computes WCAG 2.2 AAA relative luminance, assigns the 5 Origami Mascots, and renders vector SVGs with zero API consumption.

### C. Testing & Hermeticity (Chapters 11–14)
- **Sub-Second Test Suites**: All services and components have 100% hermetic unit tests (`vitest`) running against deterministic stubs without triggering external network traffic.

---

## 3. Production Deployment Step-by-Step

### Step 1: Hermetic Production Build
```powershell
# From the project root
npm run build
```
This compiles the optimized production artifacts into `dist/`.

### Step 2: Zero-Cost Static Edge Deployment

#### Option A: Firebase Hosting (Recommended for GCP Ecosystem)
1. Initialize Firebase Hosting in project:
```bash
firebase init hosting
```
2. Configure `firebase.json`:
```json
{
  "hosting": {
    "public": "dist/pocketgull/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(woff2|svg|png|jpg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```
3. Deploy to production:
```bash
firebase deploy --only hosting
```

#### Option B: Cloudflare Pages
1. Connect GitHub repository `pocketgull-app/pocketgull`.
2. Build command: `npm run build`
3. Output directory: `dist/pocketgull/browser`

---

## 4. Custom Domain DNS Configuration (`design.philgear.dev`)

Configure your DNS records in your domain registrar (e.g. Google Domains / Cloudflare / Namecheap):

| Type | Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `design` | `<project-id>.web.app.` (Firebase) or `<custom>.pages.dev.` | `Auto` / `300` |
| **TXT** | `_acme-challenge.design` | *Supplied by hosting provider for SSL verification* | `Auto` |

SSL certificates are automatically provisioned and renewed via Let's Encrypt at no cost.

---

## 5. WebMCP Tool Agentic Integration

The branding engine is exposed to AI models and autonomous browser agents via **WebMCP Tool #78**:

```typescript
// Registered in WebMcpRegistrationService
await modelContext.callTool('generate_ai_branding_package', {
  brandName: 'PocketGull Sanctuary',
  industry: 'Pediatric Art Therapy & Clinical Design',
  archetype: 'The Scholar',
  primaryColorHex: '#7E22CE'
});
```

Returns:
- Full `IBrandPackage` data bundle
- WCAG 2.2 AAA contrast verification matrix
- Pure SVG vector logotypes and icons
- Production CSS Custom Properties (`--brand-color-primary`, `--font-display`, etc.)
