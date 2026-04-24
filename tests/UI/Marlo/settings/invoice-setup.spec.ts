// ============================================================
// Test Suite  : Settings — Invoice Setup
// Description : Covers Invoice Setup flows in Settings.
//               Includes Company Logo upload/remove and
//               Invoice Address update flows.
// Tags        : @marlo @settings @invoicesetup
// ============================================================

import { test, expect } from '@playwright/test';
import { loginWithActiveUser, logout } from '../../../../utils/login-helper';
import settingsData from '../../../../test-data/marlo/settings.json';
import path from 'path';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — Logo must run before Address update
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────────────────────
// File path for company logo upload — relative to project root
// ─────────────────────────────────────────────────────────────
const LOGO_FILE_PATH = path.resolve('test-data/files/company-logo.jpg');

// ============================================================
// INVOICE LOGO — Upload and Remove
// ============================================================
test.describe('Settings — Invoice Logo @marlo @settings @invoicesetup @logo', () => {

    // ── Login and navigate to Invoice Setup ────────────────────
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);
        await page.locator('li.ps-menuitem-root a[href="/settings"]').click();
        await page.getByRole('button', { name: 'Invoice setup' }).click();
        console.log('📍 Navigated to Settings → Invoice Setup');
    });

    // ── Logout after each test ─────────────────────────────────
    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Upload and Remove Company Logo ────────────────
    test(
        'Should upload and remove Company Logo successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Upload and Remove Company Logo');
            console.log(`📄 File : ${LOGO_FILE_PATH}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Upload company logo ───────────────────────
            await test.step('Upload company logo file', async () => {
                await page.waitForTimeout(3000);

                const [fileChooser] = await Promise.all([
                    page.waitForEvent('filechooser'),
                    page.getByRole('button', { name: 'Upload' }).click(),
                ]);
                await fileChooser.setFiles(LOGO_FILE_PATH);

                await page.getByRole('button', { name: 'Save' }).click();

                // Wait for GraphQL API response
                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Company logo updated successfully')
                ).toBeVisible({ timeout: 50000 });
                await page.waitForTimeout(5000);
                console.log('✅ Company logo uploaded successfully');
            });

            // ── Step 2 — Remove company logo ───────────────────────
            await test.step('Remove company logo', async () => {
                await page.waitForTimeout(3000);
                await page.getByRole('button', { name: 'Remove' }).click();

                // Wait for GraphQL API response
                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Company logo removed successfully')
                ).toBeVisible({ timeout: 50000 });
                await page.waitForTimeout(3000);
                console.log('✅ Company logo removed successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Upload and Remove Company Logo — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});

// ============================================================
// INVOICE ADDRESS — Update
// ============================================================
test.describe('Settings — Invoice Address @marlo @settings @invoicesetup @address', () => {

    // ── Login and navigate to Invoice Setup ────────────────────
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);
        await page.locator('li.ps-menuitem-root a[href="/settings"]').click();
        await page.getByRole('button', { name: 'Invoice setup' }).click();
        console.log('📍 Navigated to Settings → Invoice Setup');
    });

    // ── Logout after each test ─────────────────────────────────
    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Update Invoice Address ───────────────────────
    test(
        'Should update Invoice Address successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Update Invoice Address');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Click Edit button ─────────────────────────
            await test.step('Click Edit button to open invoice address form', async () => {
                await page.waitForTimeout(3000);
                await page.getByRole('button', { name: ' Edit' }).nth(1).click();
                console.log('✏️  Invoice address edit form opened');
            });

            // ── Step 2 — Fill invoice address details ──────────────
            await test.step('Fill invoice address details', async () => {
                await page.locator('#website').fill(settingsData.invoiceSetup.website);
                await page.locator('#Address\\ line\\ 1').fill(settingsData.invoiceSetup.address);
                await page.locator('#City').fill(settingsData.invoiceSetup.city);
                await page.locator('#State').fill(settingsData.invoiceSetup.state);
                await page.locator('#Postcode').fill(settingsData.invoiceSetup.postCode);
                console.log('✏️  Invoice address details filled');
                console.log(`   Website  : ${settingsData.invoiceSetup.website}`);
                console.log(`   Address  : ${settingsData.invoiceSetup.address}`);
                console.log(`   City     : ${settingsData.invoiceSetup.city}`);
                console.log(`   State    : ${settingsData.invoiceSetup.state}`);
                console.log(`   Postcode : ${settingsData.invoiceSetup.postCode}`);
            });

            // ── Step 3 — Save and verify ───────────────────────────
            await test.step('Save invoice address and verify success', async () => {
                await page.getByRole('button', { name: 'Save' }).click();

                // Wait for GraphQL API response
                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Company details updated sucessfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Invoice address updated successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Update Invoice Address — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});
