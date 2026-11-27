import { Page } from '@playwright/test';

/**
 * Polls the backend until it is fully responsive to prevent E2E race conditions on CI.
 */
async function waitForBackendToBeReady() {
  const baseUrl = process.env['BASE_URL'] || 'http://127.0.0.1:4000';
  const url = `${baseUrl}/api/config`;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (e) {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.warn('⚠️ E2E Setup: Backend API did not become ready in time.');
}

/**
 * Common setup for E2E tests.
 * Mocks out hardware telemetry, config, and prevents Service Worker registration.
 */
export async function setupE2ePage(page: Page, options: { mockClinician?: boolean, mockAI?: boolean } = { mockClinician: true, mockAI: true }) {
  // Wait for the local Express server backend to finish booting and seeding
  await waitForBackendToBeReady();

  page.on('console', async msg => {
    const parts = [];
    for (const arg of msg.args()) {
      try {
        const val = await arg.jsonValue();
        if (val && typeof val === 'object') {
          if (val.message || val.stack) {
            parts.push(`${val.name || 'Error'}: ${val.message}\n${val.stack || ''}`);
          } else {
            parts.push(JSON.stringify(val));
          }
        } else {
          parts.push(val);
        }
      } catch (e) {
        parts.push(arg.toString());
      }
    }
    console.log(`PAGE LOG [${msg.type()}]:`, parts.join(' '));
  });

  page.on('pageerror', err => {
    console.error('PAGE ERROR EXCEPTION:', err.stack || err.message);
  });

  page.on('requestfailed', request => {
    console.error(`REQUEST FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText || 'unknown error'}`);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.error(`HTTP ERROR: ${response.request().method()} ${response.url()} status ${response.status()}`);
    }
  });

  // Intercept Firebase Data Connect emulator & cloud requests to prevent 404 / connection errors
  await page.route(/(9399\/v1|firebasedataconnect\.googleapis\.com)/, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} })
    });
  });

  // Intercept config endpoint to return empty API key so splash screen shows Demo Mode
  await page.route('**/api/config', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ apiKey: 'MOCK_E2E_KEY' })
    });
  });

  // Intercept hardware telemetry to prevent 500 error warnings
  await page.route('**/api/hardware/telemetry', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        gpus: [],
        cpuName: 'Mock CPU',
        cpuLoadPercent: 12,
        systemMemoryUsedGb: 4.5,
        systemMemoryTotalGb: 16.0
      })
    });
  });

  // Intercept current patient loci endpoint to avoid 503 sidecar errors
  await page.route('**/api/loci/current_patient', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  // Intercept Python sidecar endpoints to prevent network timeout warnings during E2E tests
  await page.route('**/api/python/**', async route => {
    const url = route.request().url();
    if (url.includes('/health')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', latency_ms: 5 })
      });
      return;
    }
    if (url.includes('/risk-score')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          risk_score: 0.15,
          score: 0.15,
          confidence: 0.95,
          risk_level: 'low',
          contributing_factors: ['Normal baseline vitals'],
          risk_factors: ['Normal baseline vitals'],
          note: 'Routine monitoring',
          recommendations: ['Routine monitoring']
        })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok', success: true })
    });
  });

  // Intercept POST /api/patients bulk sync to ensure fast, deterministic E2E test execution across all browser engines
  await page.route('**/api/patients', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    } else {
      await route.continue();
    }
  });

  // Intercept Lemonade local inference daemon (port 13305) to avoid ERR_CONNECTION_REFUSED in headless test runs
  await page.route(/http:\/\/(localhost|127\.0\.0\.1):13305\/.*/, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        object: 'list',
        data: [
          { id: 'gemma-4-local', object: 'model', created: 1710000000, owned_by: 'pocketgull' }
        ]
      })
    });
  });

  // Intercept Google Identity Toolkit project config to prevent invalid test API key 400 warnings
  await page.route(/https:\/\/www\.googleapis\.com\/identitytoolkit\/.*/, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        projectId: 'gen-lang-client-0540208645',
        authorizedDomains: ['localhost', '127.0.0.1']
      })
    });
  });

  if (options.mockAI) {
    // Intercept AI Metrics endpoint
    await page.route('**/*api/ai/metrics*', async route => {
      console.log('E2E MOCK: Intercepted POST /api/ai/metrics');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ complexity: 5, stability: 5, certainty: 5 })
      });
    });

    // Intercept AI Stream endpoint to return standard test keywords for all lens verification
      await page.route('**/*api/ai/stream*', async route => {
        console.log('E2E MOCK: Intercepted POST /api/ai/stream. Bridging to local Lemonade daemon on port 13305...');
        const req = route.request();
        let reqBody: any = {};
        try {
          reqBody = JSON.parse(req.postData() || '{}');
        } catch (e) {}
        
        const mockFallbackMarkdown = `# Summary Overview\nPatient presents with complex multi-systemic requirements. Mock evaluation complete.\n\n# Functional Protocols\nImplement leaky gut barrier repair, microbiome diversity expansion, and micronutrient optimization.\n\n# Traditional Chinese Medicine\nLiver Qi Stagnation resolving into Wood-Earth dyscrasia. Suggest Xiao Yao San modification.\n\n# Ayurvedic Medicine\nVata-Pitta derangement in the Annavaha Srotas. Recommend cooling Pitta-pacifying diet with Triphala.\n\n# Osteopathic & Biomechanical\nTART changes observed at T4-T8 (sympathetic chain). OMT indicated for myofascial release.\n\n# Environmental Exposomics\nHigh urban PM2.5 exposure detected. Suggest HEPA filtration and heavy metal detoxification support.\n\n# Chronobiology & Glymphatic\nCircadian misalignment. Prescribe morning 10,000 lux phototherapy and strict 10PM sleep hygiene.\n\n# Skeptical Epistemology\nCochrane Risk of Bias suggests low certainty for immediate rapid intervention. Watchful waiting advised.\n\n# Global Health & SDOH\nPRAPARE assessment indicates mild food insecurity. Refer to local community agricultural programs.\n\n# Teledentistry & Systemic Health\nSIBI cross-talk risk identified. Recommend periodontal deep scaling to reduce systemic inflammatory burden.`;

        let localText = "";
        try {
          const res = await fetch('http://127.0.0.1:13305/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'Llama-3.2-3B-Instruct-GGUF',
              messages: [
                { role: 'system', content: reqBody.systemInstruction || 'You are an AI.' },
                { role: 'user', content: reqBody.patientData || reqBody.prompt || 'Generate report.' }
              ],
              temperature: 0.7
            })
          });
          const json = await res.json();
          localText = json.choices?.[0]?.message?.content || mockFallbackMarkdown;
        } catch (e) {
          console.log('E2E MOCK: Lemonade daemon not running or failed. Falling back to mockMarkdown.');
          localText = mockFallbackMarkdown;
        }
        
        // Wrap the generated text in the heading for the requested lens so the parser finds it!
        const lensHeading = reqBody.lens ? `# ${reqBody.lens}\n` : "";
        const finalContent = lensHeading + localText;
        
        const chunk = {
          candidates: [{
            content: {
              parts: [{
                text: finalContent
              }]
            }
          }]
        };
        
        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: `data: ${JSON.stringify(chunk)}\ndata: [DONE]\n`
        });
      });

    // Intercept AI Changes detection endpoint
    await page.route('**/*api/ai/changes*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ significant: false })
      });
    });

    // Intercept Genkit flow endpoints to prevent 429 quota exhaustion errors in test suites
    await page.route('**/api/genkit/**', async route => {
      console.log('E2E MOCK: Intercepted Genkit flow endpoint');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { text: 'Clinical assessment complete.' } })
      });
    });

    // Intercept all AI Chat endpoints (/start, /message)
    await page.route('**/*api/ai/chat*', async route => {
      const url = route.request().url();
      if (url.includes('/start')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ sessionId: 'mock-session-id' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ text: 'This is a mock clinical intelligence response.' })
        });
      }
    });
  }

  // Set local storage flags and disable service workers
  await page.addInitScript((mockClinician) => {
    try {
      window.indexedDB.deleteDatabase('PocketGullDB');
      window.indexedDB.deleteDatabase('pocket-gull-cache');
    } catch (e) {}

    // Mock API key so the Voice Assistant doesn't abort initialization
    (window as any).GEMINI_API_KEY = 'mock-api-key';

    // Guard storage writes because Playwright executes addInitScript in sandboxed/blocked frames (e.g. Firebase auth iframe under COEP)
    try {
      window.localStorage.setItem('pg_tour_seen', '1');
      window.localStorage.setItem('pg_data_consent_v1', 'true');
      window.sessionStorage.setItem('pg_session_onboarded', '1');
      if (mockClinician) {
        window.localStorage.setItem('pg_mock_clinician', '1');
      }
    } catch (e) {}

    // Disable service worker during tests so Playwright can intercept API requests reliably
    try {
      const mockRegistration = {
        active: null,
        installing: null,
        waiting: null,
        scope: '/',
        update: () => Promise.resolve(),
        unregister: () => Promise.resolve(true),
        addEventListener: () => {},
        removeEventListener: () => {}
      };
      const mockSW = {
        register: () => Promise.resolve(mockRegistration as any),
        addEventListener: () => {},
        removeEventListener: () => {},
        getRegistration: () => Promise.resolve(mockRegistration as any),
        getRegistrations: () => Promise.resolve([mockRegistration as any]),
        controller: null,
        ready: Promise.resolve(mockRegistration as any)
      };
      Object.defineProperty(navigator, 'serviceWorker', {
        get() { return mockSW; },
        configurable: true
      });
    } catch (e) {
      console.error('Failed to disable service worker:', e);
    }
  }, options.mockClinician);
}

