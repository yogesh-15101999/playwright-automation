// ============================================================
// Test Suite  : Chartering — Vessel
// Description : Covers full vessel management flow in the
//               Chartering → Vessels module. Includes Create,
//               Edit, CII Ratings and Delete (skipped).
//               Uses AG Grid helper for engine/speed inputs.
// Tags        : @marlo @chartering @vessel
// ============================================================

import { test, expect } from '@playwright/test';
import { loginWithActiveUser, logout } from '../../../../../utils/login-helper';
import { editAgGridCell } from '../../../../../utils/aggrid-helper';
import vesselData from '../../../../../test-data/marlo/chartering/vessel.json';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — Create must run before Edit, CII and Delete
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────────────────────
// Test Data — Vessel names pool for random selection
// ─────────────────────────────────────────────────────────────
const VESSEL_NAMES: string[] = [
    'STORMBREAKER', 'DEEP HORIZON', 'BLUE PHOENIX', 'IRON TIDE',
    'SEA VENTURE', 'OCEAN SPIRIT', 'CRYSTAL WAVE', 'NORTH STAR',
    'SILVER CURRENT', 'ATLANTIC GLORY', 'GOLDEN HARBOR', 'TITAN VOYAGE',
    'AQUA KNIGHT', 'WIND RUNNER', 'ROYAL SEAS', 'POLAR DRIFT',
    'NEPTUNE PRIDE', 'INFINITY SAIL', 'MAJESTIC TIDE', 'HORIZON QUEST',
];

// ─────────────────────────────────────────────────────────────
// Helper — Pick random vessel name
// ─────────────────────────────────────────────────────────────
function getRandomVesselName(): string {
    return VESSEL_NAMES[Math.floor(Math.random() * VESSEL_NAMES.length)];
}

// ─────────────────────────────────────────────────────────────
// Helper — Generate random 7-digit IMO number
// ─────────────────────────────────────────────────────────────
function getRandomSevenDigit(): string {
    return (Math.floor(Math.random() * 9000000) + 1000000).toString();
}

// ─────────────────────────────────────────────────────────────
// Shared vessel name across all tests in this suite
// Set during Create and reused in Edit, CII and Delete
// ─────────────────────────────────────────────────────────────
let vesselName: string;

