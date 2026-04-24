// ============================================================
// Test Suite  : Cards
// Description : Covers Company Card and Employee Card flows
//               including Create, Edit and Freeze/Unfreeze.
//               Uses a separate Cards account with pre-configured
//               team members for card assignment.
// Note        : These tests use a different account from Banking
//               (CARDS_EMAIL) as card automation requires a
//               specific account setup with team members.
// Tags        : @banking @cards
// ============================================================

import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../../../../utils/login-helper';
import bankingData from '../../../../test-data/banking/banking.json';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — Create must run before Edit and Freeze
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

// ============================================================
// COMPANY CARD FLOW
// ============================================================
test.describe('Company Card Flow @banking @cards @companycard', () => {

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginAs(page, 'cards');
        await page.getByText('account_balanceBanking').click();
        await page.getByRole('link', { name: 'Cards' }).click();
        console.log('📍 Navigated to Banking → Cards');
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Create Company Card ──────────────────────────
    test(
        'Should create Company Card successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Create Company Card');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Initiate card creation ────────────────────
            await test.step('Click Create card and select Company Card type', async () => {
                await page.getByRole('button', { name: 'Create card' }).click();
                await page.getByText(
                    'Virtual cards for shared team purchases such as subscriptions or office supplies'
                ).click();
                console.log('➕ Company Card type selected');
            });

            // ── Step 2 — Fill card purpose and details ─────────────
            await test.step('Fill card purpose, nickname and spending limit', async () => {
                await page.locator('input[role="combobox"]#config-card-purpose-input').click();
                await page.locator('text=Business Expenses').click();
                await page.getByPlaceholder('Create a nickname for the card').fill(
                    bankingData.companyCard.nickName
                );
                await page.getByPlaceholder('Enter card limit').fill(
                    bankingData.companyCard.amount
                );
                await page.locator('input[role="combobox"]#-input').click();
                await page.locator('text=Monthly').click();
                await page.waitForTimeout(3000);
                await page.getByRole('button', { name: 'Next' }).click();
                console.log(`✏️  Card nickname: ${bankingData.companyCard.nickName} | Limit: ${bankingData.companyCard.amount}`);
            });

            // ── Step 3 — Assign contact and create ─────────────────
            await test.step('Assign contact and submit card creation', async () => {
                await page.locator('#create-card-contacts-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.locator('.react-select__menu-list').first().click();
                await page.getByRole('button', { name: 'Create card' }).click();

                // Wait for GraphQL API response
                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;
                console.log('📤 Card creation submitted');
            });

            // ── Step 4 — Verify card created ───────────────────────
            await test.step('Verify Company Card created successfully', async () => {
                await expect(
                    page.getByText('Card Created successfully')
                ).toBeVisible({ timeout: 50000 });
                await expect(
                    page.getByText('You have successfully created a company card!')
                ).toBeVisible();
                console.log('✅ Company Card created successfully');
            });

            // ── Step 5 — View card details ─────────────────────────
            await test.step('View card and card details', async () => {
                await page.getByRole('button', { name: 'View card' }).click();
                await page.getByRole('button', { name: 'View card details' }).click();
                console.log('👁️  Card details viewed successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Create Company Card — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 2 — Edit Company Card ────────────────────────────
    test(
        'Should edit Company Card nickname successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Edit Company Card');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open Company Card ─────────────────────────
            await test.step('Navigate to Company Cards and open first card', async () => {
                await page.getByRole('button', { name: 'Company cards' }).click();
                await page.locator('div[role="gridcell"][col-id="Name"]').first().click();
                await page.waitForTimeout(3000);
                console.log('📂 Company Card opened');
            });

            // ── Step 2 — Open Edit Card dialog ─────────────────────
            await test.step('Open Edit Card option from Manage card menu', async () => {
                await page.getByRole('button', { name: 'Manage card' }).click();
                await page.getByRole('menuitem', { name: 'Edit card' }).click();
                console.log('✏️  Edit Card dialog opened');
            });

            // ── Step 3 — Update nickname ────────────────────────────
            await test.step('Update card nickname and save', async () => {
                await page.getByPlaceholder('Create a nickname for the card').fill(
                    bankingData.companyCard.updateName
                );
                await page.getByRole('button', { name: 'Save' }).click();

                // Wait for GraphQL API response
                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;
                console.log(`✏️  Card nickname updated to: ${bankingData.companyCard.updateName}`);
            });

            // ── Step 4 — Verify update ─────────────────────────────
            await test.step('Verify Company Card updated successfully', async () => {
                await expect(
                    page.getByText('Card updated successfully')
                ).toBeVisible({ timeout: 50000 });
                console.log('✅ Company Card nickname updated successfully');
                await page.waitForTimeout(3000);
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Edit Company Card — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 3 — Freeze and Unfreeze Company Card ─────────────
    test(
        'Should freeze and unfreeze Company Card successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Freeze / Unfreeze Company Card');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open Company Card ─────────────────────────
            await test.step('Navigate to Company Cards and open first card', async () => {
                await page.getByRole('button', { name: 'Company cards' }).click();
                await page.locator('div[role="gridcell"][col-id="Name"]').first().click();
                await page.waitForTimeout(3000);
                console.log('📂 Company Card opened');
            });

            // ── Step 2 — Freeze card ───────────────────────────────
            await test.step('Freeze the Company Card', async () => {
                await page.getByRole('button', { name: 'Manage card' }).click();
                await page.getByRole('menuitem', { name: 'Freeze card' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Card updated successfully')
                ).toBeVisible({ timeout: 50000 });
                await page.waitForTimeout(3000);
                console.log('🧊 Company Card frozen successfully');
            });

            // ── Step 3 — Unfreeze card ─────────────────────────────
            await test.step('Unfreeze the Company Card', async () => {
                await page.getByRole('button', { name: 'Manage card' }).click();
                await page.getByRole('menuitem', { name: 'Unfreeze card' }).click();

                await expect(
                    page.getByText('Card updated successfully')
                ).toBeVisible({ timeout: 50000 });
                await page.waitForTimeout(3000);
                console.log('🔥 Company Card unfrozen successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Freeze / Unfreeze Company Card — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});

// ============================================================
// EMPLOYEE CARD FLOW
// ============================================================
test.describe('Employee Card Flow @banking @cards @employeecard', () => {

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginAs(page, 'cards');
        await page.getByText('account_balanceBanking').click();
        await page.getByRole('link', { name: 'Cards' }).click();
        console.log('📍 Navigated to Banking → Cards');
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Create Employee Card ─────────────────────────
    test(
        'Should create Employee Card successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Create Employee Card');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Initiate card creation ────────────────────
            await test.step('Click Create card and select Employee Card type', async () => {
                await page.getByRole('button', { name: 'Create card' }).click();
                await page.getByText(
                    'Virtual cards for individual employee purchases such as travel or employee benefits'
                ).click();
                console.log('➕ Employee Card type selected');
            });

            // ── Step 2 — Assign employee contact ───────────────────
            await test.step('Assign employee contact', async () => {
                await page.locator('#create-card-contacts-input').click();
                await page.locator('.react-select__menu-list').waitFor({ state: 'visible' });
                await page.locator('.react-select__menu-list').first().click();
                await page.getByRole('button', { name: 'Next' }).click();
                console.log('👤 Employee contact assigned');
            });

            // ── Step 3 — Fill card details ─────────────────────────
            await test.step('Fill card nickname and spending limit', async () => {
                await page.getByPlaceholder('Create a nickname for the card').fill(
                    bankingData.employeeCard.nickName
                );
                await page.getByPlaceholder('Enter card limit').fill(
                    bankingData.employeeCard.amount
                );
                await page.locator('input[role="combobox"]#-input').click();
                await page.locator('text=Monthly').click();
                await page.waitForTimeout(3000);
                await page.getByRole('button', { name: 'Create card' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;
                console.log(`✏️  Card nickname: ${bankingData.employeeCard.nickName} | Limit: ${bankingData.employeeCard.amount}`);
            });

            // ── Step 4 — Verify card created ───────────────────────
            await test.step('Verify Employee Card created successfully', async () => {
                await expect(
                    page.getByText('Card Created successfully')
                ).toBeVisible({ timeout: 50000 });
                await expect(
                    page.getByText('You have successfully created an employee card!')
                ).toBeVisible();
                console.log('✅ Employee Card created successfully');
            });

            // ── Step 5 — View card details ─────────────────────────
            await test.step('View card and card details', async () => {
                await page.getByRole('button', { name: 'View card' }).click();
                await page.getByRole('button', { name: 'View card details' }).click();
                console.log('👁️  Card details viewed successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Create Employee Card — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 2 — Edit Employee Card ───────────────────────────
    test(
        'Should edit Employee Card nickname successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Edit Employee Card');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open Employee Card ────────────────────────
            await test.step('Navigate to Employee Cards and open first card', async () => {
                await page.getByRole('button', { name: 'Employee cards' }).click();
                await page.locator('div[role="gridcell"][col-id="Name"]').first().click();
                await page.waitForTimeout(3000);
                console.log('📂 Employee Card opened');
            });

            // ── Step 2 — Open Edit Card dialog ─────────────────────
            await test.step('Open Edit Card option from Manage card menu', async () => {
                await page.getByRole('button', { name: 'Manage card' }).click();
                await page.getByRole('menuitem', { name: 'Edit card' }).click();
                console.log('✏️  Edit Card dialog opened');
            });

            // ── Step 3 — Update nickname ────────────────────────────
            await test.step('Update card nickname and save', async () => {
                await page.getByPlaceholder('Create a nickname for the card').fill(
                    bankingData.employeeCard.updateName
                );
                await page.getByRole('button', { name: 'Save' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;
                console.log(`✏️  Card nickname updated to: ${bankingData.employeeCard.updateName}`);
            });

            // ── Step 4 — Verify update ─────────────────────────────
            await test.step('Verify Employee Card updated successfully', async () => {
                await expect(
                    page.getByText('Card updated successfully')
                ).toBeVisible({ timeout: 50000 });
                console.log('✅ Employee Card nickname updated successfully');
                await page.waitForTimeout(3000);
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Edit Employee Card — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 3 — Freeze and Unfreeze Employee Card ────────────
    test(
        'Should freeze and unfreeze Employee Card successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Freeze / Unfreeze Employee Card');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open Employee Card ────────────────────────
            await test.step('Navigate to Employee Cards and open first card', async () => {
                await page.getByRole('button', { name: 'Employee cards' }).click();
                await page.locator('div[role="gridcell"][col-id="Name"]').first().click();
                await page.waitForTimeout(3000);
                console.log('📂 Employee Card opened');
            });

            // ── Step 2 — Freeze card ───────────────────────────────
            await test.step('Freeze the Employee Card', async () => {
                await page.getByRole('button', { name: 'Manage card' }).click();
                await page.getByRole('menuitem', { name: 'Freeze card' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Card updated successfully')
                ).toBeVisible({ timeout: 50000 });
                await page.waitForTimeout(3000);
                console.log('🧊 Employee Card frozen successfully');
            });

            // ── Step 3 — Unfreeze card ─────────────────────────────
            await test.step('Unfreeze the Employee Card', async () => {
                await page.getByRole('button', { name: 'Manage card' }).click();
                await page.getByRole('menuitem', { name: 'Unfreeze card' }).click();

                await expect(
                    page.getByText('Card updated successfully')
                ).toBeVisible({ timeout: 50000 });
                await page.waitForTimeout(3000);
                console.log('🔥 Employee Card unfrozen successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Freeze / Unfreeze Employee Card — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});