/** Shared login + demo mode entry flow for all E2E tests */
export async function enterDemoMode(page: Page) {
  const existingViewport = page.viewportSize();
  if (!existingViewport) {
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto('/');
      break;
    } catch (navErr) {
      const msg = (navErr as Error)?.message || '';
      if (attempt < 2 && /ERR_NO_BUFFER_SPACE|ERR_CONNECTION_RESET|ERR_SOCKET/i.test(msg)) {
        await page.waitForTimeout(600 * (attempt + 1));
        continue;
      }
      throw navErr;
    }
  }

  const startTime = Date.now();
  while (Date.now() - startTime < 30000) {
    // Dismiss consent modal if it overlays the screen
    const consentBtn = page.locator('button', { hasText: /I Understand — Continue/i }).first();
    if (await consentBtn.isVisible().catch(() => false)) {
      await consentBtn.click().catch(() => {});
      await page.waitForTimeout(300).catch(() => {});
    }

    // 0. If splash screen is no longer visible, app is unlocked!
    const splashMain = page.locator('.secure-splash-main');
    const isSplashVisible = await splashMain.isVisible().catch(() => false);
    if (!isSplashVisible) {
      break;
    }

    // 1. Enter Suite / Enter Clinical Suite button
    const enterSuiteBtn = page.locator('button', { hasText: /Initialize System/i }).first();
      const apiKeyInput = page.locator('input[name="apiKey"]');
      if (await apiKeyInput.isVisible().catch(() => false)) {
        await apiKeyInput.fill('MOCK_E2E_KEY');
      }
    if (await enterSuiteBtn.isVisible().catch(() => false)) {
      await enterSuiteBtn.click().catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      continue;
    }

    // 2. Authenticate via 1-Click Passkey Login (primary splash auth after Demo Mode removal)
    const passkeyBtn = page.locator('button', { hasText: /1-Click Passkey Login/i }).first();
    if (await passkeyBtn.isVisible().catch(() => false)) {
      await passkeyBtn.click().catch(() => {});
      await page.waitForTimeout(600).catch(() => {});
      continue;
    }

    // Legacy fallback if Demo Mode button exists in a test variant
    const demoBtn = page.locator('button', { hasText: 'Demo Mode' });
    if (await demoBtn.isVisible().catch(() => false)) {
      await demoBtn.click().catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      continue;
    }

    // 3. Skip KSS button
    const skipBtn = page.locator('button', { hasText: 'Skip' });
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click().catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      continue;
    }

    // 4. Ethics pledge checkbox & Accept button
    const pledgeCheckbox = page.locator('#pledge-accepted, input[type="checkbox"]').first();
    if (await pledgeCheckbox.isVisible().catch(() => false)) {
      if (!(await pledgeCheckbox.isChecked().catch(() => false))) {
        await pledgeCheckbox.check().catch(() => {});
      }
    }

    const acceptBtn = page.locator('button', { hasText: 'Accept & Enter System' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click().catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      continue;
    }

    await page.waitForTimeout(300).catch(() => {});
  }

  // Final wait for splash screen to disappear and hydrate viewport @defer blocks
  await page.locator('.secure-splash-main').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});

  // Wait for primary patient & navigation controls so Demo Mode never returns mid-hydration
  const vpWidth = page.viewportSize()?.width ?? 1280;
  const readyNav = vpWidth < 768 ? page.getByTestId('mobile-tab-analysis') : page.getByTestId('header-tab-analysis');
  const dropdownReady = page.locator('app-patient-dropdown button').first();
  await readyNav.or(dropdownReady).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

  // Secondary check for consent modal after splash detachment / hydration
  const consentBtnAfter = page.locator('button', { hasText: /I Understand — Continue/i }).first();
  if (await consentBtnAfter.waitFor({ state: 'visible', timeout: 1200 }).then(() => true).catch(() => false)) {
    await consentBtnAfter.click().catch(() => {});
    await page.waitForTimeout(300).catch(() => {});
  }

  await readyNav.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 600)).catch(() => {});
}