test.describe('Chartering — Vessel @marlo @chartering @vessel', () => {

    // ── Login and navigate to Chartering → Vessels ─────────────
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);

        // Wait for GraphQL API response after login
        const responsePromise = page.waitForResponse(
            (response) =>
                response.url() === process.env.MARLO_API_URL! &&
                response.status() === 200
        );
        await responsePromise;

        await page.getByText('directions_boatChartering').click();
        await page.getByRole('link', { name: 'Vessels' }).click();
        console.log('📍 Navigated to Chartering → Vessels');
    });

    // ── Logout after each test ─────────────────────────────────
    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Create Vessel ─────────────────────────────────
    test(
        'Should create Vessel successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            vesselName = getRandomVesselName();
            const imoNumber = getRandomSevenDigit();

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Create Vessel');
            console.log(`🚢 Vessel : ${vesselName}`);
            console.log(`📋 IMO    : ${imoNumber}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Fill basic vessel info ────────────────────
            await test.step('Fill basic vessel information', async () => {
                await page.getByRole('button', { name: 'Create Vessel' }).first().click();
                await page.locator('#vessel_name').fill(vesselName);

                await page.locator('input[role="combobox"]#type_code-input').click();
                await page.locator(`text=${vesselData.createVessel.typeCode}`).click();

                await page.locator('input[role="combobox"]#type_dwt-input').click();
                await page.locator(`text=${vesselData.createVessel.typeDwt}`).click();

                await page.locator('#year_built').fill(vesselData.createVessel.builtYear);
                await page.locator('#imo').fill(imoNumber);
                await page.locator('#vessel_dwt').fill(vesselData.createVessel.vesselDwt);
                await page.locator('#sw_draft').fill(vesselData.createVessel.swDraft);
                await page.locator('#tpc').fill(vesselData.createVessel.tpc);

                console.log('✏️  Basic vessel info filled successfully');
            });

            // ── Step 2 — Fill capacities and ownership ─────────────
            await test.step('Fill capacities and ownership details', async () => {
                await page.locator('#bale_capacity').fill(vesselData.createVessel.baleCapacity);
                await page.locator('#grain_capacity').fill(vesselData.createVessel.grainCapacity);
                await page.locator('#deck_capacity').fill(vesselData.createVessel.deckCapacity);

                await page.locator('input[role="combobox"]#scrubber-input').click();
                await page.locator(`text=${vesselData.createVessel.scrubber}`).click();

                await page.locator('input[role="combobox"]#ownership-input').click();
                await page.locator(`text=${vesselData.createVessel.ownership}`).click();

                await page.locator('#daily_cost').fill(vesselData.createVessel.dailyCost);

                await page.locator('input[role="combobox"]#class_society-input').click();
                await page.locator(`text=${vesselData.createVessel.societyName}`).click();

                await page.locator('#email').fill(vesselData.createVessel.email);

                console.log('✏️  Capacities and ownership filled successfully');
            });

            // ── Step 3 — Fill engine details ───────────────────────
            await test.step('Fill engine details in AG Grid', async () => {
                // Port consumption — Main Engine, Aux Engine, Boiler
                await editAgGridCell(page, 'main_eng', 0, '1');
                await editAgGridCell(page, 'main_eng', 1, '1.2');
                await editAgGridCell(page, 'main_eng', 2, '0.8');

                await editAgGridCell(page, 'aux_eng', 0, '2.5');
                await editAgGridCell(page, 'aux_eng', 1, '2.8');
                await editAgGridCell(page, 'aux_eng', 2, '1.8');

                await editAgGridCell(page, 'boiler', 0, '0.3');
                await editAgGridCell(page, 'boiler', 1, '0.4');
                await editAgGridCell(page, 'boiler', 2, '0.2');

                console.log('✏️  Engine details filled successfully');
            });

            // ── Step 4 — Fill speed details ────────────────────────
            await test.step('Fill speed and sea consumption details in AG Grid', async () => {
                await editAgGridCell(page, 'speed', 0, '13.5');
                await editAgGridCell(page, 'speed', 1, '14');

                await editAgGridCell(page, 'main_eng', 3, '24.5');
                await editAgGridCell(page, 'main_eng', 4, '23');

                await editAgGridCell(page, 'aux_eng', 3, '1.2');
                await editAgGridCell(page, 'aux_eng', 4, '1');

                await editAgGridCell(page, 'boiler', 3, '0.2');
                await editAgGridCell(page, 'boiler', 4, '0.2');

                console.log('✏️  Speed details filled successfully');
            });

            // ── Step 5 — Fill constants and sea state ──────────────
            await test.step('Fill constants and sea state details', async () => {
                await page.locator('#constants_sea').fill('300');
                await page.locator('#constants_lakes').fill('50');
                await page.locator('#fresh_water').fill('400');
                await page.locator('#others').fill('75');

                await page.locator('input[role="combobox"]#beaufort-input').click();
                await page.locator('text = Gentle Breeze').click();

                await page.locator('input[role="combobox"]#sea_state-input').click();
                await page.locator('text = Smooth').click();

                await page.locator('input[role="combobox"]#sea_swell-input').click();
                await page.locator('text = No Swell').click();

                console.log('✏️  Constants and sea state filled successfully');
            });

            // ── Step 6 — Save and verify ───────────────────────────
            await test.step('Save vessel and verify creation success', async () => {
                await page.getByRole('button', { name: 'Save' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Vessel created successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForTimeout(3000);
                console.log('✅ Vessel created successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Create Vessel — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 2 — Edit Vessel ───────────────────────────────────
    test(
        'Should edit Vessel successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Edit Vessel');
            console.log(`🚢 Vessel : ${vesselName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open vessel ───────────────────────────────
            await test.step('Open vessel from the list', async () => {
                await page.locator(
                    'div[role="gridcell"][col-id="Vessel_name"]',
                    { hasText: vesselName }
                ).click();
                console.log(`📂 Vessel opened: ${vesselName}`);
            });

            // ── Step 2 — Update email and save ─────────────────────
            await test.step('Update vessel email and save', async () => {
                await page.locator('#email').fill('operations@automationtesting.com');
                await page.getByRole('button', { name: 'Save' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Vessel updated successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForTimeout(3000);
                console.log('✅ Vessel updated successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Edit Vessel — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 3 — CII Ratings ───────────────────────────────────
    test(
        'Should create CII Ratings for Vessel successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Create CII Ratings');
            console.log(`🚢 Vessel : ${vesselName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open vessel and navigate to CII ───────────
            await test.step('Open vessel and navigate to CII tab', async () => {
                await page.locator(
                    'div[role="gridcell"][col-id="Vessel_name"]',
                    { hasText: vesselName }
                ).first().click();
                await page.getByRole('button', { name: 'CII' }).click();
                console.log('📊 CII tab opened');
            });

            // ── Step 2 — Add VLSFO fuel ────────────────────────────
            await test.step('Add VLSFO fuel type and consumption', async () => {
                await page.getByRole('button', { name: 'Select fuel' }).nth(0).click();
                await page.getByRole('button', { name: 'VLSFO' }).click();
                await page.locator('#CII_fuel-0').fill('1250');
                console.log('⛽ VLSFO fuel added: 1250');
            });

            // ── Step 3 — Add MGO fuel ──────────────────────────────
            await test.step('Add MGO fuel type and consumption', async () => {
                await page.getByRole('button', { name: 'Select fuel' }).nth(0).click();
                await page.getByRole('button', { name: 'MGO' }).click();
                await page.locator('#CII_fuel-1').fill('1250');
                console.log('⛽ MGO fuel added: 1250');
            });

            // ── Step 4 — Fill annual distance and calculate ────────
            await test.step('Fill annual distance sailed and calculate CII rating', async () => {
                await page.getByLabel('Annual dist. sailed').fill('29850');
                await page.getByRole('button', { name: 'Calculate' }).click();
                await page.getByRole('button', { name: 'OK' }).click();
                console.log('📊 CII rating calculated successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Create CII Ratings — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 4 — Delete Vessel (Skipped) ──────────────────────
    // Note: Skipped to preserve vessel data for other tests.
    // Remove skip when vessel deletion needs to be verified.
    test.skip(
        'Should delete Vessel successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Delete Vessel');
            console.log(`🚢 Vessel : ${vesselName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open vessel and delete ───────────────────
            await test.step('Open vessel and initiate deletion', async () => {
                await page.locator(
                    'div[role="gridcell"][col-id="Vessel_name"]',
                    { hasText: vesselName }
                ).click();
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'Delete' }).click();
                await page.getByRole('button', { name: 'Yes' }).click();
                console.log('🗑️  Vessel deletion initiated');
            });

            // ── Step 2 — Verify deletion ───────────────────────────
            await test.step('Verify vessel deleted successfully', async () => {
                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Vessel deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForTimeout(3000);
                console.log('✅ Vessel deleted successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Delete Vessel — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});
