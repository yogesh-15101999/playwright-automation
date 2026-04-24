// ============================================================
// Login Helper
// Description : Reusable login and logout functions for all
//               test suites. Centralizes login logic so that
//               any change in the login flow only needs to be
//               updated here — not in every spec file.
//
// Usage:
//   import { loginAs, loginWithActiveUser, logout } from '../utils/login-helper';
//   await loginAs(page, 'banking');
//   await loginWithActiveUser(page);
//   await logout(page);
// ============================================================

import { Page } from '@playwright/test';
import { getActiveUser } from './auth-helper';

// ─────────────────────────────────────────────────────────────
// Supported account types
// Each maps to a specific set of credentials in .env
// ─────────────────────────────────────────────────────────────
export type AccountType = 'marlo' | 'banking' | 'cards';

// ─────────────────────────────────────────────────────────────
// Credential resolver
// Returns email and password based on account type
// ─────────────────────────────────────────────────────────────
function getCredentials(accountType: AccountType): {
    email: string;
    password: string;
} {
    switch (accountType) {
        case 'marlo':
            return {
                email: process.env.MARLO_EMAIL ?? '',
                password: process.env.MARLO_PASSWORD ?? '',
            };
        case 'banking':
            return {
                email: process.env.BANKING_EMAIL ?? '',
                password: process.env.BANKING_PASSWORD ?? '',
            };
        case 'cards':
            return {
                email: process.env.CARDS_EMAIL ?? '',
                password: process.env.CARDS_PASSWORD ?? '',
            };
        default:
            throw new Error(`❌ Unknown account type: ${accountType}`);
    }
}

// ─────────────────────────────────────────────────────────────
// loginAs()
// Navigates to the app, fills credentials and logs in.
// Waits for the GraphQL API response to confirm login success.
//
// @param page        - Playwright Page object
// @param accountType - 'marlo' | 'banking' | 'cards'
// ─────────────────────────────────────────────────────────────
export async function loginAs(
    page: Page,
    accountType: AccountType
): Promise<void> {
    const { email, password } = getCredentials(accountType);

    console.log(`🔐 Logging in as [${accountType}] → ${email}`);

    await page.goto('/');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);

    const responsePromise = page.waitForResponse(
        (response) =>
            response.url() === process.env.MARLO_API_URL! &&
            response.status() === 200
    );

    await page.getByRole('button', { name: 'Login' }).click();
    await responsePromise;

    console.log(`✅ Login successful → [${accountType}]`);
}

// ─────────────────────────────────────────────────────────────
// loginWithActiveUser()
// Logs in using the latest onboarded user credentials saved
// in .auth/test-user.json — used for Marlo module tests
// (Vessel, Voyage, Estimates, Finance, Settings, etc.)
//
// @param page - Playwright Page object
// ─────────────────────────────────────────────────────────────
export async function loginWithActiveUser(page: Page): Promise<void> {
    const user = getActiveUser();

    console.log(`🔐 Logging in as active user → ${user.email}`);

    await page.goto('/');
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);

    const responsePromise = page.waitForResponse(
        (response) =>
            response.url() === process.env.MARLO_API_URL! &&
            response.status() === 200
    );

    await page.getByRole('button', { name: 'Login' }).click();
    await responsePromise;

    console.log(`✅ Login successful → ${user.email}`);
}

// ─────────────────────────────────────────────────────────────
// logout()
// Clicks the account menu and logs out.
// Used in afterEach hooks across all test suites.
//
// @param page - Playwright Page object
// ─────────────────────────────────────────────────────────────
export async function logout(page: Page): Promise<void> {
    await page.getByText('account_circleMy account').click();
    await page.getByRole('button', { name: 'Logout' }).click();
    console.log('👋 Logged out successfully');
}