/** Shared patient selection helper for all E2E specs with WHO/NIH demographic archetype mapping */
export async function selectPatientByName(page: Page, name: string) {
  // Map legacy names to HIPAA Safe Harbor WHO/NIH demographic archetypes
  const archetypeAliasMap: Record<string, string> = {
    'Sarah Jenkins': 'Homo Sapiens (Female, Asthma',
    'Alexander Vance': 'Homo Sapiens (Male, Metabolic',
    'Robert Davis': 'Homo Sapiens (Male, Metabolic',
    'Diane Vance': 'Homo Sapiens (Female, Musculoskeletal',
    'Marcus Aurelius Chen': 'Homo Sapiens (Male, Cardiovascular',
    'Arthur Pendelton': 'Homo Sapiens (Male, Cognitive',
    'Chloe Bennett': 'Homo Sapiens (Female, Autoimmune',
    'Devon Brooks': 'Homo Sapiens (Male, Gastrointestinal',
    'Maya Patel': 'Homo Sapiens (Female, Endocrine',
    'James Wilson': 'Homo Sapiens (Male, Renal',
    'Phil Gear': 'Homo Sapiens (Male, Cardiovascular',
  };
  const targetName = archetypeAliasMap[name] || name;

  // Dismiss any lingering consent modal before touching patient dropdown
  const consentBtn = page.locator('button', { hasText: /I Understand — Continue/i }).first();
  if (await consentBtn.isVisible().catch(() => false)) {
    await consentBtn.click().catch(() => {});
    await page.waitForTimeout(250).catch(() => {});
  }

  const dropdownBtn = page.locator('app-patient-dropdown pocket-gull-button button, app-patient-dropdown button').first();
  if (await dropdownBtn.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false)) {
    await dropdownBtn.click({ force: true });
    await page.waitForTimeout(400);

    const option = page.locator('app-patient-dropdown .group\\/list button', { hasText: targetName }).first();
    if (await option.waitFor({ state: 'visible', timeout: 2500 }).then(() => true).catch(() => false)) {
      await option.click({ force: true });
      await page.locator('app-patient-dropdown .group\\/list').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(400);
      return;
    }

    const searchInput = page.locator('app-patient-dropdown input[placeholder*="Search"]');
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(targetName);
      await searchInput.dispatchEvent('input');
      await page.waitForTimeout(300);
      const searchOption = page.locator('app-patient-dropdown .group\\/list button', { hasText: targetName }).first();
      if (await searchOption.waitFor({ state: 'visible', timeout: 1500 }).then(() => true).catch(() => false)) {
        await searchOption.click({ force: true });
        await page.locator('app-patient-dropdown .group\\/list').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(400);
        return;
      }
      // Clear search to restore full patient list before fallback
      await searchInput.fill('');
      await searchInput.dispatchEvent('input');
      await page.waitForTimeout(200);
    }

    // Fallback: select first active patient from roster (never click action buttons in footer)
    const fallbackOption = page.locator('app-patient-dropdown .group\\/list button').first();
    if (await fallbackOption.waitFor({ state: 'visible', timeout: 1500 }).then(() => true).catch(() => false)) {
      await fallbackOption.click();
    } else {
      await page.keyboard.press('Escape').catch(() => {});
    }
    await page.locator('app-patient-dropdown .group\\/list').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(400);
  }
}

