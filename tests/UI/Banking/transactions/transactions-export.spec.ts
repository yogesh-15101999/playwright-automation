// ============================================================
// Test Suite  : Transaction Exports
// Description : Covers export flows for Account Statement
//               and Balance Activity in PDF, CSV and Excel
//               formats from the Banking Transactions page.
// Tags        : @banking @export
// ============================================================

import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../../../../utils/login-helper';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — exports run one at a time to avoid API
// rate limiting on the slow QA backend
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

test.describe('Transaction Exports @banking @export', () => {

    // ── Login and navigate to Transactions before each test ────
    test.beforeEach(async ({ page }) => {
        await loginAs(page, 'banking');
        await page.getByText('account_balanceBanking').click();
        await page.getByRole('link', { name: 'Transactions' }).click();
        console.log('📍 Navigated to Banking → Transactions');
    });

    // ── Logout after each test ─────────────────────────────────
    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Export Account Statement as PDF ──────────────
    test(
        'Should export Account Statement as PDF successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Export Account Statement — PDF');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open export dialog ────────────────────────
            await test.step('Open export dialog', async () => {
                await page.getByRole('button', { name: 'download' }).click();
                console.log('📥 Export dialog opened');
            });

            // ── Step 2 — Select currency and format ────────────────
            await test.step('Select USD currency and PDF format', async () => {
                await page.getByText('Select currencies').click();
                await page.getByRole('option', { name: 'USD USD' }).click();
                await page.getByRole('radio', { name: 'PDF' }).check();
                console.log('💱 Currency: USD | Format: PDF selected');
            });

            // ── Step 3 — Download and verify ───────────────────────
            await test.step('Click Download and verify PDF file is downloaded', async () => {
                const downloadPromise = page.waitForEvent('download');

                // Wait for GraphQL API response before proceeding
                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );

                await page.getByRole('button', { name: 'Download' }).click();
                await responsePromise;

                const download = await downloadPromise;
                expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
                console.log(`📄 Downloaded file: ${download.suggestedFilename()}`);
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Export Account Statement PDF — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 2 — Export Balance Activity as PDF ───────────────
    test(
        'Should export Balance Activity Statement as PDF successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Export Balance Activity Statement — PDF');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open export dialog ────────────────────────
            await test.step('Open export dialog', async () => {
                await page.getByRole('button', { name: 'download' }).click();
                console.log('📥 Export dialog opened');
            });

            // ── Step 2 — Select statement type, currency and format ─
            await test.step('Select Balance Activity Statement, USD currency and PDF format', async () => {
                await page.getByText('arrow_drop_down').nth(2).click();
                await page.getByRole('option', { name: 'Balance activity statement' }).click();
                await page.getByText('Select currencyarrow_drop_down').click();
                await page.getByRole('option', { name: 'USD USD' }).click();
                await page.getByRole('radio', { name: 'PDF' }).check();
                console.log('💱 Type: Balance Activity | Currency: USD | Format: PDF selected');
            });

            // ── Step 3 — Download and verify ───────────────────────
            await test.step('Click Download and verify PDF file is downloaded', async () => {
                const downloadPromise = page.waitForEvent('download');

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );

                await page.getByRole('button', { name: 'Download' }).click();
                await responsePromise;

                const download = await downloadPromise;
                expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
                console.log(`📄 Downloaded file: ${download.suggestedFilename()}`);
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Export Balance Activity Statement PDF — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 3 — Export Balance Activity as CSV ───────────────
    test(
        'Should export Balance Activity Statement as CSV successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Export Balance Activity Statement — CSV');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open export dialog ────────────────────────
            await test.step('Open export dialog', async () => {
                await page.getByRole('button', { name: 'download' }).click();
                console.log('📥 Export dialog opened');
            });

            // ── Step 2 — Select statement type, currency and format ─
            await test.step('Select Balance Activity Statement, USD currency and CSV format', async () => {
                await page.getByText('arrow_drop_down').nth(2).click();
                await page.getByRole('option', { name: 'Balance activity statement' }).click();
                await page.getByText('Select currencyarrow_drop_down').click();
                await page.getByRole('option', { name: 'USD USD' }).click();
                await page.getByRole('radio', { name: 'CSV' }).first().check();
                console.log('💱 Type: Balance Activity | Currency: USD | Format: CSV selected');
            });

            // ── Step 3 — Download and verify ───────────────────────
            await test.step('Click Download and verify CSV file is downloaded', async () => {
                const downloadPromise = page.waitForEvent('download');

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );

                await page.getByRole('button', { name: 'Download' }).click();
                await responsePromise;

                const download = await downloadPromise;
                expect(download.suggestedFilename()).toMatch(/\.csv$/i);
                console.log(`📄 Downloaded file: ${download.suggestedFilename()}`);
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Export Balance Activity Statement CSV — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 4 — Export Balance Activity as Excel ─────────────
    test(
        'Should export Balance Activity Statement as Excel successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Export Balance Activity Statement — Excel');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open export dialog ────────────────────────
            await test.step('Open export dialog', async () => {
                await page.getByRole('button', { name: 'download' }).click();
                console.log('📥 Export dialog opened');
            });

            // ── Step 2 — Select statement type, currency and format ─
            await test.step('Select Balance Activity Statement, USD currency and Excel format', async () => {
                await page.getByText('arrow_drop_down').nth(2).click();
                await page.getByRole('option', { name: 'Balance activity statement' }).click();
                await page.getByText('Select currencyarrow_drop_down').click();
                await page.getByRole('option', { name: 'USD USD' }).click();
                await page.getByRole('radio', { name: 'Excel' }).check();
                console.log('💱 Type: Balance Activity | Currency: USD | Format: Excel selected');
            });

            // ── Step 3 — Download and verify ───────────────────────
            await test.step('Click Download and verify Excel file is downloaded', async () => {
                const downloadPromise = page.waitForEvent('download');

                const responsePromise = page.waitForResponse(
                    (response) =>
                        response.url() === process.env.MARLO_API_URL! &&
                        response.status() === 200
                );

                await page.getByRole('button', { name: 'Download' }).click();
                await responsePromise;

                const download = await downloadPromise;
                expect(download.suggestedFilename()).toMatch(/\.(xls|xlsx)$/i);
                console.log(`📄 Downloaded file: ${download.suggestedFilename()}`);
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Export Balance Activity Statement Excel — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});
