// ============================================================
// Test Suite  : Chartering — Ownership
// Description : Covers full ownership management flow in
//               Chartering → Fixture → Owned Vessel.
//               Includes Create (with Owner and Tech Manager
//               contact creation), Edit and Delete (skipped).
//               Delete Technical Manager and Owner contacts
//               are kept as skipped for future cleanup.
// Tags        : @marlo @chartering @ownership
// ============================================================

import { test, expect } from '@playwright/test';
import { loginWithActiveUser, logout } from '../../../../../utils/login-helper';
import ownershipData from '../../../../../test-data/marlo/chartering/ownership.json';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — Create must run before Edit and Delete
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────────────────────
// Helper — Pick random item from array
// ─────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────
// Shared contact names across all tests in this suite
// Generated at suite level with suffixes for identification
// ─────────────────────────────────────────────────────────────
const uniqueOwnerName = `${pickRandom(ownershipData.owner.companies)} - ${ownershipData.owner.suffix}`;
const uniqueTechManagerName = `${pickRandom(ownershipData.techManager.companies)} - ${ownershipData.techManager.suffix}`;

// ============================================================
// OWNERSHIP CRUD
// ============================================================
test.describe('Chartering — Ownership @marlo @chartering @ownership', () => {

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);
        await page.getByText('directions_boatChartering').click();
        await page.getByRole('link', { name: 'Fixture' }).click();
        console.log('📍 Navigated to Chartering → Fixture');
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Create Ownership ──────────────────────────────
    test(
        'Should create Owned Vessel successfully @smoke',
        async ({ page }) => {
            test.setTimeout(180000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test         : Create Owned Vessel');
            console.log(`👤 Owner        : ${uniqueOwnerName}`);
            console.log(`🔧 Tech Manager : ${uniqueTechManagerName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Navigate to Create Owned Vessel ───────────
            await test.step('Navigate to Create Owned Vessel page', async () => {
                await expect(
                    page.getByRole('heading', { name: 'Fixture' })
                ).toBeVisible();
                await page.getByRole('button', { name: 'Create fixture' }).click();
                await page.getByRole('menuitem', { name: 'Owned vessel' }).click();
                console.log('➕ Create Owned Vessel form opened');
            });

            // ── Step 2 — Select Vessel ─────────────────────────────
            await test.step('Select vessel from dropdown', async () => {
                await page.getByText('Selectarrow_drop_down').first().click();
                await page.locator(
                    '.react-select__menu-list .react-select__option'
                ).first().click();
                console.log('🚢 Vessel selected');
            });

            // ── Step 3 — Create Owner contact ─────────────────────
            await test.step('Create new Owner contact', async () => {
                await page.locator('#Owner').click();
                await page.getByRole('button', { name: 'Add new' }).click();
                await page.locator('#name').fill(uniqueOwnerName);
                await page.locator('input[role="combobox"]#currency_id-input').click();
                await page.getByRole('option', {
                    name: ownershipData.owner.currency
                }).click();
                await page.locator('#country_name-input').fill(ownershipData.owner.country);
                await page.keyboard.press('Enter');
                await page.locator('#address1').fill(ownershipData.owner.address);
                await page.getByRole('button', { name: 'Save' }).click();
                await page.locator(
                    `div[role="button"] h3:has-text("${uniqueOwnerName}")`
                ).first().click();
                console.log(`✅ Owner created: ${uniqueOwnerName}`);
            });

            // ── Step 4 — Fill Laycan dates ─────────────────────────
            await test.step('Fill Laycan From and To dates', async () => {
                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).first().press('Enter');
                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).first().fill(
                    ownershipData.createOwnership.laycanFrom
                );
                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).first().blur();

                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).nth(1).press('Enter');
                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).nth(1).fill(
                    ownershipData.createOwnership.laycanTo
                );
                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).nth(1).blur();
                console.log('📅 Laycan dates filled');
            });

            // ── Step 5 — Create Technical Manager contact ──────────
            await test.step('Create new Technical Manager contact', async () => {
                await page.locator('#technical_manager').click();
                await page.getByRole('button', { name: 'Add new' }).click();
                await page.locator('#name').fill(uniqueTechManagerName);
                await page.locator('input[role="combobox"]#currency_id-input').click();
                await page.getByRole('option', {
                    name: ownershipData.techManager.currency
                }).click();
                await page.locator('#country_name-input').fill(ownershipData.techManager.country);
                await page.keyboard.press('Enter');
                await page.locator('#address1').fill(ownershipData.techManager.address);
                await page.getByRole('button', { name: 'Save' }).click();
                await page.locator(
                    `div[role="button"] h3:has-text("${uniqueTechManagerName}")`
                ).first().click();
                console.log(`✅ Technical Manager created: ${uniqueTechManagerName}`);
            });

            // ── Step 6 — Fill Delivery details ─────────────────────
            await test.step('Fill Delivery port and date', async () => {
                await page.getByText('Select delivery portarrow_drop_down').click();
                await page.locator('div').filter({
                    hasText: /^Select delivery portarrow_drop_down$/
                }).locator('[id="-input"]').fill(
                    ownershipData.createOwnership.deliveryPort
                );
                await page.getByRole('option', {
                    name: ownershipData.createOwnership.deliveryPortOption
                }).click();

                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).nth(2).press('Enter');
                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).nth(2).fill(
                    ownershipData.createOwnership.deliveryDate
                );
                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).nth(2).blur();
                console.log('🚢 Delivery port and date filled');
            });

            // ── Step 7 — Fill Redelivery details ───────────────────
            await test.step('Fill Redelivery port and date', async () => {
                await page.getByText('Select redelivery portarrow_drop_down').click();
                await page.locator('div').filter({
                    hasText: /^Select redelivery portarrow_drop_down$/
                }).locator('[id="-input"]').fill(
                    ownershipData.createOwnership.redeliveryPort
                );
                await page.getByRole('option', {
                    name: ownershipData.createOwnership.redeliveryPortOption,
                    exact: true
                }).click();

                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).nth(3).press('Enter');
                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).nth(3).fill(
                    ownershipData.createOwnership.redeliveryDate
                );
                await page.getByRole('textbox', { name: 'dd mm yyyy | hh:mm' }).nth(3).blur();
                console.log('🚢 Redelivery port and date filled');
            });

            // ── Step 8 — Fill CP Date ──────────────────────────────
            await test.step('Fill CP (Contract) Date using calendar picker', async () => {
                await page.locator('#contract_date_fixed_at').click();
                await expect(
                    page.locator('.react-datepicker__month-container')
                ).toBeVisible();

                await page.locator('.yearSelect .custom-dropdown-trigger').click();
                await page.getByText(ownershipData.createOwnership.cpYear, { exact: true }).click();

                await page.locator('.monthSelect .custom-dropdown-trigger').click();
                await page.getByText(ownershipData.createOwnership.cpMonth, { exact: true }).click();

                await page.getByRole('option', {
                    name: ownershipData.createOwnership.cpDay
                }).click();
                console.log('📅 CP Date filled');
            });

            // ── Step 9 — Set Status ────────────────────────────────
            await test.step('Set fixture status to Fixed', async () => {
                await page.getByText('On Subjectsarrow_drop_down').click();
                await page.getByRole('option', {
                    name: ownershipData.createOwnership.status
                }).click();
                console.log(`📋 Status set to: ${ownershipData.createOwnership.status}`);
            });

            // ── Step 10 — Set Billing Schedule and Period ──────────
            await test.step('Set Billing Schedule and Period', async () => {
                await page.getByText('Selectarrow_drop_down').nth(0).click();
                await page.getByRole('option', {
                    name: ownershipData.createOwnership.billingSchedule
                }).click();

                await page.getByText('Selectarrow_drop_down').nth(0).click();
                await page.getByRole('option', {
                    name: ownershipData.createOwnership.billingPeriod
                }).click();
                console.log('💰 Billing schedule and period set');
            });

            // ── Step 11 — Set Chartering and Operations Executive ──
            await test.step('Set Chartering and Operations Executive', async () => {
                await page.getByText('Selectarrow_drop_down').nth(0).click();
                await page.getByRole('option').first().click();

                await page.getByText('Selectarrow_drop_down').nth(0).click();
                await page.getByRole('option').first().click();
                console.log('👤 Executives assigned');
            });

            // ── Step 12 — Add Operation Expenses ──────────────────
            await test.step('Add first Operation Expense — Technical Management fee', async () => {
                await page.locator('div[role="gridcell"][col-id="type"]').dblclick();
                await page.locator('[role="option"]', {
                    hasText: ownershipData.createOwnership.expense1Type
                }).waitFor({ state: 'visible' });
                await page.getByRole('option', {
                    name: ownershipData.createOwnership.expense1Type
                }).click();

                await page.locator('div[role="gridcell"][col-id="hire_rate"]').click();
                await page.locator('div[role="gridcell"][col-id="hire_rate"] input').fill(
                    ownershipData.createOwnership.expense1Rate
                );
                await page.locator('button.inline-flex.items-center.justify-center').nth(1).click();
                console.log(`💰 Expense 1 added: ${ownershipData.createOwnership.expense1Type} — ${ownershipData.createOwnership.expense1Rate}`);
            });

            await test.step('Add second Operation Expense — Insurance', async () => {
                await page.locator('div[role="gridcell"][col-id="type"]').nth(1).click();
                await page.locator('[role="option"]', {
                    hasText: ownershipData.createOwnership.expense1Type
                }).waitFor({ state: 'visible' });
                await page.getByRole('option', {
                    name: ownershipData.createOwnership.expense2Type
                }).click();

                await page.locator('div[role="gridcell"][col-id="hire_rate"]').nth(1).click();
                await page.locator('div[role="gridcell"][col-id="hire_rate"] input').fill(
                    ownershipData.createOwnership.expense2Rate
                );
                console.log(`💰 Expense 2 added: ${ownershipData.createOwnership.expense2Type} — ${ownershipData.createOwnership.expense2Rate}`);
            });

            // ── Step 13 — Save and verify ──────────────────────────
            await test.step('Save and verify owned vessel created', async () => {
                await page.getByRole('button', { name: 'Save' }).click();
                await expect(
                    page.getByText('Owned vessel created successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Owned vessel created successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Create Owned Vessel — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 2 — Edit Ownership ────────────────────────────────
    test(
        'Should edit Owned Vessel successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Edit Owned Vessel');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open first owned vessel ───────────────────
            await test.step('Open first owned vessel from the list', async () => {
                await page.getByRole('gridcell').first().click();
                await page.waitForTimeout(5000);
                console.log('📂 Owned vessel opened');
            });

            // ── Step 2 — Update duration and save ─────────────────
            await test.step('Update minimum and maximum duration', async () => {
                await page.locator('#minimum_duration').fill(
                    ownershipData.editOwnership.minimumDuration
                );
                await page.locator('#maximum_duration').fill(
                    ownershipData.editOwnership.maximumDuration
                );
                console.log(`✏️  Min Duration: ${ownershipData.editOwnership.minimumDuration}`);
                console.log(`✏️  Max Duration: ${ownershipData.editOwnership.maximumDuration}`);
            });

            // ── Step 3 — Verify update ─────────────────────────────
            await test.step('Save and verify owned vessel updated', async () => {
                await page.getByRole('button', { name: 'Update' }).click();
                await expect(
                    page.getByText('Owned vessel updated successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Owned vessel updated successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Edit Owned Vessel — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 3 — Delete Ownership (Skipped) ───────────────────
    // Note: Skipped to preserve ownership data for other tests.
    // Remove skip when ownership deletion needs to be verified.
    test.skip(
        'Should delete Owned Vessel successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Delete Owned Vessel');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open and delete owned vessel ──────────────
            await test.step('Open first owned vessel and initiate deletion', async () => {
                await page.getByRole('gridcell').first().click();
                await page.waitForTimeout(5000);
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'Delete' }).click();
                await page.getByRole('button', { name: 'Yes' }).click();
                console.log('🗑️  Owned vessel deletion initiated');
            });

            // ── Step 2 — Verify deletion ───────────────────────────
            await test.step('Verify owned vessel deleted successfully', async () => {
                await expect(
                    page.getByText('Owned vessel deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Owned vessel deleted successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Delete Owned Vessel — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});

// ============================================================
// CLEANUP — Delete Technical Manager and Owner (Skipped)
// Note: Skipped pending full team member onboarding flow.
//       Remove skip when cleanup flow is ready to run.
// ============================================================
test.describe.skip('Delete Technical Manager and Owner @marlo @chartering @ownership @cleanup', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);
        await page.getByText('account_balanceBanking').click();
        await page.getByRole('link', { name: 'Contacts' }).click();
        await page.waitForSelector('.ag-center-cols-container .ag-row', { timeout: 80000 });
        console.log('📍 Navigated to Banking → Contacts');
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Delete Technical Manager ───────────────────────────────
    test(
        'Should delete Technical Manager contact successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test         : Delete Technical Manager');
            console.log(`🔧 Tech Manager : ${uniqueTechManagerName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            await test.step('Find and delete Technical Manager contact', async () => {
                await page.reload();
                await expect(
                    page.getByRole('heading', { level: 1, name: 'Contacts' })
                ).toBeVisible();
                await page.waitForSelector('[col-id="name"] .ag-cell-value');
                await expect(
                    page.locator('[col-id="name"] .ag-cell-value')
                        .filter({ hasText: uniqueTechManagerName }).first()
                ).toBeVisible({ timeout: 20000 });
                await page.locator('[col-id="name"] .ag-cell-value')
                    .filter({ hasText: uniqueTechManagerName }).first().click();
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'delete Delete vendor' }).click();
                await page.getByRole('button', { name: 'Yes' }).click();
                await expect(
                    page.getByText('Contact deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Technical Manager deleted successfully');
            });
        }
    );

    // ── Delete Owner ───────────────────────────────────────────
    test(
        'Should delete Owner contact successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test  : Delete Owner Contact');
            console.log(`👤 Owner : ${uniqueOwnerName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            await test.step('Find and delete Owner contact', async () => {
                await page.reload();
                await expect(
                    page.getByRole('heading', { level: 1, name: 'Contacts' })
                ).toBeVisible();
                await page.waitForSelector('[col-id="name"] .ag-cell-value');
                await expect(
                    page.locator('[col-id="name"] .ag-cell-value')
                        .filter({ hasText: uniqueOwnerName }).first()
                ).toBeVisible({ timeout: 20000 });
                await page.locator('[col-id="name"] .ag-cell-value')
                    .filter({ hasText: uniqueOwnerName }).first().click();
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'delete Delete vendor' }).click();
                await page.getByRole('button', { name: 'Yes' }).click();
                await expect(
                    page.getByText('Contact deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Owner contact deleted successfully');
            });
        }
    );

});
