// ============================================================
// Test Suite  : Switch Account — Sub Account Creation
// Description : Covers the flow of creating a new sub account
//               (company) from within an existing logged-in
//               Marlo account. Includes company setup, Stripe
//               free trial activation and product tour.
// Tags        : @marlo @accounts @subaccount
// ============================================================

import { test, expect } from '@playwright/test';
import { getActiveUser } from '../../../../utils/auth-helper';
import dotenv from 'dotenv';

dotenv.config();

// ─────────────────────────────────────────────────────────────
// Test Data — Company names for sub account creation
// ─────────────────────────────────────────────────────────────
const COMPANY_NAMES: string[] = [
    'SilverStar Voyages', 'GoldenTide Carriers', 'EmeraldOcean Lines',
    'CrystalWave Shipping', 'StarlightFreight', 'PolarisMaritime',
    'ThunderBay Logistics', 'SapphireSeas Transports', 'MeteorMarine Express',
    'AuroraFleet Ltd', 'VelvetOcean Haulers', 'SkyHarbor Carriers',
    'EclipseShipping Co', 'NebulaFreight Lines', 'ZephyrMaritime',
    'CrimsonTide Logistics', 'JadeHorizon Transports', 'PhoenixAnchor Shipping',
    'DriftwoodVoyager Ltd', 'MonsoonBridge Lines', 'IvoryMaster Freight',
    'CopperDog Carriers', 'MistWind Maritime', 'GraniteHaul Logistics',
    'SilkDeep Shipping',
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

// ─────────────────────────────────────────────────────────────
// Stripe test card details (loaded from .env)
// ─────────────────────────────────────────────────────────────
const STRIPE_CARD_NUMBER = process.env.STRIPE_CARD_NUMBER!;
const STRIPE_CARD_EXPIRY = process.env.STRIPE_CARD_EXPIRY!;
const STRIPE_CARD_CVC = process.env.STRIPE_CARD_CVC!;

// ─────────────────────────────────────────────────────────────
// Helper — Pick random item from array
// ─────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// Test Suite
// ============================================================
test.describe('Switch Account @marlo @accounts @subaccount', () => {

    test(
        'Should create a new sub account successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            // Get active user credentials from .auth/test-user.json
            const user = getActiveUser();

            // Pick random company details for sub account
            const companyName = pickRandom(COMPANY_NAMES);
            const country = pickRandom(COUNTRIES);
            const companyType = pickRandom(COMPANY_TYPES);
            const position = pickRandom(POSITIONS);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test     : Create Sub Account');
            console.log(`👤 User     : ${user.firstName} ${user.lastName}`);
            console.log(`📧 Email    : ${user.email}`);
            console.log(`🏢 Company  : ${companyName} | ${country}`);
            console.log(`💼 Type     : ${companyType} | ${position}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Login to application ──────────────────────
            await test.step('Login to Marlo application', async () => {
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
                console.log(`✅ Logged in as ${user.email}`);
            });

            // ── Step 2 — Open switch account and add new ────────────
            await test.step('Open switch account menu and click Add new', async () => {
                await page.hover('[data-testid="ps-menu-button-test-id"] >> text=account_circle');
                await page.click('[data-testid="ps-menu-button-test-id"] >> text=account_circle');
                await page.getByText('keyboard_arrow_down').click();
                await page.getByRole('button', { name: 'Add new' }).click();
                console.log('➕ Add new sub account initiated');
            });

            // ── Step 3 — Fill company details ──────────────────────
            await test.step('Verify company page and fill company details', async () => {
                await expect(
                    page.getByRole('heading', { name: 'Create your company' })
                ).toBeVisible();
                await expect(
                    page.getByText('Please fill in the company details to get started.')
                ).toBeVisible();

                await page.locator('#companyName').fill(companyName);

                await page.locator('#country-input').click();
                await page.getByRole('option', { name: country }).click();

                await page.locator('#companyType-input').click();
                await page.getByRole('option', { name: companyType }).click();

                await page.locator('#position-input').click();
                await page.getByRole('option', { name: position }).click();

                console.log(`✏️  Company details filled: ${companyName} | ${country}`);
            });

            // ── Step 4 — Submit and verify account creation ─────────
            await test.step('Submit company details and verify account created', async () => {
                await expect(
                    page.getByRole('button', { name: 'Create my account' })
                ).toBeEnabled();
                await page.getByRole('button', { name: 'Create my account' }).click();

                await expect(
                    page.getByText('Account created successfully!')
                ).toBeVisible({ timeout: 100000 });
                await page.waitForURL('**/dashboard/overview', { timeout: 60000 });
                console.log('🎉 Sub account created successfully!');
            });

            // ── Step 5 — Complete Stripe free trial ─────────────────
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

            // ── Step 6 — Complete product tour ─────────────────────
            await test.step('Complete 7-step product tour', async () => {
                await expect(
                    page.getByText(`Welcome aboard, ${user.firstName}! Your trial starts now`)
                ).toBeVisible({ timeout: 60000 });

                await expect(
                    page.getByText('Let’s take a quick tour of your Marlo workspace.')
                ).toBeVisible();

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

            // ── Step 7 — Logout ────────────────────────────────────
            await test.step('Logout after sub account creation', async () => {
                await page.getByText('account_circleMy account').click();
                await page.getByRole('button', { name: 'Logout' }).click();
                await expect(page).toHaveURL(/\//);
                console.log('👋 Logged out successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Sub Account Created Successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});