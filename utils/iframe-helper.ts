// ============================================================
// Iframe Helper
// Description : Reusable iframe locator functions for Banking
//               module. Beneficiary and Payout forms are loaded
//               inside secure iframes — these helpers abstract
//               the iframe access so spec files stay clean.
//
// Usage:
//   import { getBeneficiaryFrame, getPayoutFrame } from '../utils/iframe-helper';
//
//   const beneficiaryFrame = await getBeneficiaryFrame(page);
//   await beneficiaryFrame.getByTestId('...').fill('...');
//
//   const payoutFrame = await getPayoutFrame(page);
//   await payoutFrame.getByRole('textbox', { name: 'Recipient gets' }).fill('2000');
// ============================================================

import { Page, FrameLocator } from '@playwright/test';

// ─────────────────────────────────────────────────────────────
// getBeneficiaryFrame()
// Locates and returns the beneficiary form iframe.
// Used when adding or editing bank details for a contact.
//
// @param page - Playwright Page object
// @returns    - FrameLocator for the beneficiary form iframe
//
// Example:
//   const frame = await getBeneficiaryFrame(page);
//   await frame.getByTestId('beneficiary.bankDetails.bankCountryCode').click();
// ─────────────────────────────────────────────────────────────
export async function getBeneficiaryFrame(page: Page): Promise<FrameLocator> {
    const iframeLocator = page.locator(
        'iframe[title="beneficiaryForm element iframe"]'
    );

    // Wait for iframe to be attached to the DOM before accessing
    await iframeLocator.waitFor({ state: 'attached' });

    const frame = page.frameLocator(
        'iframe[title="beneficiaryForm element iframe"]'
    );

    if (!frame) {
        throw new Error(
            '❌ Beneficiary iframe not found.\n' +
            '   Make sure the "Add bank details" button was clicked before calling getBeneficiaryFrame()'
        );
    }

    console.log('🖼️  Beneficiary iframe located successfully');
    return frame;
}

// ─────────────────────────────────────────────────────────────
// getPayoutFrame()
// Locates and returns the payout form iframe.
// Used when filling payout amount, currency and details.
//
// @param page - Playwright Page object
// @returns    - FrameLocator for the payout form iframe
//
// Example:
//   const frame = await getPayoutFrame(page);
//   await frame.getByRole('textbox', { name: 'Recipient gets' }).fill('2000');
// ─────────────────────────────────────────────────────────────
export async function getPayoutFrame(page: Page): Promise<FrameLocator> {
    const iframeLocator = page.locator(
        'iframe[title="payoutForm element iframe"]'
    );

    // Wait for iframe to be attached to the DOM before accessing
    await iframeLocator.waitFor({ state: 'attached' });

    const frame = page.frameLocator(
        'iframe[title="payoutForm element iframe"]'
    );

    if (!frame) {
        throw new Error(
            '❌ Payout iframe not found.\n' +
            '   Make sure the payout flow was initiated before calling getPayoutFrame()'
        );
    }

    console.log('🖼️  Payout iframe located successfully');
    return frame;
}