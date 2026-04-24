// ============================================================
// Test Suite  : Chartering — Cargo
// Description : Covers full cargo management flow in
//               Chartering → Cargo Books. Includes Create
//               (with Charterer and Broker contact creation),
//               Edit, Delete Cargo and Delete Contacts
//               (both skipped).
// Tags        : @marlo @chartering @cargo
// ============================================================

import { test, expect } from '@playwright/test';
import { loginWithActiveUser, logout } from '../../../../../utils/login-helper';
import cargoData from '../../../../../test-data/marlo/chartering/cargo.json';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — Create must run before Edit and Delete
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────────────────────
// Helper — Generate 4-digit random number
// Used for unique charterer and broker names per run
// ─────────────────────────────────────────────────────────────
function generate4Digit(): number {
    return Math.floor(Math.random() * 9000) + 1000;
}

// ─────────────────────────────────────────────────────────────
// Shared contact names across all tests in this suite
// ─────────────────────────────────────────────────────────────
let uniqueChartererName: string;
let uniqueBrokerName: string;

// ============================================================
// CREATE CARGO
// ============================================================
test.describe('Chartering — Create Cargo @marlo @chartering @cargo', () => {

    test.beforeEach(async ({ page }) => {
        test.setTimeout(180000);

        // Generate fresh unique names each test run
        uniqueChartererName = `Charterer_${generate4Digit()}`;
        uniqueBrokerName = `Broker_${generate4Digit()}`;

        await loginWithActiveUser(page);

        const responsePromise = page.waitForResponse(
            (response) =>
                response.url() === process.env.MARLO_API_URL! &&
                response.status() === 200
        );
        await responsePromise;

        await page.getByText('directions_boatChartering').click();
        await page.getByRole('link', { name: 'Cargo Books' }).click();
        console.log('📍 Navigated to Chartering → Cargo Books');
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Create Cargo ──────────────────────────────────
    test(
        'Should create Cargo Book successfully @smoke',
        async ({ page }) => {
            test.setTimeout(180000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test       : Create Cargo Book');
            console.log(`👤 Charterer  : ${uniqueChartererName}`);
            console.log(`🤝 Broker     : ${uniqueBrokerName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Select Cargo type ─────────────────────────
            await test.step('Open Create Cargo form and select cargo type', async () => {
                await page.getByRole('button', { name: 'Create Cargo' }).first().click();
                await page.waitForTimeout(2000);
                await page.locator('#cargo-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                const options = await page.locator(
                    '.react-select__menu-list .react-select__option'
                ).all();
                const randomIndex = Math.floor(Math.random() * options.length);
                await options[randomIndex].click();
                console.log('📦 Cargo type selected');
            });

            // ── Step 2 — Create Charterer contact ──────────────────
            await test.step('Create new Charterer contact', async () => {
                await page.locator('#Charterer').click();
                await page.getByRole('button', { name: 'Add new' }).click();
                await page.locator('#name').fill(uniqueChartererName);
                await page.locator('#country_name-input').fill(cargoData.charterer.country);
                await page.keyboard.press('Enter');
                await page.locator('#address1').fill(cargoData.charterer.address);
                await page.getByRole('button', { name: 'Save' }).click();
                await page.locator(
                    'div[role="button"] h3:has-text("Charterer")'
                ).first().click();
                console.log(`✅ Charterer created: ${uniqueChartererName}`);
            });

            // ── Step 3 — Select Nominated Vessel ───────────────────
            await test.step('Select nominated vessel', async () => {
                await page.locator('#-input').first().click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.locator('.react-select__option').first().click();
                console.log('🚢 Nominated vessel selected');
            });

            // ── Step 4 — Select Vessel Type ────────────────────────
            await test.step('Select vessel type', async () => {
                await page.locator('#vessel_type_dwt-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.locator('.react-select__option', {
                    hasText: cargoData.createCargo.vesselType
                }).click();
                console.log(`🚢 Vessel type selected: ${cargoData.createCargo.vesselType}`);
            });

            // ── Step 5 — Set Laycan From date ──────────────────────
            await test.step('Set Laycan From date', async () => {
                await page.locator('#date-picker').nth(0).click();
                await page.getByLabel(cargoData.createCargo.laycanDate).click();
                console.log(`📅 Laycan From date set`);
            });

            // ── Step 6 — Set CP Date ───────────────────────────────
            await test.step('Set CP Date', async () => {
                await page.locator('#cpDate').click();
                await page.getByLabel(cargoData.createCargo.cpDate).click();
                console.log('📅 CP Date set');
            });

            // ── Step 7 — Fill CP Qty and Invoice Qty ───────────────
            await test.step('Fill CP Qty, Invoice Qty and Bill By', async () => {
                await page.locator('#charter_party_cargo_quantity').fill(
                    cargoData.createCargo.cpQty
                );
                await page.locator('#minimum_invoice_quantity').fill(
                    cargoData.createCargo.invoiceQty
                );
                await page.locator('#bill_by-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.locator('.react-select__option', { hasText: 'cp qty' }).click();
                console.log('📋 CP Qty and Invoice Qty filled');
            });

            // ── Step 8 — Fill Option % and Type ───────────────────
            await test.step('Fill Option percentage and type', async () => {
                await page.locator('#option_percentage').fill(
                    cargoData.createCargo.optionPercentage
                );
                await page.locator('#optionType-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.locator('.react-select__option', { hasText: 'Moloo' }).click();
                console.log(`📋 Option: ${cargoData.createCargo.optionPercentage}% — Moloo`);
            });

            // ── Step 9 — Fill Freight Type and Rate ────────────────
            await test.step('Fill Freight Type and Rate', async () => {
                await page.locator('input[role="combobox"]#freight_type-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.locator('.react-select__option', { hasText: 'Frt Rate' }).click();
                await page.locator('#freight_rate').fill(cargoData.createCargo.freightRate);
                console.log(`💰 Freight Rate: ${cargoData.createCargo.freightRate}`);
            });

            // ── Step 10 — Set Status ───────────────────────────────
            await test.step('Set cargo status', async () => {
                await page.locator('#status-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.locator('.react-select__option', {
                    hasText: cargoData.createCargo.status
                }).click();
                console.log(`📋 Status: ${cargoData.createCargo.status}`);
            });

            // ── Step 11 — Set Executives ───────────────────────────
            await test.step('Set Chartering and Operations Executive', async () => {
                await page.locator('#chartering_executive-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.locator('.react-select__option').first().click();

                await page.locator('#operation_executive-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.locator('.react-select__option').first().click();
                console.log('👤 Executives assigned');
            });

            // ── Step 12 — Fill Port Function 1 (Loading) ───────────
            await test.step('Fill Port Function 1 — Loading port details', async () => {
                const functionCell1 = page.locator(
                    'div[role="gridcell"][col-id="port_function"]'
                ).nth(0);
                await functionCell1.click();
                await functionCell1.locator('input').fill(cargoData.createCargo.port1Function);
                await page.keyboard.press('Enter');

                const portCell1 = page.locator('div[role="gridcell"][col-id="port"]').nth(0);
                await portCell1.click();
                await portCell1.locator('input').fill(cargoData.createCargo.port1Name);
                await page.keyboard.press('Enter');

                const qtyCell1 = page.locator(
                    'div[role="gridcell"][col-id="load_discharge_quantity"]'
                ).nth(0);
                await qtyCell1.click();
                await qtyCell1.locator('input').fill(cargoData.createCargo.port1Qty);

                const loadRateCell1 = page.locator(
                    'div[role="gridcell"][col-id="load_discharge_rate"]'
                ).nth(0);
                await loadRateCell1.click();
                await loadRateCell1.locator('input').fill(cargoData.createCargo.port1LoadRate);

                const unitRateCell1 = page.locator(
                    'div[role="gridcell"][col-id="load_discharge_rate_unit"]'
                ).nth(0);
                await unitRateCell1.click();
                await unitRateCell1.locator('input').fill(cargoData.createCargo.port1UnitRate);
                await page.keyboard.press('Enter');

                const termsCell1 = page.locator('div[role="gridcell"][col-id="terms"]').nth(0);
                await termsCell1.click();
                await termsCell1.locator('input').fill(cargoData.createCargo.port1Terms);
                await page.keyboard.press('Enter');

                const portExpCell1 = page.locator(
                    'div[role="gridcell"][col-id="port_expense"]'
                ).nth(0);
                await portExpCell1.click();
                await portExpCell1.locator('input').fill(cargoData.createCargo.port1Expense);

                await page.locator('button.inline-flex.items-center.justify-center').nth(1).click();
                console.log('🚢 Port Function 1 (Loading) filled');
            });

            // ── Step 13 — Fill Port Function 2 (Discharging) ───────
            await test.step('Fill Port Function 2 — Discharging port details', async () => {
                const functionCell2 = page.locator(
                    'div[role="gridcell"][col-id="port_function"]'
                ).nth(1);
                await functionCell2.click();
                await functionCell2.locator('input').fill(cargoData.createCargo.port2Function);
                await page.keyboard.press('Enter');

                const portCell2 = page.locator('div[role="gridcell"][col-id="port"]').nth(1);
                await portCell2.click();
                await portCell2.locator('input').fill(cargoData.createCargo.port2Name);
                await page.keyboard.press('Enter');

                const qtyCell2 = page.locator(
                    'div[role="gridcell"][col-id="load_discharge_quantity"]'
                ).nth(1);
                await qtyCell2.click();
                await qtyCell2.locator('input').fill(cargoData.createCargo.port2Qty);

                const loadRateCell2 = page.locator(
                    'div[role="gridcell"][col-id="load_discharge_rate"]'
                ).nth(1);
                await loadRateCell2.click();
                await loadRateCell2.locator('input').fill(cargoData.createCargo.port2LoadRate);

                const unitRateCell2 = page.locator(
                    'div[role="gridcell"][col-id="load_discharge_rate_unit"]'
                ).nth(1);
                await unitRateCell2.click();
                await unitRateCell2.locator('input').fill(cargoData.createCargo.port2UnitRate);
                await page.keyboard.press('Enter');

                const termsCell2 = page.locator('div[role="gridcell"][col-id="terms"]').nth(1);
                await termsCell2.click();
                await termsCell2.locator('input').fill(cargoData.createCargo.port2Terms);
                await page.keyboard.press('Enter');

                const portExpCell2 = page.locator(
                    'div[role="gridcell"][col-id="port_expense"]'
                ).nth(1);
                await portExpCell2.click();
                await portExpCell2.locator('input').fill(cargoData.createCargo.port2Expense);
                console.log('🚢 Port Function 2 (Discharging) filled');
            });

            // ── Step 14 — Fill Commission 1 (Address) ──────────────
            await test.step('Fill Commission 1 — Address commission', async () => {
                const typeCell1 = page.locator('div[role="gridcell"][col-id="type"]').nth(0);
                await typeCell1.click();
                await typeCell1.locator('input').fill(cargoData.createCargo.commission1Type);
                await page.keyboard.press('Enter');

                const rateCell1 = page.locator('div[role="gridcell"][col-id="rate"]').nth(0);
                await rateCell1.click();
                await rateCell1.locator('input').fill(cargoData.createCargo.commission1Rate);

                await page.locator('button:has(svg.lucide-plus)').nth(2).click();
                console.log(`💰 Commission 1: ${cargoData.createCargo.commission1Type} — ${cargoData.createCargo.commission1Rate}%`);
            });

            // ── Step 15 — Fill Commission 2 (Broker) ───────────────
            await test.step('Fill Commission 2 — Broker and create broker contact', async () => {
                const typeCell2 = page.locator('div[role="gridcell"][col-id="type"]').nth(1);
                await typeCell2.click();
                await typeCell2.locator('input').fill(cargoData.createCargo.commission2Type);
                await page.keyboard.press('Enter');

                const brokerCell2 = page.locator(
                    'div[role="gridcell"][col-id="beneficiary_name"]'
                ).nth(1);
                await brokerCell2.click();
                await page.getByRole('button', { name: 'Add new' }).click();
                await page.locator('#name').fill(uniqueBrokerName);
                await page.locator('input[role="combobox"]#currency_id-input').click();
                await page.locator(`text = ${cargoData.broker.currency}`).click();
                await page.locator('#country_name-input').fill(cargoData.broker.country);
                await page.keyboard.press('Enter');
                await page.locator('#address1').fill(cargoData.broker.address);
                await page.getByRole('button', { name: 'Save' }).click();
                await page.locator(
                    'div[role="button"] h3:has-text("Broker")'
                ).first().click();

                const rateCell2 = page.locator('div[role="gridcell"][col-id="rate"]').nth(1);
                await rateCell2.click();
                await rateCell2.locator('input').fill(cargoData.createCargo.commission2Rate);
                console.log(`✅ Broker created: ${uniqueBrokerName}`);
                console.log(`💰 Commission 2: ${cargoData.createCargo.commission2Type} — ${cargoData.createCargo.commission2Rate}%`);
            });

            // ── Step 16 — Fill Invoice details and save ────────────
            await test.step('Fill invoice percentage, payment terms and save', async () => {
                await page.locator('#invoice_percentage').fill(
                    cargoData.createCargo.invoicePercentage
                );

                await page.locator('#payment_terms_invoice-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.getByRole('option', {
                    name: cargoData.createCargo.paymentTermsInvoice,
                    exact: true
                }).click();

                await page.locator('#payment_terms_balance-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.getByRole('option', {
                    name: cargoData.createCargo.paymentTermsBalance,
                    exact: true
                }).click();

                await page.getByRole('button', { name: 'Save' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Cargo book created')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForTimeout(2000);
                console.log('✅ Cargo book created successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Create Cargo Book — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});

// ============================================================
// EDIT CARGO
// ============================================================
test.describe('Chartering — Edit Cargo @marlo @chartering @cargo', () => {

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);

        const responsePromise = page.waitForResponse(
            (response) =>
                response.url() === process.env.MARLO_API_URL! &&
                response.status() === 200
        );
        await responsePromise;

        await page.getByText('directions_boatChartering').click();
        await page.getByRole('link', { name: 'Cargo Books' }).click();
        console.log('📍 Navigated to Chartering → Cargo Books');
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 2 — Edit Cargo ────────────────────────────────────
    test(
        'Should edit Cargo Book successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Edit Cargo Book');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open first cargo ──────────────────────────
            await test.step('Open first cargo book from the list', async () => {
                await page.reload();
                await page.getByRole('gridcell').first().click();
                console.log('📂 Cargo book opened');
            });

            // ── Step 2 — Update freight rate and invoice % ─────────
            await test.step('Update freight rate and invoice percentage', async () => {
                await page.locator('#freight_rate').fill(cargoData.editCargo.freightRate);
                await page.locator('#invoice_percentage').fill(
                    cargoData.editCargo.invoicePercentage
                );
                await expect(
                    page.getByRole('button', { name: 'Save' })
                ).toBeEnabled();
                console.log(`✏️  Freight Rate updated to: ${cargoData.editCargo.freightRate}`);
                console.log(`✏️  Invoice % updated to: ${cargoData.editCargo.invoicePercentage}`);
            });

            // ── Step 3 — Save and verify ───────────────────────────
            await test.step('Save and verify cargo book updated', async () => {
                await page.getByRole('button', { name: 'Save' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Cargo book updated successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Cargo book updated successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Edit Cargo Book — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});

// ============================================================
// DELETE CARGO (Skipped)
// ============================================================
test.describe.skip('Chartering — Delete Cargo @marlo @chartering @cargo @delete', () => {

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);

        const responsePromise = page.waitForResponse(
            (response) =>
                response.url() === process.env.MARLO_API_URL! &&
                response.status() === 200
        );
        await responsePromise;

        await page.getByText('directions_boatChartering').click();
        await page.getByRole('link', { name: 'Cargo Books' }).click();
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    test(
        'Should delete Cargo Book successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            await test.step('Open cargo book and initiate deletion', async () => {
                await page.getByRole('gridcell').first().click();
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'Delete' }).click();
                await page.getByRole('button', { name: 'Yes' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Cargo book deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Cargo book deleted successfully');
            });
        }
    );

});

// ============================================================
// DELETE CONTACTS (Skipped)
// ============================================================
test.describe.skip('Chartering — Delete Cargo Contacts @marlo @chartering @cargo @cleanup', () => {

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);

        const responsePromise = page.waitForResponse(
            (response) =>
                response.url() === process.env.MARLO_API_URL! &&
                response.status() === 200
        );
        await responsePromise;

        await page.getByText('account_balanceBanking').click();
        await page.getByRole('link', { name: 'Contacts' }).click();
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    test(
        'Should delete Broker and Charterer contacts successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            await test.step('Delete Broker contact', async () => {
                await page.getByRole('gridcell', { name: uniqueBrokerName }).first().click();
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'delete Delete vendor' }).click();
                await page.getByRole('button', { name: 'Yes' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Contact deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log(`✅ Broker deleted: ${uniqueBrokerName}`);
            });

            await test.step('Delete Charterer contact', async () => {
                await page.reload();
                await page.getByRole('gridcell', { name: uniqueChartererName }).first().click();
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'delete Delete customer' }).click();
                await page.getByRole('button', { name: 'Yes' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Contact deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log(`✅ Charterer deleted: ${uniqueChartererName}`);
            });
        }
    );

});