/** Shared patient selection helper by explicit patient ID */
export async function selectPatientById(page: Page, patientId: string, nameHint?: string) {
  // Dismiss any lingering modals or backdrops that would block header interaction
  const closeResearch = page.locator('button[aria-label="Close Evidence Drawer"]').first();
  if (await closeResearch.isVisible({ timeout: 400 }).catch(() => false)) {
    await closeResearch.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);
  }
  const modalClose = page.locator('.print-medical-chart button[aria-label="Close"], .print-medical-chart button:has-text("Cancel")').first();
  if (await modalClose.isVisible({ timeout: 500 }).catch(() => false)) {
    await modalClose.click({ force: true }).catch(() => {});
    await page.locator('.print-medical-chart').first().waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});
  }

  // Try direct Angular component invocation if available (dev mode)
  const switchedViaNg = await page.evaluate((pid) => {
    const dropdownEl = document.querySelector('app-patient-dropdown') as any;
    if (dropdownEl && (window as any).ng?.getComponent) {
      const comp = (window as any).ng.getComponent(dropdownEl);
      if (comp && typeof comp.selectPatient === 'function') {
        comp.selectPatient(pid);
        return true;
      }
    }
    return false;
  }, patientId).catch(() => false);

  if (switchedViaNg) {
    await page.waitForTimeout(400);
    return;
  }

  const dropdownBtn = page.locator('app-patient-dropdown pocket-gull-button button, app-patient-dropdown button').first();
  await dropdownBtn.waitFor({ state: 'attached', timeout: 10000 });

  const searchInput = page.locator('app-patient-dropdown input[placeholder*="Search"]').first();
  const isAlreadyOpen = await searchInput.isVisible({ timeout: 250 }).catch(() => false);
  if (!isAlreadyOpen) {
    await dropdownBtn.scrollIntoViewIfNeeded().catch(() => {});
    await dropdownBtn.click({ force: true });
    await searchInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  }

  // Always reset any stale filter first so full patient list is visible
  if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await searchInput.fill('');
    await searchInput.dispatchEvent('input');
    await page.waitForTimeout(150);
  }

  const testIdOption = page.locator(`[data-testid="patient-option-${patientId}"]`).first();
  if (!(await testIdOption.isVisible({ timeout: 1000 }).catch(() => false))) {
    if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await searchInput.fill(nameHint || patientId);
      await searchInput.dispatchEvent('input');
      await page.waitForTimeout(300);
    }
  }

  if (await testIdOption.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false)) {
    await testIdOption.scrollIntoViewIfNeeded().catch(() => {});
    await testIdOption.click({ force: true });
    await searchInput.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(400);
    return;
  }

  // Last-resort direct DOM click inside open list
  const evaluated = await page.evaluate((pid) => {
    const btn = document.querySelector(`[data-testid="patient-option-${pid}"]`) as HTMLElement | null;
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }, patientId).catch(() => false);

  if (evaluated) {
    await page.waitForTimeout(400);
    return;
  }

  console.error(`[selectPatientById] FAILED to locate option for patientId: ${patientId}`);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(300);
}

