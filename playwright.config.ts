// ============================================================
// PLAYWRIGHT CONFIGURATION
// Project: Marlo QA Automation Suite
// ============================================================

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({

    timeout: 2 * 60 * 1000,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,

    reporter: [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'playwright-report/results.json' }],
    ],

    use: {
        baseURL: process.env.MARLO_BASE_URL,
        actionTimeout: 30 * 1000,
        navigationTimeout: 60 * 1000,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        {
            name: 'Marlo-Web-Automation',
            testDir: './tests/UI/Marlo',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1506, height: 722 },
                baseURL: process.env.MARLO_BASE_URL,
            },
        },
        {
            name: 'Banking-Web-Automation',
            testDir: './tests/UI/Banking',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1506, height: 722 },
                baseURL: process.env.MARLO_BASE_URL,
            },
        },
        {
            name: 'API-Automation',
            testDir: './tests/API',
            use: {
                baseURL: process.env.MARLO_API_URL,
            },
        },
    ],

});