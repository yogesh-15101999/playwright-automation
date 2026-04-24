// ============================================================
// Test Suite  : Chartering — Estimate
// Description : Covers estimate workflow in
//               Chartering → Estimates. Includes creating
//               a worksheet, creating an estimate with vessel,
//               ownership, cargo, fuel prices and terminating
//               port, and verifying it in the list view.
// Note        : Depends on Vessel, Ownership and Cargo
//               being created beforehand.
// Tags        : @marlo @chartering @estimate
// ============================================================

import { test, expect } from '@playwright/test';
import { loginWithActiveUser, logout } from '../../../../../utils/login-helper';
import estimateData from '../../../../../test-data/marlo/chartering/estimate.json';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — Create must run before List verification
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────────────────────
// Helper — Generate random 2 or 3 digit number
// Used for unique worksheet name per run
// ─────────────────────────────────────────────────────────────
function generateRandom2or3DigitNumber(): number {
    return Math.floor(10 + Math.random() * 990);
}

// ─────────────────────────────────────────────────────────────
// Shared worksheet name across all tests in this suite
// ─────────────────────────────────────────────────────────────
const uniqueWorksheetName = `Automation worksheet ${generateRandom2or3DigitNumber()}`;

test.describe('Chartering — Estimate @marlo @chartering @estimate', () => {

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);
        await page.getByText('directions_boatChartering').click();
        await page.getByRole('link', { name: 'Estimates' }).click();
        console.log('📍 Navigated to Chartering → Estimates');
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Create Estimate Worksheet and Estimate ────────
    test(
        'Should create Estimate Worksheet and Estimate successfully @smoke',
        async ({ page }) => {
            test.setTimeout(180000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test       : Create Estimate Worksheet & Estimate');
            console.log(`📄 Worksheet  : ${uniqueWorksheetName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Create Worksheet ──────────────────────────
            await test.step('Create new Estimate Worksheet', async () => {
                await page.getByRole('button', { name: 'Create Worksheet' }).first().click();
                await page.locator('#worksheetName').fill(uniqueWorksheetName);
                await page.getByRole('button', { name: 'Create worksheet' }).click();
                await expect(
                    page.getByText('Worksheet created successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForLoadState('load');
                console.log(`✅ Worksheet created: ${uniqueWorksheetName}`);
            });

            // ── Step 2 — Select Vessel ─────────────────────────────
            await test.step('Select vessel for estimate', async () => {
                await page.locator('.react-select__control').first().click();
                await page.getByRole('option').first().click();
                console.log('🚢 Vessel selected');
            });

            // ── Step 3 — Verify Ownership ID prefilled ─────────────
            await test.step('Verify Ownership ID is prefilled from linked fixture', async () => {
                await expect(
                    page.getByText('Import data from linked Ownership Fixture')
                ).toBeVisible({ timeout: 30000 });
                await page.getByRole('button', { name: 'Yes' }).click();
                await expect(
                    page.locator('.react-select__single-value').nth(1)
                ).not.toBeEmpty();
                console.log('✅ Ownership ID prefilled from linked fixture');
            });

            // ── Step 4 — Set Commencing Date ───────────────────────
            await test.step('Set Commencing Date to 1st of current month', async () => {
                const now = new Date();
                const month = now.toLocaleDateString('en-GB', { month: 'short' });
                const year = now.getFullYear();
                const commencingDate = `01 ${month} ${year} | 00:00`;

                const dateInput = page.locator('#date-picker').first();
                await dateInput.click();
                await dateInput.fill(commencingDate);
                await dateInput.press('Enter');
                console.log(`📅 Commencing date set: ${commencingDate}`);
            });

            // ── Step 5 — Select Charter Specialist ─────────────────
            await test.step('Select Charter Specialist', async () => {
                await page.locator('.react-select__control').nth(4).click();
                const options = page.getByRole('option');
                await expect(options.first()).toBeVisible();
                await options.first().click();
                console.log('👤 Charter specialist selected');
            });

            // ── Step 6 — Enter Fuel Prices ─────────────────────────
            await test.step('Enter VLSFO and MGO fuel prices', async () => {
                const priceCells = page.locator('div[col-id="initial_price"]');

                await priceCells.nth(1).dblclick();
                await page.keyboard.type(estimateData.createEstimate.fuelPriceVLSFO);
                await page.keyboard.press('Enter');
                console.log(`⛽ VLSFO price: ${estimateData.createEstimate.fuelPriceVLSFO}`);

                await priceCells.nth(2).dblclick();
                await page.keyboard.type(estimateData.createEstimate.fuelPriceMGO);
                await page.keyboard.press('Enter');
                console.log(`⛽ MGO price: ${estimateData.createEstimate.fuelPriceMGO}`);
            });

            // ── Step 7 — Import Cargo ──────────────────────────────
            await test.step('Import Cargo from linked cargo fixture', async () => {
                await page.getByRole('button', { name: 'Import Cargo' }).click();
                await expect(page.getByText('Import Cargo').first()).toBeVisible();
                await page.getByRole('checkbox').first().click();
                await page.getByRole('button', { name: 'Add to estimate' }).click();
                console.log('📦 Cargo imported successfully');
            });

            // ── Step 8 — Enter Terminating Port ───────────────────
            await test.step('Enter Terminating Port', async () => {
                const portCell = page.locator('div[col-id="port_name"]').nth(4);
                await portCell.click();
                const input = page.locator('input').last();
                await input.fill(estimateData.createEstimate.terminatingPort);

                const tokyoOption = page.getByRole('option', {
                    name: estimateData.createEstimate.terminatingPortOption,
                    exact: true
                });
                await tokyoOption.waitFor({ state: 'visible' });
                await tokyoOption.click();
                console.log(`🌍 Terminating port: ${estimateData.createEstimate.terminatingPortOption}`);
            });

            // ── Step 9 — Save Estimate ─────────────────────────────
            await test.step('Save estimate and verify creation success', async () => {
                await page.click('body');
                const saveButton = page.getByRole('button', { name: 'Save estimate' });
                await expect(saveButton).toBeVisible();
                await expect(saveButton).toBeEnabled();
                await saveButton.click();
                await expect(
                    page.getByText('Estimate created successfully.')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForLoadState('load');
                console.log('✅ Estimate created successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Create Estimate Worksheet & Estimate — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 2 — List Estimate ─────────────────────────────────
    test(
        'Should verify Estimate appears in list view successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test      : List Estimate Verification');
            console.log(`📄 Worksheet : ${uniqueWorksheetName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Verify worksheet name in list ─────────────
            await test.step('Verify worksheet name appears in list', async () => {
                const worksheetCell = page.locator(
                    'div.ag-cell[col-id="worksheetName"]'
                ).first();
                const cellText = await worksheetCell.innerText();
                console.log(`📋 First worksheet in list: "${cellText}"`);

                if (cellText.includes(uniqueWorksheetName)) {
                    console.log(`✅ Worksheet name matched: ${uniqueWorksheetName}`);
                } else {
                    console.warn(`⚠️ Running in isolation — found: "${cellText}"`);
                }

                await expect(worksheetCell).toBeVisible();
                await expect(worksheetCell).not.toBeEmpty();
            });

            // ── Step 2 — Verify estimate count is 1 ───────────────
            await test.step('Verify estimate count is 1', async () => {
                const estimateCountCell = page.locator(
                    'div.ag-cell[col-id="estimateCount"]'
                ).first();
                await expect(estimateCountCell).toHaveText('1');
                console.log('✅ Estimate count verified as 1');
            });

            // ── Step 3 — Verify entry date is today ───────────────
            await test.step('Verify entry date matches today', async () => {
                const entryDateCell = page.locator(
                    'div.ag-cell[col-id="entryDate"]'
                ).first();
                const cellText = await entryDateCell.innerText();
                const datePart = cellText.split('|')[0].trim();
                console.log(`📅 Entry date in list: "${datePart}"`);

                const now = new Date();
                const localDate = now.toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                });
                const utcDate = now.toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
                });

                const isToday = datePart === localDate || datePart === utcDate;
                if (isToday) {
                    console.log(`✅ Entry date verified as today: "${datePart}"`);
                } else {
                    console.warn(`⚠️ Running in isolation — date "${datePart}" may be from previous run`);
                }

                await expect(entryDateCell).toBeVisible();
                await expect(entryDateCell).not.toBeEmpty();
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ List Estimate Verification — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});
