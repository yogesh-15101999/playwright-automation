// ============================================================
// Test Suite  : Onboarding
// Description : Covers full onboarding flow including signup,
//               free trial activation, product tour, and
//               form validation negative cases
// Tags        : @onboarding
// ============================================================

import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { getActiveUser } from '../../../../utils/auth-helper';

// ============================================================
// Constants — Test Data
// ============================================================

// Path to save newly created user credentials for reuse in
// subsequent tests (e.g. Login, Vessel, Voyage, etc.)
const AUTH_DIR = path.join(process.cwd(), '.auth');
const TEST_USER_PATH = path.join(AUTH_DIR, 'test-user.json');

const COMPANY_NAMES: string[] = [
    'Ocean Forge Shipping', 'Tidal Wave Logistics', 'Neptune Cargo Lines',
    'Blue Horizon Maritime', 'Anchor Point Freighters', 'Sea Pulse Transport',
    'Wave Crest Carriers', 'Marine Quest Express', 'Aqua Trail Shipping',
    'Voyager Fleet Ltd', 'Deep Ocean Haulers', 'Portside Carriers',
    'Global Wave Shipping', 'Arctic Freight Lines', 'Equator Maritime',
    'Storm Tide Logistics', 'Coral Sea Transports', 'Iron Anchor Shipping',
    'Pacific Voyager Ltd', 'Atlantic Bridge Lines', 'Harbor Master Freight',
    'Salty Dog Carriers', 'Trade Wind Maritime', 'Keel Haul Logistics',
    'Brine Deep Shipping',
];

const COUNTRIES: string[] = [
    'Singapore', 'Germany', 'Marshall Island', 'United Kingdom', 'Greece',
];

const COMPANY_TYPES: string[] = [
    'Ship owner', 'Charterer', 'Broker', 'Trader', 'Operator', 'Other',
];

const POSITIONS: string[] = [
    'Chartering manager', 'Operations manager', 'Finance manager',
    'CEO', 'CFO', 'Director', 'Analyst', 'Other',
];

// Stripe test card details (loaded from .env)
const STRIPE_CARD_NUMBER = process.env.STRIPE_CARD_NUMBER!;
const STRIPE_CARD_EXPIRY = process.env.STRIPE_CARD_EXPIRY!;
const STRIPE_CARD_CVC = process.env.STRIPE_CARD_CVC!;

// Shared password used for all Marlo test users
// Standard QA team password — consistent across all test runs
const SHARED_PASSWORD = process.env.MARLO_PASSWORD!;

// ============================================================
// Helper Functions
// ============================================================

/**
 * Picks a random item from a given array.
 * Used to randomize company name, country, type and position.
 */
function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Saves newly created user credentials to .auth/test-user.json
 * so that subsequent tests (Login, Vessel, Voyage, etc.)
 * can reuse the same fresh user without re-running onboarding.
 */
function saveTestUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}): void {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    fs.writeFileSync(TEST_USER_PATH, JSON.stringify(data, null, 2));
    console.log(`💾 Credentials saved → ${TEST_USER_PATH}`);
}

// ============================================================
// Test Suite
// ============================================================

