// ============================================================
// OTP Helper
// Description : Reusable TOTP (Time-based One-Time Password)
//               generator for payout and beneficiary deletion
//               flows in the Banking module.
//
// Usage:
//   import { generateOTPCode, fillOTP } from '../utils/otp-helper';
//
//   // Just get the code
//   const code = generateOTPCode();
//
//   // Or fill it directly into the page
//   await fillOTP(page);
//   await page.getByRole('button', { name: 'Continue' }).click();
// ============================================================

import { Page } from '@playwright/test';
import { TOTP } from 'otpauth';

// ─────────────────────────────────────────────────────────────
// TOTP Configuration
// Secret is loaded from .env (OTP_SECRET)
// Algorithm, digits and period follow standard TOTP spec
// ─────────────────────────────────────────────────────────────
function createTOTP(): TOTP {
    const secret = process.env.OTP_SECRET;

    if (!secret) {
        throw new Error(
            '❌ OTP_SECRET is not defined in .env\n' +
            '   Please add OTP_SECRET=<your_secret> to your .env file'
        );
    }

    return new TOTP({
        secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
    });
}

// ─────────────────────────────────────────────────────────────
// generateOTPCode()
// Generates a fresh 6-digit TOTP code.
// Call this just before filling — codes expire every 30 seconds.
//
// @returns 6-digit OTP string
//
// Example:
//   const code = generateOTPCode();
//   console.log('OTP:', code);
// ─────────────────────────────────────────────────────────────
export function generateOTPCode(): string {
    const totp = createTOTP();
    const code = totp.generate();
    console.log(`🔑 OTP generated: ${code}`);
    return code;
}

// ─────────────────────────────────────────────────────────────
// fillOTP()
// Generates a fresh OTP and fills it into the OTP input fields
// on the page. Each digit is filled into its own input box.
//
// @param page - Playwright Page object
//
// Example:
//   await fillOTP(page);
//   await page.getByRole('button', { name: 'Continue' }).click();
// ─────────────────────────────────────────────────────────────
export async function fillOTP(page: Page): Promise<void> {
    const otpCode = generateOTPCode();

    console.log('✏️  Filling OTP into input fields...');

    for (let i = 0; i < otpCode.length; i++) {
        await page.getByRole('textbox', {
            name: `Please enter OTP character ${i + 1}`,
        }).fill(otpCode.charAt(i));
    }

    console.log('✅ OTP filled successfully');
}