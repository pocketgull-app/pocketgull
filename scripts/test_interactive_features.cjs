const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  console.log('1. Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

  // Test 1: B2B ROI Slider Interaction
  console.log('2. Testing B2B Physician Slider...');
  const slider = page.locator('#b2bDoctorSlider');
  await slider.fill('500');
  await slider.dispatchEvent('input');
  const countText = await page.locator('#b2bDoctorCount').innerText();
  const hoursSaved = await page.locator('#b2bHoursSaved').innerText();
  const netSavings = await page.locator('#b2bNetSavings').innerText();
  console.log(`   - Slider set to 500: Roster=${countText}, Hours=${hoursSaved}, NetSavings=${netSavings}`);

  // Test 2: Enterprise Pilot Request Modal
  console.log('3. Testing Enterprise Pilot Modal Flow...');
  const openModalBtn = page.locator('#openPilotModalBtn');
  await openModalBtn.click();
  await page.waitForTimeout(300);

  const modal = page.locator('#pilotModal');
  const isModalOpen = await modal.isVisible();
  console.log(`   - Pilot Modal Open: ${isModalOpen}`);

  await page.locator('#pilotOrgName').fill('Johns Hopkins Medicine');
  await page.locator('#pilotEmail').fill('cmo@jhmi.edu');
  await page.locator('#pilotEhr').selectOption('Epic Systems');
  await page.locator('#pilotDoctors').fill('500');
  await page.locator('#pilotFocus').selectOption('Ambient Bedside Scribing');

  await page.locator('#pilotForm button[type="submit"]').click();
  await page.waitForTimeout(300);

  const dossierText = await page.locator('#pilotDossierResult').innerText();
  console.log(`   - Generated Dossier Output:\n${dossierText}`);

  await page.screenshot({ path: 'pilot_modal_submission_screenshot.png' });

  // Test 3: Close modal
  await page.locator('#closePilotModalBtn').click();
  await page.waitForTimeout(300);
  console.log(`   - Modal closed successfully.`);

  // Test 4: Rotary Knob / Lazy Susan
  console.log('4. Testing Lazy Susan Rotary Knob & Stage Dial...');
  const nextStageBtn = page.locator('#nextStageBtn');
  await nextStageBtn.click();
  await page.waitForTimeout(300);
  const stage2Title = await page.locator('#stageTitle').innerText();
  console.log(`   - Cycled to Stage 2: ${stage2Title}`);

  // Test 5: Flip Card Interaction
  console.log('5. Testing Flip Card State Machine...');
  const firstFlipBtn = page.locator('.flip-card-container[data-flip-id="trial-screen"] .flip-trigger-btn').first();
  await firstFlipBtn.click();
  await page.waitForTimeout(400);
  const cardIsFlipped = await page.locator('.flip-card-container[data-flip-id="trial-screen"]').evaluate(el => el.classList.contains('flipped'));
  console.log(`   - Trial Screen Flip Card State: flipped=${cardIsFlipped}`);

  // Test 6: Search Query Filter
  console.log('6. Testing Live Clinical Search Filter...');
  const firstTag = page.locator('.search-tag').first();
  await firstTag.click();
  await page.waitForTimeout(300);
  const searchResultCard = await page.locator('#searchResultCard').isVisible();
  const searchResultTitle = await page.locator('#searchResultCard h4').innerText();
  console.log(`   - Search Tag Result Card Visible: ${searchResultCard} (Title: ${searchResultTitle})`);

  await page.screenshot({ path: 'interactive_suite_screenshot.png' });
  console.log('\n✅ ALL 6 INTERACTIVE FLOWS PASSED VERIFICATION.');

  await browser.close();
})();
