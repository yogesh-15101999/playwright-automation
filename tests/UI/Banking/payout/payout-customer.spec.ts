// ============================================================
// Test Suite  : Payout — Customer
// Description : Covers payout flow using a new customer
//               beneficiary. This is additional safety
//               coverage on top of the core vendor payout.
//               Creates a customer contact, adds bank details,
//               completes payout and cleans up afterwards.
// Tags        : @banking @payout @customer
// ============================================================

import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../../../../utils/login-helper';
import { fillOTP } from '../../../../utils/otp-helper';
import { getBeneficiaryFrame, getPayoutFrame } from '../../../../utils/iframe-helper';
import bankingData from '../../../../test-data/banking/banking.json';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — Create runs before Delete
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

// Shared customer name across tests in this file
let customerName: string;

// ─────────────────────────────────────────────────────────────
// Helper — Pick random item from array
// ─────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// PAYOUT — Create Customer and Payout
// ============================================================
test.describe('Payout with New Customer @banking @payout @customer @newbeneficiary', () => {

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

    test(
        'Should create customer contact and complete payout successfully @smoke',
        async ({ page }) => {
            test.setTimeout(180000);

            customerName = pickRandom(bankingData.customer.companies);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test     : Payout with New Customer');
            console.log(`🏢 Customer : ${customerName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Create new customer contact ───────────────
            await test.step('Create a new customer contact', async () => {
                await page.getByRole('button', { name: 'Create contact' }).click();
                await page.getByRole('menuitem', { name: 'Create Customer' }).click();

                await page.locator('#name').fill(customerName);
                await page.locator('#website').fill(bankingData.customer.website);
                await page.locator('#vat_number').fill(bankingData.customer.vat);
                await page.locator('#currency_id-input').fill(bankingData.customer.currency);
                await page.getByRole('option', { name: 'USD' }).click();
                await page.locator('#public_notes').fill(bankingData.customer.notes);
                await page.locator('#country_name-input').fill(bankingData.customer.country);
                await page.keyboard.press('Enter');
                await page.locator('#state').fill(bankingData.customer.state);
                await page.locator('#postal_code').fill(bankingData.customer.postalCode);
                await page.locator('#city').fill(bankingData.customer.city);
                await page.locator('#address1').fill(bankingData.customer.address);

                // Fill contact person details
                await page.locator('div[role="gridcell"][col-id="first_name"]').nth(0).dblclick();
                await page.locator('div[role="gridcell"][col-id="first_name"] input').fill(bankingData.customer.firstName);
                await page.locator('div[role="gridcell"][col-id="first_name"] input').press('Enter');

                await page.locator('div[role="gridcell"][col-id="last_name"]').nth(0).dblclick();
                await page.locator('div[role="gridcell"][col-id="last_name"] input').fill(bankingData.customer.lastName);
                await page.locator('div[role="gridcell"][col-id="last_name"] input').press('Enter');

                await page.locator('div[role="gridcell"][col-id="email"]').nth(0).dblclick();
                await page.locator('div[role="gridcell"][col-id="email"] input').fill(bankingData.customer.email);
                await page.locator('div[role="gridcell"][col-id="email"] input').press('Enter');

                await page.getByRole('button', { name: 'Save' }).click();
                await page.getByRole('button', { name: 'Add bank details' }).click();
                console.log(`✏️  Customer contact created: ${customerName}`);
            });

            // ── Step 2 — Fill beneficiary bank details in iframe ───
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
                    .fill(customerName);
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

            // ── Step 3 — Fill first OTP ────────────────────────────
            await test.step('Generate and fill first OTP for beneficiary verification', async () => {
                await fillOTP(page);
                await page.getByRole('button', { name: 'Continue' }).click();
                console.log('🔑 First OTP submitted');
            });

            // ── Step 4 — Fill payout details ──────────────────────
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
                    .fill(bankingData.payout.amountCustomer);
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
                console.log(`💸 Payout amount: ${bankingData.payout.amountCustomer} USD`);
            });

            // ── Step 5 — Fill second OTP ───────────────────────────
            await test.step('Generate and fill second OTP for payment confirmation', async () => {
                await fillOTP(page);
                await page.getByRole('button', { name: 'Continue' }).click();
                console.log('🔑 Second OTP submitted');
            });

            // ── Step 6 — Verify payment success ───────────────────
            await test.step('Verify payment created successfully', async () => {
                await expect(
                    page.getByText('Payment created successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.locator('button:has-text("Done")').click();

                await page.getByText('account_balanceBanking').click();
                await page.getByRole('link', { name: 'Transactions' }).click();
                await page.getByRole('gridcell', { name: customerName }).first().click();
                await page.getByRole('button', { name: 'close' }).click();
                console.log('✅ Payment created and verified in transactions list');
                await page.waitForTimeout(3000);
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Payout with New Customer — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});

// ============================================================
// CLEANUP — Delete Customer Beneficiary and Contact
// ============================================================
test.describe('Delete Customer Beneficiary and Contact @banking @customer @delete', () => {

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

    // ── Delete Customer Bank Details ───────────────────────────
    test(
        'Should delete customer bank details successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Delete Customer Bank Details');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Select and delete bank details ────────────
            await test.step('Select customer contact and initiate bank details deletion', async () => {
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
            await test.step('Verify customer bank details deleted successfully', async () => {
                await expect(
                    page.getByText('Bank details deleted')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Customer bank details deleted successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Delete Customer Bank Details — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Delete Customer Contact ────────────────────────────────
    test(
        'Should delete customer contact successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test : Delete Customer Contact');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Select and delete customer contact ────────
            await test.step('Select customer contact and initiate deletion', async () => {
                await page.getByRole('gridcell').first().click();
                await page.getByRole('button', { name: 'More arrow_drop_down' }).click();
                await page.getByRole('menuitem', { name: 'delete Delete customer' }).click();
                await page.getByRole('button', { name: /Yes|Proceed anyway/ }).click();
                console.log('🗑️  Customer contact deletion initiated');
            });

            // ── Step 2 — Verify deletion ───────────────────────────
            await test.step('Verify customer contact deleted successfully', async () => {
                await expect(
                    page.getByText('Contact deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                console.log('✅ Customer contact deleted successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Delete Customer Contact — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});
