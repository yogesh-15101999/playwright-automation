// ============================================================
// Test Suite  : Payout — Vendor (Main)
// Description : Covers the primary payout flow using a new
//               vendor beneficiary and an existing vendor.
//               This is the core payout test suite —
//               Customer and Lender payouts are additional
//               safety coverage built on top of this.
// Tags        : @banking @payout @vendor
// ============================================================

import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../../../../utils/login-helper';
import { fillOTP } from '../../../../utils/otp-helper';
import { getBeneficiaryFrame, getPayoutFrame } from '../../../../utils/iframe-helper';
import bankingData from '../../../../test-data/banking/banking.json';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — Payout 1 creates the vendor that Payout 2
// uses as an existing vendor. Delete runs last.
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

// Shared vendor name across tests in this file
let vendorName: string;

// ─────────────────────────────────────────────────────────────
// Helper — Pick random item from array
// ─────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// PAYOUT 1 — Create Payout with New Vendor Beneficiary
// ============================================================
test.describe('Payout with New Vendor @banking @payout @vendor @newbeneficiary', () => {

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginAs(page, 'banking');
        await page.getByText('account_balanceBanking').click();
        await page.getByRole('link', { name: 'Transactions' }).click();
        console.log('📍 Navigated to Banking → Transactions');
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    test(
        'Should create payout with a new vendor beneficiary successfully @smoke',
        async ({ page }) => {
            test.setTimeout(180000);

            vendorName = pickRandom(bankingData.vendor.companies);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test    : Payout with New Vendor');
            console.log(`🏢 Vendor  : ${vendorName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open Payout and add new vendor ────────────
            await test.step('Open Payout section and initiate new vendor creation', async () => {
                await page.getByRole('button', { name: 'Payout' }).nth(0).click();
                await page.getByRole('button', { name: 'Add new vendor' }).click();
                console.log('➕ New vendor creation initiated');
            });

            // ── Step 2 — Fill vendor details ──────────────────────
            await test.step('Fill vendor basic details', async () => {
                await page.locator('#name').fill(vendorName);
                await page.locator('#website').fill(bankingData.vendor.website);
                await page.locator('#vat_number').fill(bankingData.vendor.vat);
                await page.locator('#currency_id-input').fill(bankingData.vendor.currency);
                await page.getByRole('option', { name: 'USD' }).click();
                await page.locator('#public_notes').fill(bankingData.vendor.notes);
                await page.locator('#country_name-input').fill(bankingData.vendor.country);
                await page.keyboard.press('Enter');
                await page.locator('#state').fill(bankingData.vendor.state);
                await page.locator('#postal_code').fill(bankingData.vendor.postalCode);
                await page.locator('#city').fill(bankingData.vendor.city);
                await page.locator('#address1').fill(bankingData.vendor.address);
                await page.getByRole('button', { name: 'Save' }).click();
                await page.getByRole('button', { name: 'Add bank details' }).click();
                console.log(`✏️  Vendor details filled for: ${vendorName}`);
            });

            // ── Step 3 — Fill beneficiary bank details in iframe ───
            await test.step('Fill beneficiary bank details in secure iframe', async () => {
                const beneficiaryFrame = await getBeneficiaryFrame(page);

                await beneficiaryFrame
                    .getByTestId('beneficiary.bankDetails.bankCountryCode')
                    .getByText('Select recipient\'s bank').click();
                await beneficiaryFrame
                    .getByTestId('beneficiary.bankDetails.bankCountryCode')
                    .getByRole('combobox', { name: 'Select' })
                    .fill(bankingData.beneficiary.country);
                await beneficiaryFrame
                    .getByRole('option', { name: 'United States of America' }).click();
                await beneficiaryFrame.getByTestId('SWIFT').click();
                await beneficiaryFrame
                    .locator('[data-test="beneficiary.bankDetails.swiftCode"]')
                    .fill(bankingData.beneficiary.swiftCode);
                await beneficiaryFrame
                    .locator('[data-test="beneficiary.bankDetails.bankName"]')
                    .fill(bankingData.beneficiary.bankName);
                await beneficiaryFrame
                    .locator('[data-test="beneficiary.bankDetails.accountNumber"]')
                    .fill(bankingData.beneficiary.accountNumber);
                await beneficiaryFrame
                    .locator('[data-test="beneficiary.bankDetails.accountName"]')
                    .fill(vendorName);
                await beneficiaryFrame
                    .getByTestId('beneficiary.address.streetAddress')
                    .locator('div').filter({ hasText: 'Search...' }).nth(2).click();
                await beneficiaryFrame
                    .getByTestId('lookupInputSearchValue')
                    .getByRole('textbox', { name: 'Address' })
                    .fill(bankingData.beneficiary.address);
                await beneficiaryFrame.locator('#react-select-2-option-2').click();
                await page.waitForTimeout(2000);

                await page.getByRole('button', { name: 'Continue' }).click();
                await page.getByRole('radio', { name: 'Authenticator' }).check();
                await page.getByRole('button', { name: 'Continue' }).click();
                console.log('🏦 Beneficiary bank details filled successfully');
            });

            // ── Step 4 — Fill first OTP ────────────────────────────
            await test.step('Generate and fill first OTP for beneficiary verification', async () => {
                await fillOTP(page);
                await page.getByRole('button', { name: 'Continue' }).click();
                console.log('🔑 First OTP submitted');
            });

            // ── Step 5 — Fill payout details ──────────────────────
            await test.step('Fill payout amount and reference details', async () => {
                await page.getByRole('button', { name: 'Transfer to this recipient' }).click();

                const payoutFrame = await getPayoutFrame(page);

                await payoutFrame
                    .getByTestId('sourceCurrency')
                    .locator('div').filter({ hasText: 'EUR' }).nth(1).click();
                await payoutFrame
                    .getByRole('combobox', { name: 'You pay currency' })
                    .fill(bankingData.payout.currency);
                await payoutFrame
                    .getByRole('option', { name: 'US USD United States Dollar' }).click();
                await payoutFrame
                    .getByRole('textbox', { name: 'Recipient gets' })
                    .fill(bankingData.payout.amountVendor);
                await payoutFrame.getByText('Cover the intermediary and').click();
                await page.waitForTimeout(5000);

                const continueBtn = page.getByRole('button', { name: 'Continue' });
                await continueBtn.scrollIntoViewIfNeeded();
                await continueBtn.click();

                await page.locator('.react-select__input-container').click();
                await page.getByRole('option', { name: 'Business expense' }).click();

                const currentDate = new Date().toLocaleDateString();
                await page.getByRole('textbox', { name: 'Reference*' }).fill(
                    `${bankingData.payout.reference} ${currentDate}`
                );

                await page.getByRole('button', { name: 'Continue' }).click();
                await page.getByRole('button', { name: 'Continue' }).click();
                await page.getByRole('textbox', { name: 'Please enter OTP character 1' }).click();
                console.log(`💸 Payout amount: ${bankingData.payout.amountVendor} USD`);
            });

            // ── Step 6 — Fill second OTP ───────────────────────────
            await test.step('Generate and fill second OTP for payment confirmation', async () => {
                await fillOTP(page);
                await page.getByRole('button', { name: 'Continue' }).click();
                console.log('🔑 Second OTP submitted');
            });

            // ── Step 7 — Verify payment success ───────────────────
            await test.step('Verify payment created successfully', async () => {
                await expect(
                    page.getByText('Payment created successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.locator('button:has-text("Done")').click();

                // Verify transaction appears in the list
                await page.getByText('account_balanceBanking').click();
                await page.getByRole('link', { name: 'Transactions' }).click();
                await page.getByRole('gridcell', { name: vendorName }).first().click();
                await page.getByRole('button', { name: 'close' }).click();
                console.log('✅ Payment created and verified in transactions list');
                await page.waitForTimeout(3000);
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Payout with New Vendor — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});

// ============================================================
// PAYOUT 2 — Create Payout with Existing Vendor
// ============================================================
test.describe('Payout with Existing Vendor @banking @payout @vendor @existingbeneficiary', () => {

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginAs(page, 'banking');
        await page.getByText('account_balanceBanking').click();
        await page.getByRole('link', { name: 'Transactions' }).click();
        console.log('📍 Navigated to Banking → Transactions');
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    test(
        'Should create payout with an existing vendor successfully',
        async ({ page }) => {
            test.setTimeout(180000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Payout with Existing Vendor');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open Payout and select existing vendor ────
            await test.step('Open Payout section and select existing vendor', async () => {
                await page.getByRole('button', { name: 'Payout' }).nth(0).click();
                await page.getByRole('button', { name: 'person Existing vendor Select' }).click();
                await page.locator('.flex.justify-between.items-center.px-4').first().click();
                console.log('👤 Existing vendor selected');
            });

            // ── Step 2 — Fill payout amount in iframe ─────────────
            await test.step('Configure payout currency and amount in payout iframe', async () => {
                const payoutFrame = await getPayoutFrame(page);
                await page.waitForTimeout(5000);

                await payoutFrame
                    .getByTestId('sourceCurrency')
                    .locator('div').filter({ hasText: 'EUR' }).nth(1).click();
                await payoutFrame
                    .getByRole('combobox', { name: 'You pay currency' })
                    .fill(bankingData.payout.currency);
                await payoutFrame
                    .getByRole('option', { name: 'US USD United States Dollar' }).click();
                await payoutFrame
                    .getByRole('textbox', { name: 'Recipient gets' })
                    .fill(bankingData.payout.amountExisting);
                await payoutFrame.getByText('Cover the intermediary and').click();
                await page.waitForTimeout(5000);
                console.log(`💸 Payout amount: ${bankingData.payout.amountExisting} USD`);
            });

            // ── Step 3 — Fill reference and submit ────────────────
            await test.step('Fill payment reference and submit payout', async () => {
                const continueBtn = page.getByRole('button', { name: 'Continue' });
                await continueBtn.scrollIntoViewIfNeeded();
                await continueBtn.click();

                await page.locator('.react-select__input-container').click();
                await page.getByRole('option', { name: 'Business expense' }).click();

                const currentDate = new Date().toLocaleDateString();
                await page.getByRole('textbox', { name: 'Reference*' }).fill(
                    `${bankingData.payout.reference} ${currentDate}`
                );

                await page.getByRole('button', { name: 'Continue' }).click();
                await page.getByRole('button', { name: 'Continue' }).click();
                console.log('📝 Reference filled and submitted');
            });

            // ── Step 4 — Fill OTP ──────────────────────────────────
            await test.step('Generate and fill OTP for payment confirmation', async () => {
                await fillOTP(page);
                await page.getByRole('button', { name: 'Continue' }).click();
                console.log('🔑 OTP submitted');
            });

            // ── Step 5 — Verify payment success ───────────────────
            await test.step('Verify payment created successfully', async () => {
                await expect(
                    page.getByText('Payment created successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.locator('button:has-text("Done")').click();

                // Verify transaction appears in the list
                await page.getByText('account_balanceBanking').click();
                await page.getByRole('link', { name: 'Transactions' }).click();
                await page.getByRole('gridcell', { name: vendorName }).first().click();
                await page.getByRole('button', { name: 'close' }).click();
                console.log('✅ Payment created and verified in transactions list');
                await page.waitForTimeout(3000);
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Payout with Existing Vendor — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});

// ============================================================
// CLEANUP — Delete Beneficiary and Vendor
// ============================================================
test.describe('Delete Vendor Beneficiary and Contact @banking @vendor @delete', () => {

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginAs(page, 'banking');
        await page.getByText('account_balanceBanking').click();
        await page.getByRole('link', { name: 'Contacts' }).click();
        console.log('📍 Navigated to Banking → Contacts');
    });

    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Delete Beneficiary (Bank Details) ─────────────────────
    test(
        'Should delete vendor bank details successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Delete Vendor Bank Details');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Select beneficiary and initiate deletion ──
            await test.step('Select vendor contact and initiate bank details deletion', async () => {
                await page.getByRole('gridcell').first().click();
                await page.getByRole('button', { name: 'more_vert' }).click();
                await page.getByRole('menuitem', { name: 'Delete' }).click();
                await page.getByRole('button', { name: 'Yes' }).click();
                await page.getByRole('button', { name: 'Continue' }).click();
                console.log('🗑️  Bank details deletion initiated');
            });

            // ── Step 2 — Fill OTP ──────────────────────────────────
            await test.step('Fill OTP to confirm bank details deletion', async () => {
                await fillOTP(page);
                await page.getByRole('button', { name: 'Continue' }).click();
                console.log('🔑 OTP submitted for deletion');
            });

            // ── Step 3 — Verify deletion ───────────────────────────
            await test.step('Verify bank details deleted successfully', async () => {
                await expect(
                    page.getByText('Bank details deleted')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Vendor bank details deleted successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Delete Vendor Bank Details — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Delete Vendor Contact ──────────────────────────────────
    test(
        'Should delete vendor contact successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Delete Vendor Contact');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Select vendor and initiate deletion ───────
            await test.step('Select vendor contact and initiate deletion', async () => {
                await page.getByRole('gridcell').first().click();
                await page.getByRole('button', { name: 'More arrow_drop_down' }).click();
                await page.getByRole('menuitem', { name: 'delete Delete vendor' }).click();
                await page.getByRole('button', { name: /Yes|Proceed anyway/ }).click();
                console.log('🗑️  Vendor contact deletion initiated');
            });

            // ── Step 2 — Verify deletion ───────────────────────────
            await test.step('Verify vendor contact deleted successfully', async () => {
                await expect(
                    page.getByText('Contact deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Vendor contact deleted successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Delete Vendor Contact — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});
