// ============================================================
// Test Suite  : Settings — Notifications
// Description : Covers notification toggle settings in
//               Settings → Notifications. Toggles switches
//               on and off and verifies success message
//               after each change.
// Tags        : @marlo @settings @notifications
// ============================================================

import { test, expect } from '@playwright/test';
import { loginWithActiveUser, logout } from '../../../../utils/login-helper';

test.describe('Settings — Notifications @marlo @settings @notifications', () => {

    // ── Login and navigate to Notifications ────────────────────
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);
        await page.locator('li.ps-menuitem-root a[href="/settings"]').click();
        await page.getByRole('button', { name: 'Notifications' }).click();
        console.log('📍 Navigated to Settings → Notifications');
    });

    // ── Logout after each test ─────────────────────────────────
    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Update Notification Settings ─────────────────
    test(
        'Should update notification settings successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Update Notification Settings');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Toggle switches off ───────────────────────
            await test.step('Toggle first two notification switches off', async () => {
                await page.getByRole('switch').nth(0).click();
                await page.getByRole('switch').nth(1).click();
                await expect(
                    page.getByText('Notification settings updated successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('🔕 Notifications toggled off ✅');
            });

            // ── Step 2 — Toggle switches back on ───────────────────
            await test.step('Toggle first two notification switches back on', async () => {
                await page.getByRole('switch').nth(0).click();
                await page.getByRole('switch').nth(1).click();
                await expect(
                    page.getByText('Notification settings updated successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForTimeout(3000);
                console.log('🔔 Notifications toggled back on ✅');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Update Notification Settings — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});