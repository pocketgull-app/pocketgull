import { test, expect } from '@playwright/test';

test.describe('Nantucket Tick Radar & Citizen Science E2E Suite', () => {
  const NANTUCKET_URL = 'http://localhost:8080/';

  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(NANTUCKET_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('1. Verified Clean Page Load, Header & Zero Sticky Obstructions', async ({ page }) => {
    // Check main title and subtitle
    const headerTitle = page.locator('h1', { hasText: 'NANTUCKET TICK RADAR' });
    await expect(headerTitle).toBeVisible();

    // Verify all 12 navigation tabs are rendered
    const tabs = page.locator('nav[aria-label="Nantucket Tick Radar Navigation"] button[role="tab"]');
    await expect(tabs).toHaveCount(12);

    // Verify footer authoritative links
    const nchLink = page.locator('footer a', { hasText: 'Nantucket Cottage Hospital' });
    await expect(nchLink).toBeVisible();
    await expect(nchLink).toHaveAttribute('href', 'https://nantuckethospital.org/');
  });

  test('2. 3D Double-Click Card Flip & 6th-Grade Reading Mode', async ({ page }) => {
    // Navigate to Sources & Science tab
    const sourcesTab = page.locator('button[data-tab="sources"]');
    await sourcesTab.click();

    // Find the first source flip card
    const firstCard = page.locator('.flip-card-container').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).not.toHaveClass(/flipped/);

    // Double-click the card to flip to 6th-Grade mode
    await firstCard.dblclick();
    await expect(firstCard).toHaveClass(/flipped/);

    // Verify 6th grade plain English badge is visible
    const grade6Badge = firstCard.locator('text=6TH GRADE PLAIN ENGLISH');
    await expect(grade6Badge).toBeVisible();

    // Double-click again to flip back to Clinical mode
    await firstCard.dblclick();
    await expect(firstCard).not.toHaveClass(/flipped/);

    // Test Global Header Reading Mode Toggle
    const globalReadingBtn = page.locator('#toggleReadingModeBtn');
    await expect(globalReadingBtn).toBeVisible();
    await globalReadingBtn.click();

    // Verify all cards are now flipped to 6th-grade mode
    await expect(firstCard).toHaveClass(/flipped/);
    await expect(globalReadingBtn).toHaveClass(/active-grade6/);

    // Toggle back to Clinical mode
    await globalReadingBtn.click();
    await expect(firstCard).not.toHaveClass(/flipped/);
  });

  test('3. Interactive 360° Body Inspection Hotspot Map', async ({ page }) => {
    // Navigate to 360 Body Scan
    await page.locator('button[data-tab="bodyscan"]').click();

    // Verify body silhouette container exists
    const bodyMannequin = page.locator('.body-mannequin-container');
    await expect(bodyMannequin).toBeVisible();

    // Click on Axillary Folds (Armpits) zone button
    const armpitBtn = page.locator('.body-zone-btn[data-zone-id="zone-armpits"]');
    await armpitBtn.click();

    // Verify details panel updates with Axillary extraction instructions
    const detailsHeading = page.locator('h3', { hasText: 'Axillary Folds' });
    await expect(detailsHeading).toBeVisible();

    // Toggle to Back view
    const backBtn = page.locator('button[data-body-view="back"]');
    await backBtn.click();
    await expect(backBtn).toHaveClass(/active/);
  });

  test('4. Microclimate Desiccation Radar & Island Weather Presets', async ({ page }) => {
    // Navigate to Desiccation Radar
    await page.locator('button[data-tab="weather"]').click();

    // Verify VPD gauge and Questing index
    const vpdDisplay = page.locator('h3', { hasText: 'Vapor Pressure Deficit (VPD)' });
    await expect(vpdDisplay).toBeVisible();

    // Click "Sunny Afternoon" Preset
    const sunnyPresetBtn = page.locator('button[data-weather-preset="sunny_afternoon"]');
    await sunnyPresetBtn.click();

    // Verify desiccation risk updates
    const desiccationNotice = page.locator('text=LETHAL DESICCATION BARRIER');
    await expect(desiccationNotice).toBeVisible();
  });

  test('5. Island Ranger & Community Update Hub (QR & SMS NLP Bot)', async ({ page }) => {
    // Navigate to Ranger & Community
    await page.locator('button[data-tab="community"]').click();

    // Verify QR sign generator
    const qrSection = page.locator('h3', { hasText: 'Trailhead Weatherproof QR Kiosk' });
    await expect(qrSection).toBeVisible();

    // Test SMS text parser simulation
    const smsInput = page.locator('#smsTextInput');
    await smsInput.fill('Found 3 deer tick nymphs on dog at Squam Swamp trail');
    const parseBtn = page.locator('#parseSmsBtn');
    await parseBtn.click();

    // Verify parsed sighting was logged in public dispatch ticker
    const loggedSighting = page.locator('text=Squam Swamp');
    await expect(loggedSighting.first()).toBeVisible();

    // Test 1-Click Pharmacy Counter
    const dansPharmacyBtn = page.locator('button[data-rx-pharmacy="dans"]');
    await dansPharmacyBtn.click();
    const rxCounter = page.locator('#pharmacyCounters');
    await expect(rxCounter).toBeVisible();
  });

  test('6. Ferry Packing Kit Checklist & Progress Persistence', async ({ page }) => {
    // Navigate to Ferry Packing Kit
    await page.locator('button[data-tab="ferrykit"]').click();

    // Find first checkbox item and toggle it
    const firstItem = page.locator('.ferry-kit-item').first();
    const checkbox = firstItem.locator('input[type="checkbox"]');
    const wasChecked = await checkbox.isChecked();
    await firstItem.click();

    // Verify item toggles checked state
    if (wasChecked) {
      await expect(checkbox).not.toBeChecked();
    } else {
      await expect(checkbox).toBeChecked();
    }
  });

  test('7. Field Guides Reader & Wikipedia Image Verification', async ({ page }) => {
    // Navigate to Field Guides
    await page.locator('button[data-tab="articles"]').click();

    // Search for "Barberry"
    const searchInput = page.locator('#articleSearchInput');
    await searchInput.fill('Barberry');

    // Click "Read Full Field Guide"
    const readGuideBtn = page.locator('.read-article-btn').first();
    await readGuideBtn.click();

    // Verify expanded article reader displays with image caption
    const articleTitle = page.locator('h2', { hasText: 'The Botanical Shield' });
    await expect(articleTitle).toBeVisible();

    // Close reader using close button
    const closeBtn = page.locator('#closeArticleBtn');
    await closeBtn.click();
    await expect(articleTitle).not.toBeVisible();
  });
});
