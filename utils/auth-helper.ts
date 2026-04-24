// ============================================================
// Auth Helper
// Description : Reads the current test user credentials from
//               .auth/test-user.json — populated after each
//               onboarding run. All tests use this to get
//               the latest active user credentials without
//               needing to hardcode anything in .env
// ============================================================

import * as fs from 'fs';
import * as path from 'path';

const TEST_USER_PATH = path.join(process.cwd(), '.auth', 'test-user.json');

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Returns the current active test user credentials.
 * These are saved automatically after each onboarding run.
 * Use this in any test that needs to login with the latest user.
 *
 * @example
 * const user = getActiveUser();
 * await page.getByLabel('Email').fill(user.email);
 */
export function getActiveUser(): TestUser {
  if (!fs.existsSync(TEST_USER_PATH)) {
    throw new Error(
      `❌ No test user found at ${TEST_USER_PATH}.\n` +
      `   Please run the onboarding test first:\n` +
      `   npx playwright test onboarding.spec.ts --project=Marlo-Web-Automation`
    );
  }

  const raw = fs.readFileSync(TEST_USER_PATH, 'utf-8');
  return JSON.parse(raw) as TestUser;
}