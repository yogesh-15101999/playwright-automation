// ============================================================
// Test Suite  : Settings — Business Profile
// Description : Covers editing the Business Profile section
//               in Settings. Randomly selects Maritime Segment,
//               Number of Employees and Monthly Revenue, and
//               fills a generated website URL.
// Tags        : @marlo @settings @businessprofile
// ============================================================

import { test, expect } from '@playwright/test';
import { loginWithActiveUser, logout } from '../../../../utils/login-helper';
import { faker } from '@faker-js/faker';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — single test with multiple steps
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

test.describe('Settings — Business Profile @marlo @settings @businessprofile', () => {

    // ── Login and navigate to Business Profile ─────────────────
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);
        await page.locator('li.ps-menuitem-root a[href="/settings"]').click();
        await page.getByRole('button', { name: 'Business profile' }).click();
        console.log('📍 Navigated to Settings → Business Profile');
    });

    // ── Logout after each test ─────────────────────────────────
    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Edit Business Profile ────────────────────────
    test(
        'Should edit Business Profile successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Edit Business Profile');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Click Edit button ─────────────────────────
            await test.step('Click Edit button and verify Save is disabled', async () => {
                await page.getByRole('button', { name: 'Edit' }).nth(1).click();
                await expect(
                    page.getByRole('button', { name: 'Save' })
                ).toBeDisabled();
                console.log('✏️  Edit mode activated — Save button disabled ✅');
            });

            // ── Step 2 — Select Maritime Segment ───────────────────
            await test.step('Select a random Maritime Segment', async () => {
                const maritimeInput = page.locator('#react-select-2-input');
                await maritimeInput.click();

                const maritimeOptions = page.locator(
                    '#react-select-2-listbox [role="option"]'
                );
                await expect(maritimeOptions.first()).toBeVisible();

                const count = await maritimeOptions.count();
                const randomIndex = Math.floor(Math.random() * count);
                const selectedValue = await maritimeOptions.nth(randomIndex).innerText();
                await maritimeOptions.nth(randomIndex).click();

                console.log(`🚢 Maritime Segment selected: ${selectedValue}`);
            });

            // ── Step 3 — Select Number of Employees ────────────────
            await test.step('Select a random Number of Employees', async () => {
                const employeeInput = page.locator('#react-select-6-input');
                await employeeInput.click();

                const employeeOptions = page.locator(
                    '#react-select-6-listbox [role="option"]'
                );
                await expect(employeeOptions.first()).toBeVisible();

                const count = await employeeOptions.count();
                const randomIndex = Math.floor(Math.random() * count);
                const selectedValue = await employeeOptions.nth(randomIndex).innerText();
                await employeeOptions.nth(randomIndex).click();

                console.log(`👥 Number of Employees selected: ${selectedValue}`);
            });

            // ── Step 4 — Select Monthly Revenue ────────────────────
            await test.step('Select a random Monthly Revenue range', async () => {
                const revenueInput = page.locator('#react-select-7-input');
                await revenueInput.click();

                const revenueOptions = page.locator(
                    '#react-select-7-listbox [role="option"]'
                );
                await expect(revenueOptions.first()).toBeVisible();

                const count = await revenueOptions.count();
                const randomIndex = Math.floor(Math.random() * count);
                const selectedValue = await revenueOptions.nth(randomIndex).innerText();
                await revenueOptions.nth(randomIndex).click();

                console.log(`💰 Monthly Revenue selected: ${selectedValue}`);
            });

            // ── Step 5 — Enter Website URL ─────────────────────────
            await test.step('Enter a generated website URL', async () => {
                const website = faker.internet.url();
                await page.getByPlaceholder('https://example.com').fill(website);
                console.log(`🌐 Website entered: ${website}`);
            });

            // ── Step 6 — Save and verify ───────────────────────────
            await test.step('Verify Save button is enabled and save changes', async () => {
                await expect(
                    page.getByRole('button', { name: 'Save' })
                ).toBeEnabled();
                await page.getByRole('button', { name: 'Save' }).click();
                await expect(
                    page.getByText('Business profile updated sucessfully')
                ).toBeVisible({ timeout: 50000 });
                console.log('✅ Business Profile updated successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Edit Business Profile — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});