/**
 * On mobile viewports (<768px), activates the `Analysis` workspace tab so Column 3
 * (`app-analysis-container` and `app-analysis-report`) is unhidden before asserting on it.
 */
export async function ensureAnalysisViewVisible(page: Page): Promise<void> {
  const vpWidth = page.viewportSize()?.width ?? 1280;
  if (vpWidth >= 768) return;

  // Clear any blocking modal before attempting mobile tab switch
  const consentBtn = page.locator('button', { hasText: /I Understand — Continue/i }).first();
  if (await consentBtn.isVisible().catch(() => false)) {
    await consentBtn.click().catch(() => {});
    await page.waitForTimeout(250).catch(() => {});
  }

  const mobileAnalysisTab = page.getByTestId('mobile-tab-analysis');
  const hasMobileTab = await mobileAnalysisTab.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
  if (hasMobileTab) {
    const container = page.locator('app-analysis-container').first();
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
    await mobileAnalysisTab.scrollIntoViewIfNeeded().catch(() => {});

    // Attempt Playwright click, DOM el.click() (for WebKit touch quirk parity), and dispatchEvent until container mounts visible
    await mobileAnalysisTab.click({ force: true }).catch(() => {});
    let analysisVisible = await container.waitFor({ state: 'visible', timeout: 3500 }).then(() => true).catch(() => false);
    if (!analysisVisible) {
      await mobileAnalysisTab.evaluate((el) => (el as HTMLElement).click()).catch(() => {});
      analysisVisible = await container.waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false);
    }
    if (!analysisVisible) {
      await mobileAnalysisTab.dispatchEvent('click').catch(() => {});
      await container.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    }
    await page.locator('#tour-body-chart').waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(300);
  }
}

