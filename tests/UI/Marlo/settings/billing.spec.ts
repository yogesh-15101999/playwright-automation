// ============================================================
// Test Suite  : Settings — Billing
// Description : Covers billing details update flow in
//               Settings → Billing. Updates company name,
//               address and location details and verifies
//               the success message.
// Tags        : @marlo @settings @billing
// ============================================================

import { test, expect } from '@playwright/test';
import { loginWithActiveUser, logout } from '../../../../utils/login-helper';
import settingsData from '../../../../test-data/marlo/settings.json';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — single billing update test
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

test.describe('Settings — Billing @marlo @settings @billing', () => {

    // ── Login and navigate to Billing ──────────────────────────
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);
        await page.locator('li.ps-menuitem-root a[href="/settings"]').click();
        await page.getByRole('button', { name: 'Billing' }).click();
        console.log('📍 Navigated to Settings → Billing');
    });

    // ── Logout after each test ─────────────────────────────────
    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Update Billing Details ───────────────────────
    test(
        'Should update Billing details successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Update Billing Details');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Click Edit button ─────────────────────────
            await test.step('Click Edit button to open billing form', async () => {
                await page.waitForTimeout(3000);
                await page.locator('button.f-12-500-link:has-text("Edit")').click();
                console.log('✏️  Billing edit form opened');
            });

            // ── Step 2 — Fill billing details ──────────────────────
            await test.step('Fill billing company and address details', async () => {
                await page.getByPlaceholder('Enter company name').fill(
                    settingsData.billing.companyName
                );
                await page.locator('#address_line1').fill(
                    settingsData.billing.addressLine1
                );
                await page.locator('#address_line2').fill(
                    settingsData.billing.addressLine2
                );
                await page.getByPlaceholder('City').fill(settingsData.billing.city);
                await page.getByPlaceholder('State').fill(settingsData.billing.state);
                await page.locator('#postal_code').fill(settingsData.billing.postalCode);

                console.log(`✏️  Company   : ${settingsData.billing.companyName}`);
                console.log(`✏️  Address 1 : ${settingsData.billing.addressLine1}`);
                console.log(`✏️  Address 2 : ${settingsData.billing.addressLine2}`);
                console.log(`✏️  City      : ${settingsData.billing.city}`);
                console.log(`✏️  State     : ${settingsData.billing.state}`);
                console.log(`✏️  Post Code : ${settingsData.billing.postalCode}`);
            });

            // ── Step 3 — Save and verify ───────────────────────────
            await test.step('Save billing details and verify success', async () => {
                await page.getByRole('button', { name: 'Save' }).click();
                await expect(
                    page.getByText('Billing details updated successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Billing details updated successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Update Billing Details — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});
