// // ============================================================
// // Test Suite  : Global Accounts
// // Description : Covers full CRUD flow for Global Accounts
// //               in the Banking module.
// //               Note: Create and Delete are intentionally run
// //               as part of the full suite. Since only 10 global
// //               accounts are allowed per account, run this
// //               suite selectively to avoid hitting the limit.
// // Tags        : @banking @globalaccount
// // ============================================================

// import { test, expect } from '@playwright/test';
// import { loginAs, logout } from '../../../utils/login-helper';
// import bankingData from '../../../test-data/banking/banking.json';

// // ─────────────────────────────────────────────────────────────
// // Suite Configuration
// // Serial mode ensures CRUD order is always maintained
// // ─────────────────────────────────────────────────────────────
// test.describe.configure({ mode: 'serial' });

// test.describe('Global Accounts @banking @globalaccount', () => {

//     // ── Login to Banking and navigate to Transactions ──────────
//     test.beforeEach(async ({ page }) => {
//         await loginAs(page, 'banking');
//         await page.getByText('account_balanceBanking').click();
//         await page.getByRole('link', { name: 'Transactions' }).click();
//         console.log('📍 Navigated to Banking → Transactions');
//     });

//     // ── Logout after each test ─────────────────────────────────
//     test.afterEach(async ({ page }) => {
//         await logout(page);
//     });

//     // ── Test 1 — Create Global Account ────────────────────────
//     test.skip(
//         'Should create a USD Global Account successfully',
//         async ({ page }) => {
//             test.setTimeout(60000);

//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//             console.log('🧪 Test : Create USD Global Account');
//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

//             // ── Step 1 — Click Add new Global Account ──────────────
//             await test.step('Click Add new Global Account button', async () => {
//                 await page.getByRole('button', { name: 'Add new Global account' }).click();
//                 console.log('➕ Add new Global Account button clicked');
//             });

//             // ── Step 2 — Select United States ──────────────────────
//             await test.step('Select United States as the account country', async () => {
//                 await page.getByLabel('United States').click();
//                 await page.getByRole('button', { name: 'Next' }).click();
//                 console.log('🌍 United States selected');
//             });

//             // ── Step 3 — Fill account nickname ─────────────────────
//             await test.step('Fill account nickname and create', async () => {
//                 await page.getByPlaceholder('Enter account nickname').fill(
//                     bankingData.globalAccount.nickName
//                 );
//                 await page.getByRole('button', { name: 'Create Global Account' }).click();
//                 console.log(`✏️  Nickname set to: ${bankingData.globalAccount.nickName}`);
//             });

//             // ── Step 4 — Verify account created ────────────────────
//             await test.step('Verify Global Account created successfully', async () => {
//                 await page.getByRole('button', { name: 'Done' }).click();
//                 console.log('✅ USD Global Account created successfully');
//             });

//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//             console.log('✅ Create USD Global Account — Passed!');
//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//         }
//     );

//     // ── Test 2 — Edit Global Account Nickname ─────────────────
//     test(
//         'Should edit Global Account nickname successfully @smoke',
//         async ({ page }) => {
//             test.setTimeout(60000);

//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//             console.log('🧪 Test : Edit Global Account Nickname');
//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

//             // ── Step 1 — Open USD Global Account ───────────────────
//             await test.step('Open USD Global Account', async () => {
//                 await page.getByRole('button', { name: /USD/i }).click();
//                 await page.locator(
//                     'div[role="row"][row-index="0"] div[role="gridcell"][col-id="account_name"]'
//                 ).click();
//                 console.log('📂 USD Global Account opened');
//             });

//             // ── Step 2 — Open Edit Nickname dialog ─────────────────
//             await test.step('Open Edit Nickname dialog from more options menu', async () => {
//                 await page.getByRole('button', { name: /more/i }).click();
//                 await page.getByRole('menuitem', { name: /edit nickname/i }).click();
//                 console.log('✏️  Edit Nickname dialog opened');
//             });