/**
 * On mobile viewports (<768px), activates the `Chart` workspace tab so Column 1
 * (`app-medical-chart`) is unhidden before asserting on it.
 */
export async function ensureChartViewVisible(page: Page): Promise<void> {
  const vpWidth = page.viewportSize()?.width ?? 1280;
  if (vpWidth >= 768) return;
  const mobileChartTab = page.getByTestId('mobile-tab-chart');
  const hasMobileTab = await mobileChartTab.waitFor({ state: 'attached', timeout: 10000 }).then(() => true).catch(() => false);
  if (hasMobileTab) {
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
    await mobileChartTab.evaluate((el) => (el as HTMLElement).click()).catch(() => {});
    await page.locator('app-medical-chart').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(300);
  }
}

/**
 * Opens a Clinical Apps / Portals Hub action across desktop (`#btn-apps-hub-trigger`)
 * and mobile (`Open Mobile Navigation Menu` slide-out drawer).
 */
export async function openAppsHubAction(page: Page, desktopSelector: string, mobileSelector: string): Promise<void> {
  const desktopHubBtn = page.locator('#btn-apps-hub-trigger');
  if (await desktopHubBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
    await desktopHubBtn.click();
    await page.waitForTimeout(250);
    const desktopItem = page.locator(desktopSelector).first();
    await desktopItem.waitFor({ state: 'visible', timeout: 10000 });
    await desktopItem.click();
    return;
  }

  const mobileMenuBtn = page.locator('button[aria-label="Open Mobile Navigation Menu"]');
  await mobileMenuBtn.waitFor({ state: 'visible', timeout: 10000 });
  await mobileMenuBtn.click();
  await page.waitForTimeout(300);
  const mobileItem = page.locator(mobileSelector).first();
  await mobileItem.scrollIntoViewIfNeeded();
  await mobileItem.waitFor({ state: 'visible', timeout: 10000 });
  await mobileItem.click();
}

/**
 * Switches to an analysis lens tab by its `data-testid`, automatically activating the
 * mobile `Analysis` tab when `<768px` and expanding SMoE Sparse routing (`[DENSE]`) when needed.
 */
export async function switchToAnalysisLens(page: Page, testId: string): Promise<void> {
  await ensureAnalysisViewVisible(page);
  const targetBtn = page.getByTestId(testId);
  const denseBtn = page.locator('app-analysis-report button', { hasText: /\[DENSE\]/i }).first();

  // Wait for @defer <app-analysis-report> to mount either the requested tab or the Sparse Mode [DENSE] toggle
  await targetBtn.or(denseBtn).first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});

  if (!(await targetBtn.isVisible().catch(() => false))) {
    if (await denseBtn.isVisible().catch(() => false)) {
      await denseBtn.scrollIntoViewIfNeeded().catch(() => {});
      await denseBtn.click({ force: true });
      const revealed = await targetBtn.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
      if (!revealed && (await denseBtn.isVisible().catch(() => false))) {
        await denseBtn.dispatchEvent('click').catch(() => {});
        await page.waitForTimeout(350);
      }
    }
  }

  await targetBtn.waitFor({ state: 'visible', timeout: 15000 });
  await targetBtn.scrollIntoViewIfNeeded().catch(() => {});
  await targetBtn.dispatchEvent('click');
  await page.waitForTimeout(500);
}











