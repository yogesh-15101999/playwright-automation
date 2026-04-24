// ============================================================
// Test Suite  : Settings — Security
// Description : Covers password update flow in
//               Settings → Security. Changes password to a
//               temporary value, verifies login with new
//               password, then restores the original password.
//               This ensures the account is always left in
//               a clean state after the test runs.
// Tags        : @marlo @settings @security
// ============================================================

import { test, expect } from '@playwright/test';
import { loginWithActiveUser, logout } from '../../../../utils/login-helper';
import settingsData from '../../../../test-data/marlo/settings.json';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — password change steps must run in order
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────────────────────
// Passwords
// Current password is read from .env (single source of truth)
// New password is temporary — always restored after test
// ─────────────────────────────────────────────────────────────
const CURRENT_PASSWORD = process.env.MARLO_PASSWORD!;
const TEMP_PASSWORD = settingsData.security.newPassword;

test.describe('Settings — Security @marlo @settings @security', () => {

    // ── Login and navigate to Security ─────────────────────────
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);
        await page.locator('li.ps-menuitem-root a[href="/settings"]').click();
        await page.getByRole('button', { name: 'Security' }).click();
        console.log('📍 Navigated to Settings → Security');
    });

    // ── No afterEach logout — Security test handles its own ────
    // logout since it changes password mid-test and needs to
    // re-login with the new password to restore it

    // ── Test 1 — Change Password and Restore ──────────────────
    test(
        'Should change password and restore original successfully @smoke',
        async ({ page }) => {
            test.setTimeout(180000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Change Password and Restore');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Change to temporary password ──────────────
            await test.step('Change password to temporary password', async () => {
                await page.getByRole('button', { name: 'Update' }).click();
                await page.locator('#currentPassword').fill(CURRENT_PASSWORD);
                await page.locator('#newPassword').fill(TEMP_PASSWORD);
                await page.locator('#confirmPassword').fill(TEMP_PASSWORD);
                await page.getByRole('button', { name: 'Update password' }).click();

                await expect(
                    page.getByText('Password updated successfully.')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForURL('/', { timeout: 30000 });
                console.log('🔑 Password changed to temporary password successfully');
            });

            // ── Step 2 — Login with temporary password ─────────────
            await test.step('Login with temporary password', async () => {
                const user = await import('../../../../utils/auth-helper').then(
                    m => m.getActiveUser()
                );

                await page.locator('#email').fill(user.email);
                await page.locator('#password').fill(TEMP_PASSWORD);

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await page.getByRole('button', { name: 'Login' }).click();
                await responsePromise;

                console.log('✅ Logged in with temporary password successfully');
            });

            // ── Step 3 — Navigate to Security settings ─────────────
            await test.step('Navigate back to Security settings', async () => {
                await page.locator('li.ps-menuitem-root a[href="/settings"]').click();
                await page.getByRole('button', { name: 'Security' }).click();
                console.log('📍 Navigated back to Settings → Security');
            });

            // ── Step 4 — Restore original password ─────────────────
            await test.step('Restore original password', async () => {
                await page.getByRole('button', { name: 'Update' }).click();
                await page.locator('#currentPassword').fill(TEMP_PASSWORD);
                await page.locator('#newPassword').fill(CURRENT_PASSWORD);
                await page.locator('#confirmPassword').fill(CURRENT_PASSWORD);
                await page.getByRole('button', { name: 'Update password' }).click();

                await expect(
                    page.getByText('Password updated successfully.')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForURL('/', { timeout: 30000 });
                console.log('🔑 Original password restored successfully');
            });

            // ── Step 5 — Verify login with original password ───────
            await test.step('Verify login with original password works', async () => {
                const user = await import('../../../../utils/auth-helper').then(
                    m => m.getActiveUser()
                );

                await page.locator('#email').fill(user.email);
                await page.locator('#password').fill(CURRENT_PASSWORD);

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await page.getByRole('button', { name: 'Login' }).click();
                await responsePromise;

                await page.waitForTimeout(5000);
                console.log('✅ Original password verified — login successful');
            });

            // ── Step 6 — Final logout ──────────────────────────────
            await test.step('Logout after password restoration', async () => {
                await logout(page);
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Change Password and Restore — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});