test.describe('Onboarding @onboarding', () => {

    // ==========================================================
    // POSITIVE TEST CASES
    // ==========================================================

    test.describe('Positive Cases @positive', () => {

        test(
            'Should complete full onboarding flow successfully @smoke',
            async ({ page }) => {

                // Extend timeout — involves Stripe iframe and multiple
                // page navigations on a slow QA backend
                test.setTimeout(120000);

                // ── Generate fresh random user data ──────────────────
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const email = faker.internet.email({
                    firstName,
                    lastName,
                    provider: 'qaautomationtest.com',
                });
                const companyName = pickRandom(COMPANY_NAMES);
                const country = pickRandom(COUNTRIES);
                const companyType = pickRandom(COMPANY_TYPES);
                const position = pickRandom(POSITIONS);

                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🧪 Test    : Full Onboarding Flow');
                console.log(`👤 User    : ${firstName} ${lastName}`);
                console.log(`📧 Email   : ${email}`);
                console.log(`🏢 Company : ${companyName} | ${country}`);
                console.log(`💼 Type    : ${companyType} | ${position}`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

                // ── Step 1 — Navigate to signup page ─────────────────
                await test.step('Navigate to signup page', async () => {
                    await page.goto('/');
                    await page.getByRole('link', { name: 'Sign up' }).click();
                });

                // ── Step 2 — Verify signup page loaded ───────────────
                await test.step('Verify signup page is loaded (Step 1 of 2)', async () => {
                    await expect(
                        page.getByRole('heading', { name: 'Create your Marlo account' })
                    ).toBeVisible();
                    await expect(
                        page.getByText('Welcome! Please fill in details to get started.')
                    ).toBeVisible();
                    await expect(
                        page.locator('span.f-12-400-t', { hasText: 'Step 1 of 2' })
                    ).toBeVisible();
                    console.log('📄 Signup page loaded — Step 1 of 2 confirmed');
                });

                // ── Step 3 — Verify Continue button disabled initially ─
                await test.step('Verify Continue button is disabled on empty form', async () => {
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeDisabled();
                    console.log('🔒 Continue button disabled on empty form ✅');
                });

                // ── Step 4 — Fill personal details ───────────────────
                await test.step('Fill personal details — First Name, Last Name, Email, Password', async () => {
                    await page.getByLabel('First Name').fill(firstName);
                    await page.getByLabel('Last Name').fill(lastName);
                    await page.getByLabel('Business Email').fill(email);
                    await page.getByLabel('Password').nth(0).fill(SHARED_PASSWORD);
                    console.log('✏️  Personal details filled successfully');
                });

                // ── Step 5 — Submit Page 1 ────────────────────────────
                await test.step('Verify Continue button is enabled and proceed to Page 2', async () => {
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeEnabled();
                    await page.getByRole('button', { name: 'Continue' }).click();
                    console.log('✅ Page 1 submitted — navigating to company details');
                });

                // ── Step 6 — Verify company page loaded ──────────────
                await test.step('Verify company details page is loaded (Step 2 of 2)', async () => {
                    await expect(
                        page.getByRole('heading', { name: 'Create your company' })
                    ).toBeVisible({ timeout: 60000 });
                    await expect(
                        page.getByText('Please fill in the company details to get started.')
                    ).toBeVisible();
                    await expect(
                        page.locator('span.f-12-400-t', { hasText: 'Step 2 of 2' })
                    ).toBeVisible();
                    console.log('📄 Company details page loaded — Step 2 of 2 confirmed');
                });

                // ── Step 7 — Fill company details ────────────────────
                await test.step('Fill company details — Name, Country, Type, Position', async () => {
                    await page.getByLabel('Company Name').fill(companyName);

                    await page.locator('#country-input').click();
                    await page.getByRole('option', { name: country }).click();

                    await page.locator('#companyType-input').click();
                    await page.getByRole('option', { name: companyType }).click();

                    await page.locator('#position-input').click();
                    await page.getByRole('option', { name: position }).click();

                    console.log('✏️  Company details filled successfully');
                });

                // ── Step 8 — Submit Page 2 ────────────────────────────
                await test.step('Verify Create my account button is enabled and submit', async () => {
                    await expect(
                        page.getByRole('button', { name: 'Create my account' })
                    ).toBeEnabled();
                    await page.getByRole('button', { name: 'Create my account' }).click();
                    console.log('✅ Page 2 submitted — creating account');
                });

                // ── Step 9 — Verify account created ──────────────────
                await test.step('Verify account created successfully and dashboard loaded', async () => {
                    await expect(
                        page.getByText('Account created successfully!')
                    ).toBeVisible({ timeout: 60000 });
                    await page.waitForURL('**/dashboard/overview', { timeout: 60000 });
                    console.log('🎉 Account created — dashboard loaded successfully');
                });

                // ── Step 10 — Save credentials ────────────────────────
                await test.step('Save new user credentials to .auth/test-user.json', async () => {
                    saveTestUser({
                        email,
                        password: SHARED_PASSWORD,
                        firstName,
                        lastName,
                    });
                });

                // ── Step 11 — Complete Stripe free trial ─────────────
                await test.step('Enter Stripe card details and start free trial', async () => {
                    await expect(
                        page.getByText('Start your free trial')
                    ).toBeVisible({ timeout: 60000 });
                    await expect(
                        page.locator('#payment-element')
                    ).toBeVisible({ timeout: 30000 });

                    // Stripe payment form is inside a secure iframe
                    const stripeFrame = page.frameLocator(
                        'iframe[title="Secure payment input frame"]'
                    ).nth(0);

                    await stripeFrame.getByPlaceholder('1234 1234 1234 1234').fill(STRIPE_CARD_NUMBER);
                    await stripeFrame.getByPlaceholder('MM / YY').fill(STRIPE_CARD_EXPIRY);
                    await stripeFrame.getByPlaceholder('CVC').fill(STRIPE_CARD_CVC);

                    await expect(
                        page.locator('button:has-text("Start free trial")')
                    ).toBeEnabled();
                    await page.locator('button:has-text("Start free trial")').click({ force: true });
                    console.log('💳 Stripe payment submitted successfully');
                });

                // ── Step 12 — Complete product tour ──────────────────
                await test.step('Complete 7-step product tour', async () => {
                    await expect(
                        page.getByText(`Welcome aboard, ${firstName}! Your trial starts now`)
                    ).toBeVisible({ timeout: 60000 });

                    await page.getByRole('button', { name: 'Start quick tour' }).click();

                    // Click through steps 1–6
                    for (let i = 1; i <= 6; i++) {
                        await expect(page.getByText(`${i} out of 7`)).toBeVisible();
                        await page.getByRole('button', { name: 'Next' }).nth(1).click();
                        console.log(`🗺️  Tour step ${i}/7 completed`);
                    }

                    // Final step
                    await expect(page.getByText('7 out of 7')).toBeVisible();
                    await page.getByRole('button', { name: 'Finish' }).click();
                    console.log('🗺️  Product tour completed successfully');
                });

                // ── Step 13 — Logout ──────────────────────────────────
                await test.step('Logout after completing onboarding', async () => {
                    await page.getByText('account_circleMy account').click();
                    await page.getByRole('button', { name: 'Logout' }).click();
                    await expect(page).toHaveURL(/\//);
                    console.log('👋 Logged out successfully');
                });

                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('✅ Full Onboarding Flow Completed Successfully!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            }
        );

    });

    // ==========================================================
    // NEGATIVE TEST CASES
    // ==========================================================

    test.describe('Negative Cases @negative', () => {

        // ── Negative Test 1 — Page 1 form validations ────────────
        test(
            'Should validate all form field states on signup Page 1',
            async ({ page }) => {
                test.setTimeout(60000);

                // ── Step 1 — Navigate to signup ──────────────────────
                await test.step('Navigate to signup page', async () => {
                    await page.goto('/');
                    await page.getByRole('link', { name: 'Sign up' }).click();
                    await expect(
                        page.getByRole('heading', { name: 'Create your Marlo account' })
                    ).toBeVisible();
                    await expect(
                        page.locator('span.f-12-400-t', { hasText: 'Step 1 of 2' })
                    ).toBeVisible();
                    console.log('📄 Signup page loaded — Step 1 of 2 confirmed');
                });

                // ── Step 2 — Empty form ───────────────────────────────
                await test.step('Verify Continue is disabled on empty form', async () => {
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeDisabled();
                    console.log('🔒 Empty form → Continue disabled ✅');
                });

                // ── Step 3 — Only First Name filled ──────────────────
                await test.step('Verify Continue is disabled with only First Name filled', async () => {
                    await page.getByLabel('First Name').fill('Test');
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeDisabled();
                    console.log('🔒 Only First Name → Continue disabled ✅');
                });

                // ── Step 4 — First Name + Last Name ──────────────────
                await test.step('Verify Continue is disabled with First Name and Last Name filled', async () => {
                    await page.getByLabel('Last Name').fill('User');
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeDisabled();
                    console.log('🔒 First Name + Last Name → Continue disabled ✅');
                });

                // ── Step 5 — Invalid email — missing @ ───────────────
                await test.step('Verify Continue is disabled for email missing @ symbol', async () => {
                    await page.getByLabel('Business Email').fill('invalidemail.com');
                    await page.getByLabel('Password').nth(0).fill(SHARED_PASSWORD);
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeDisabled();
                    console.log('🔒 Invalid email (no @) → Continue disabled ✅');
                });

                // ── Step 6 — Invalid email — missing domain ───────────
                await test.step('Verify Continue is disabled for email missing domain', async () => {
                    await page.getByLabel('Business Email').clear();
                    await page.getByLabel('Business Email').fill('testuser@');
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeDisabled();
                    console.log('🔒 Invalid email (missing domain) → Continue disabled ✅');
                });

                // ── Step 7 — Invalid email — missing username ─────────
                await test.step('Verify Continue is disabled for email missing username', async () => {
                    await page.getByLabel('Business Email').clear();
                    await page.getByLabel('Business Email').fill('@gmail.com');
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeDisabled();
                    console.log('🔒 Invalid email (missing username) → Continue disabled ✅');
                });

                // ── Step 8 — Valid email but no password ──────────────
                await test.step('Verify Continue is disabled when password is missing', async () => {
                    await page.getByLabel('Business Email').clear();
                    await page.getByLabel('Business Email').fill(
                        faker.internet.email({ provider: 'qaautomationtest.com' })
                    );
                    await page.getByLabel('Password').nth(0).clear();
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeDisabled();
                    console.log('🔒 Valid email + no password → Continue disabled ✅');
                });

                // ── Step 9 — Password required error on blur ──────────
                await test.step('Verify password required error shown after clearing password', async () => {
                    await page.getByLabel('Password').nth(0).fill(SHARED_PASSWORD);
                    await page.getByLabel('Password').nth(0).clear();
                    await page.locator('body').click();
                    await expect(
                        page.locator('div.f-12-400-error', { hasText: 'Password is required.' })
                    ).toBeVisible();
                    console.log('🔒 Password cleared → "Password is required." error shown ✅');
                });

                // ── Step 10 — All valid fields ────────────────────────
                await test.step('Verify Continue is enabled when all fields are valid', async () => {
                    await page.getByLabel('Password').nth(0).fill(SHARED_PASSWORD);
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeEnabled();
                    console.log('🔓 All valid fields → Continue enabled ✅');
                });
            }
        );

        // ── Negative Test 2 — Already registered email ────────────
        test(
            'Should show error for already registered email on signup',
            async ({ page }) => {
                test.setTimeout(60000);

                // Read the latest active user from .auth/test-user.json
                // This is the email saved after the last onboarding run
                const { email, firstName, lastName } = getActiveUser();

                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🧪 Test  : Duplicate Email Validation');
                console.log(`📧 Using already registered email: ${email}`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

                // ── Step 1 — Navigate to signup ──────────────────────
                await test.step('Navigate to signup page', async () => {
                    await page.goto('/');
                    await page.getByRole('link', { name: 'Sign up' }).click();
                    await expect(
                        page.getByRole('heading', { name: 'Create your Marlo account' })
                    ).toBeVisible();
                    await expect(
                        page.locator('span.f-12-400-t', { hasText: 'Step 1 of 2' })
                    ).toBeVisible();
                    console.log('📄 Signup page loaded — Step 1 of 2 confirmed');
                });

                // ── Step 2 — Fill with already registered email ───────
                await test.step('Fill signup form with an already registered email', async () => {
                    await page.getByLabel('First Name').fill(firstName);
                    await page.getByLabel('Last Name').fill(lastName);
                    await page.getByLabel('Business Email').fill(email);
                    await page.getByLabel('Password').nth(0).fill(SHARED_PASSWORD);
                    console.log('✏️  Form filled with existing registered email');
                });

                // ── Step 3 — Click Continue ───────────────────────────
                await test.step('Verify Continue button is enabled and submit', async () => {
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeEnabled();
                    await page.getByRole('button', { name: 'Continue' }).click();
                });

                // ── Step 4 — Verify duplicate email error ─────────────
                await test.step('Verify duplicate email error message is displayed', async () => {
                    await expect(
                        page.getByText(
                            'This email is already registered. Please use a different email or login.'
                        )
                    ).toBeVisible({ timeout: 30000 });
                    console.log('✅ Duplicate email error displayed correctly');
                });
            }
        );

        // ── Negative Test 3 — Page 2 company form validations ─────
        test(
            'Should validate Create my account button state on company details Page 2',
            async ({ page }) => {
                test.setTimeout(60000);

                // Generate a fresh unique email for this test so Page 1
                // passes without hitting the duplicate email error
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const email = faker.internet.email({
                    firstName,
                    lastName,
                    provider: 'qaautomationtest.com',
                });

                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🧪 Test  : Company Form Validation (Page 2)');
                console.log(`📧 Email : ${email}`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

                // ── Step 1 — Navigate to signup ──────────────────────
                await test.step('Navigate to signup page', async () => {
                    await page.goto('/');
                    await page.getByRole('link', { name: 'Sign up' }).click();
                    await expect(
                        page.getByRole('heading', { name: 'Create your Marlo account' })
                    ).toBeVisible();
                    await expect(
                        page.locator('span.f-12-400-t', { hasText: 'Step 1 of 2' })
                    ).toBeVisible();
                    console.log('📄 Signup page loaded — Step 1 of 2 confirmed');
                });

                // ── Step 2 — Complete Page 1 to reach Page 2 ──────────
                await test.step('Complete Page 1 with valid details to proceed to company page', async () => {
                    await page.getByLabel('First Name').fill(firstName);
                    await page.getByLabel('Last Name').fill(lastName);
                    await page.getByLabel('Business Email').fill(email);
                    await page.getByLabel('Password').nth(0).fill(SHARED_PASSWORD);
                    await expect(
                        page.getByRole('button', { name: 'Continue' })
                    ).toBeEnabled();
                    await page.getByRole('button', { name: 'Continue' }).click();
                    console.log('✅ Page 1 completed — navigating to company details');
                });

                // ── Step 3 — Verify Page 2 loaded ────────────────────
                await test.step('Verify company details page is loaded (Step 2 of 2)', async () => {
                    await expect(
                        page.getByRole('heading', { name: 'Create your company' })
                    ).toBeVisible({ timeout: 60000 });
                    await expect(
                        page.locator('span.f-12-400-t', { hasText: 'Step 2 of 2' })
                    ).toBeVisible();
                    console.log('📄 Company details page loaded — Step 2 of 2 confirmed');
                });

                // ── Step 4 — Empty form ───────────────────────────────
                await test.step('Verify Create my account is disabled on empty form', async () => {
                    await expect(
                        page.getByRole('button', { name: 'Create my account' })
                    ).toBeDisabled();
                    console.log('🔒 Empty form → Create my account disabled ✅');
                });

                // ── Step 5 — Only Company Name filled ────────────────
                await test.step('Verify button is disabled with only Company Name filled', async () => {
                    await page.getByLabel('Company Name').fill('Test Company');
                    await expect(
                        page.getByRole('button', { name: 'Create my account' })
                    ).toBeDisabled();
                    console.log('🔒 Only Company Name → Create my account disabled ✅');
                });

                // ── Step 6 — Company Name + Country ──────────────────
                await test.step('Verify button is disabled with Company Name and Country filled', async () => {
                    await page.locator('#country-input').click();
                    await page.getByRole('option', { name: 'Singapore' }).click();
                    await expect(
                        page.getByRole('button', { name: 'Create my account' })
                    ).toBeDisabled();
                    console.log('🔒 Company Name + Country → Create my account disabled ✅');
                });

                // ── Step 7 — Company Name + Country + Type ────────────
                await test.step('Verify button is disabled with Company Name, Country and Type filled', async () => {
                    await page.locator('#companyType-input').click();
                    await page.getByRole('option', { name: 'Ship owner' }).click();
                    await expect(
                        page.getByRole('button', { name: 'Create my account' })
                    ).toBeDisabled();
                    console.log('🔒 Company Name + Country + Type → Create my account disabled ✅');
                });

                // ── Step 8 — All fields filled ────────────────────────
                await test.step('Verify button is enabled when all company fields are filled', async () => {
                    await page.locator('#position-input').click();
                    await page.getByRole('option', { name: 'CEO' }).click();
                    await expect(
                        page.getByRole('button', { name: 'Create my account' })
                    ).toBeEnabled();
                    console.log('🔓 All fields filled → Create my account enabled ✅');
                });
            }
        );

    });

});