// ============================================================
// Test Suite  : Settings — Manage Team
// Description : Covers team member management flows in
//               Settings → Manage Team. Includes Invite,
//               Edit role and Revoke invite flows.
//               Note: Custom Role test is skipped pending
//               further development of role permission setup.
// Tags        : @marlo @settings @manageteam
// ============================================================

import { test, expect } from '@playwright/test';
import { loginWithActiveUser, logout } from '../../../../utils/login-helper';
import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — Invite must run before Edit and Revoke
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────────────────────
// Path to save invited email for reuse across tests
// Stored in .auth/ folder consistent with project patterns
// ─────────────────────────────────────────────────────────────
const INVITED_EMAIL_PATH = path.join(process.cwd(), '.auth', 'invited-email.txt');

test.describe('Settings — Manage Team @marlo @settings @manageteam', () => {

    // ── Login and navigate to Manage Team ──────────────────────
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);
        await page.locator('li.ps-menuitem-root a[href="/settings"]').click();
        await page.getByRole('button', { name: 'Manage team' }).click();
        console.log('📍 Navigated to Settings → Manage Team');
    });

    // ── Logout after each test ─────────────────────────────────
    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Invite Team Member ────────────────────────────
    test(
        'Should invite a team member successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            const invitedEmail = faker.internet.email();

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test  : Invite Team Member');
            console.log(`📧 Email : ${invitedEmail}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open invite form ──────────────────────────
            await test.step('Click Team member button to open invite form', async () => {
                await page.getByRole('button', { name: 'Team member' }).nth(1).click();
                console.log('➕ Invite team member form opened');
            });

            // ── Step 2 — Fill email and send invite ────────────────
            await test.step('Fill email and send invite', async () => {
                await page.getByPlaceholder('Email ID').fill(invitedEmail);
                await page.getByRole('button', { name: 'Save' }).click();

                // Wait for GraphQL API response
                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;
                console.log('📤 Invite submitted');
            });

            // ── Step 3 — Verify invite sent ────────────────────────
            await test.step('Verify invite sent successfully', async () => {
                await expect(
                    page.getByText('Invite sent successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Invite sent successfully');
            });

            // ── Step 4 — Save invited email for subsequent tests ───
            await test.step('Save invited email to .auth/invited-email.txt', async () => {
                fs.mkdirSync(path.dirname(INVITED_EMAIL_PATH), { recursive: true });
                fs.writeFileSync(INVITED_EMAIL_PATH, invitedEmail);
                console.log(`💾 Invited email saved → ${INVITED_EMAIL_PATH}`);
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Invite Team Member — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 2 — Edit Invited Team Member ──────────────────────
    test(
        'Should edit invited team member role successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            // Read invited email saved from previous test
            const invitedEmail = fs.readFileSync(INVITED_EMAIL_PATH, 'utf-8').trim();

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test  : Edit Invited Team Member Role');
            console.log(`📧 Email : ${invitedEmail}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Find invited member and open edit ─────────
            await test.step('Find invited member row and click Edit', async () => {
                await page.locator('role=row').filter({ hasText: invitedEmail })
                    .getByRole('button').click();
                await page.getByRole('menuitem', { name: 'Edit' }).click();
                console.log(`✏️  Edit menu opened for: ${invitedEmail}`);
            });

            // ── Step 2 — Change role to Accountant ─────────────────
            await test.step('Change team member role to Accountant', async () => {
                await page.getByRole('combobox').first().click();
                await page.getByRole('option', { name: 'Accountant' }).click();
                console.log('👤 Role changed to Accountant');
            });

            // ── Step 3 — Save changes ──────────────────────────────
            await test.step('Save role changes and verify success', async () => {
                await page.getByRole('button', { name: 'Save' }).click();

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Successfully updated contact')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Team member role updated successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Edit Invited Team Member Role — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 3 — Revoke Team Member Invite ─────────────────────
    test(
        'Should revoke team member invite successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            // Read invited email saved from Invite test
            const invitedEmail = fs.readFileSync(INVITED_EMAIL_PATH, 'utf-8').trim();

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test  : Revoke Team Member Invite');
            console.log(`📧 Email : ${invitedEmail}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Find invited member and revoke ────────────
            await test.step('Find invited member row and click Revoke Invite', async () => {
                await page.locator('role=row').filter({ hasText: invitedEmail })
                    .getByRole('button').click();
                await page.getByRole('menuitem', { name: 'Revoke Invite' }).click();
                console.log(`🗑️  Revoke initiated for: ${invitedEmail}`);
            });

            // ── Step 2 — Wait for API and verify revoke ────────────
            await test.step('Verify invite revoked successfully', async () => {
                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );
                await responsePromise;

                await expect(
                    page.getByText('Invite revoked successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Invite revoked successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Revoke Team Member Invite — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 4 — Custom Role (Skipped) ─────────────────────────
    // Note: Skipped pending further development of role
    // permission setup. Remove skip when ready to implement.
    test.skip(
        'Should create a custom role successfully @customrole',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Create Custom Role');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Navigate to Roles tab ─────────────────────
            await test.step('Navigate to Roles tab', async () => {
                await page.getByRole('button', { name: 'Roles' }).click();
                console.log('📍 Navigated to Roles tab');
            });

            // ── Step 2 — Create new role ───────────────────────────
            await test.step('Click New role and fill role name', async () => {
                await page.getByRole('button', { name: 'New role' }).click();
                const roleName = `Custom Role ${Date.now()}`;
                await page.getByPlaceholder('Role name').fill(roleName);
                console.log(`✏️  Role name: ${roleName}`);
            });

            // ── Step 3 — Configure permissions ─────────────────────
            await test.step('Configure role permissions', async () => {
                await page.getByRole('row', { name: 'Overview -- -- --' })
                    .getByRole('checkbox').uncheck();
                await page.getByRole('row', { name: 'Finance --' })
                    .getByRole('checkbox').first().uncheck();
                await page.getByRole('row', { name: 'Finance --' })
                    .getByRole('checkbox').nth(1).uncheck();
                await page.getByRole('row', { name: 'Finance --' })
                    .getByRole('checkbox').nth(2).uncheck();
                await page.getByRole('row', { name: 'Operations -- -- --' })
                    .getByRole('checkbox').uncheck();
                console.log('⚙️  Permissions configured');
            });

            // ── Step 4 — Save and verify ───────────────────────────
            await test.step('Save role and verify creation', async () => {
                await expect(
                    page.getByRole('button', { name: 'Save' })
                ).toBeEnabled();
                await page.getByRole('button', { name: 'Save' }).click();
                await expect(
                    page.getByText('Role created successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForTimeout(3000);
                console.log('✅ Custom role created successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Create Custom Role — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});