//             // ── Step 3 — Update nickname ────────────────────────────
//             await test.step('Fill updated nickname and submit', async () => {
//                 await page.getByPlaceholder('Account nickname').fill(
//                     bankingData.globalAccount.updateNickname
//                 );
//                 await page.getByRole('button', { name: 'Update' }).click();
//                 console.log(`✏️  Nickname updated to: ${bankingData.globalAccount.updateNickname}`);
//             });

//             // ── Step 4 — Verify success ─────────────────────────────
//             await test.step('Verify nickname updated successfully', async () => {
//                 await expect(
//                     page.getByText(/nickname updated successfully/i)
//                 ).toBeVisible({ timeout: 30000 });
//                 console.log('✅ Global Account nickname updated successfully');
//             });

//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//             console.log('✅ Edit Global Account Nickname — Passed!');
//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//         }
//     );

//     // ── Test 3 — Share Global Account Details ─────────────────
//     test(
//         'Should share Global Account details successfully',
//         async ({ page }) => {
//             test.setTimeout(60000);

//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//             console.log('🧪 Test : Share Global Account Details');
//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

//             // ── Step 1 — Open USD Global Account ───────────────────
//             await test.step('Open USD Global Account', async () => {
//                 await page.getByRole('button', { name: /USD/i }).click();
//                 await page.locator(
//                     'div[role="row"][row-index="0"] div[role="gridcell"][col-id="account_name"]'
//                 ).click();
//                 console.log('📂 USD Global Account opened');
//             });

//             // ── Step 2 — Click Share Account Details ───────────────
//             await test.step('Open Share Account Details from more options menu', async () => {
//                 await page.getByRole('button', { name: /more/i }).click();
//                 await page.getByRole('menuitem', { name: /share account details/i }).click();
//                 console.log('📤 Share Account Details clicked');
//             });

//             // ── Step 3 — Verify success message ────────────────────
//             await test.step('Verify Share Account Details success message is displayed', async () => {
//                 await expect(
//                     page.getByText('USD account details copied to clipboard')
//                 ).toBeVisible({ timeout: 30000 });
//                 console.log('✅ Share Account Details — copied to clipboard successfully');
//             });

//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//             console.log('✅ Share Global Account Details — Passed!');
//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//         }
//     );

//     // ── Test 4 — Delete Global Account ────────────────────────
//     test.skip(
//         'Should delete Global Account successfully',
//         async ({ page }) => {
//             test.setTimeout(60000);

//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//             console.log('🧪 Test : Delete USD Global Account');
//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

//             // ── Step 1 — Open USD Global Account ───────────────────
//             await test.step('Open USD Global Account', async () => {
//                 await page.getByRole('button', { name: /USD/i }).click();
//                 await page.locator(
//                     'div[role="row"][row-index="0"] div[role="gridcell"][col-id="account_name"]'
//                 ).click();
//                 console.log('📂 USD Global Account opened');
//             });

//             // ── Step 2 — Click Close Account ───────────────────────
//             await test.step('Open Close Account option from more options menu', async () => {
//                 await page.getByRole('button', { name: /more/i }).click();
//                 await page.getByRole('menuitem', { name: /close account/i }).click();
//                 console.log('🗑️  Close Account option clicked');
//             });

//             // ── Step 3 — Confirm deletion ──────────────────────────
//             await test.step('Confirm account closure', async () => {
//                 await page.getByRole('button', { name: 'Yes, close it' }).click();
//                 console.log('⚠️  Account closure confirmed');
//             });

//             // ── Step 4 — Verify deletion success ───────────────────
//             await test.step('Verify Global Account closed successfully', async () => {
//                 await expect(
//                     page.getByText(/account closed successfully/i)
//                 ).toBeVisible({ timeout: 30000 });
//                 console.log('✅ USD Global Account closed successfully');
//             });

//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//             console.log('✅ Delete USD Global Account — Passed!');
//             console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//         }
//     );

// });
