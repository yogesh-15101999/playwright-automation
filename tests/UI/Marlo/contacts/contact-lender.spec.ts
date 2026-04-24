// ============================================================
// Test Suite  : Contact — Lender
// Description : Covers full CRUD flow for Lender contacts
//               in the Banking → Contacts module.
//               Includes Create, Edit, Add Contact Person,
//               Upload Document, Delete Document and Delete.
// Tags        : @banking @contacts @lender
// ============================================================

import { test, expect } from '@playwright/test';
import { loginWithActiveUser, logout } from '../../../../utils/login-helper';
import contactsData from '../../../../test-data/marlo/contacts.json';
import path from 'path';

// ─────────────────────────────────────────────────────────────
// Suite Configuration
// Serial mode — tests must run in CRUD order
// ─────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────────────────────
// Helper — Pick random item from array
// ─────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────
// Shared lender name across all tests in this suite
// Set during Create and reused in all subsequent tests
// ─────────────────────────────────────────────────────────────
let lenderName: string;

// ─────────────────────────────────────────────────────────────
// File path for document upload — relative to project root
// ─────────────────────────────────────────────────────────────
const UPLOAD_FILE_PATH = path.resolve(contactsData.document.filePath);

test.describe('Contact — Lender @banking @contacts @lender', () => {

    // ── Login and navigate to Banking → Contacts ───────────────
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginWithActiveUser(page);
        await page.getByText('account_balanceBanking').click();
        await page.getByRole('link', { name: 'Contacts' }).click();
        console.log('📍 Navigated to Banking → Contacts');
    });

    // ── Logout after each test ─────────────────────────────────
    test.afterEach(async ({ page }) => {
        await logout(page);
    });

    // ── Test 1 — Create Lender ─────────────────────────────────
    test(
        'Should create Lender contact successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            lenderName = pickRandom(contactsData.lender.companies);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test    : Create Lender Contact');
            console.log(`🏢 Lender  : ${lenderName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Initiate lender creation ──────────────────
            await test.step('Click Create contact and select Create Lender', async () => {
                await page.getByRole('button', { name: 'Create contact' }).click();
                await page.getByRole('menuitem', { name: 'Create Lender' }).click();
                console.log('➕ Create Lender form opened');
            });

            // ── Step 2 — Fill lender details ───────────────────────
            await test.step('Fill lender company details', async () => {
                await page.locator('#name').fill(lenderName);
                await page.locator('#website').fill(contactsData.lender.website);
                await page.locator('#vat_number').fill(contactsData.lender.vat);
                await page.locator('#currency_id-input').fill(contactsData.lender.currency);
                await page.getByRole('option', { name: 'USD' }).click();
                await page.locator('#public_notes').fill(contactsData.lender.notes);
                await page.locator('#country_name-input').fill(contactsData.lender.country);
                await page.keyboard.press('Enter');
                await page.locator('#state').fill(contactsData.lender.state);
                await page.locator('#postal_code').fill(contactsData.lender.postalCode);
                await page.locator('#city').fill(contactsData.lender.city);
                await page.locator('#address1').fill(contactsData.lender.address);
                console.log('✏️  Company details filled successfully');
            });

            // ── Step 3 — Fill contact person details ───────────────
            await test.step('Fill contact person details in the grid', async () => {
                await page.locator('div[role="gridcell"][col-id="first_name"]').nth(0).dblclick();
                await page.locator('div[role="gridcell"][col-id="first_name"] input').fill(contactsData.lender.firstName);
                await page.locator('div[role="gridcell"][col-id="first_name"] input').press('Enter');

                await page.locator('div[role="gridcell"][col-id="last_name"]').nth(0).dblclick();
                await page.locator('div[role="gridcell"][col-id="last_name"] input').fill(contactsData.lender.lastName);
                await page.locator('div[role="gridcell"][col-id="last_name"] input').press('Enter');

                await page.locator('div[role="gridcell"][col-id="email"]').nth(0).dblclick();
                await page.locator('div[role="gridcell"][col-id="email"] input').fill(contactsData.lender.email);
                await page.locator('div[role="gridcell"][col-id="email"] input').press('Enter');
                console.log('✏️  Contact person details filled successfully');
            });

            // ── Step 4 — Save and skip bank details ────────────────
            await test.step('Save lender and skip bank details for now', async () => {
                await page.getByRole('button', { name: 'Save' }).click();
                await page.getByRole('button', { name: 'I will do it later' }).click();
                await page.waitForTimeout(3000);
                console.log('✅ Lender contact created successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Create Lender Contact — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 2 — Edit Lender ───────────────────────────────────
    test(
        'Should edit Lender contact successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Edit Lender Contact');
            console.log(`🏢 Lender : ${lenderName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open lender ───────────────────────────────
            await test.step('Open lender contact from the list', async () => {
                await page.getByRole('gridcell', { name: lenderName }).first().click();
                console.log(`📂 Lender contact opened: ${lenderName}`);
            });

            // ── Step 2 — Open Edit dialog ──────────────────────────
            await test.step('Open Edit Lender dialog from More menu', async () => {
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'Edit lender' }).click();
                console.log('✏️  Edit Lender dialog opened');
            });

            // ── Step 3 — Update details ────────────────────────────
            await test.step('Update VAT number and address', async () => {
                await page.locator('#vat_number').fill(contactsData.lender.edit.vat);
                await page.locator('#address1').fill(contactsData.lender.edit.address);
                await page.getByRole('button', { name: 'Save' }).click();
                console.log('✏️  VAT and address updated');
            });

            // ── Step 4 — Verify update ─────────────────────────────
            await test.step('Verify lender contact updated successfully', async () => {
                await expect(
                    page.getByText('Contact updated successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForTimeout(3000);
                console.log('✅ Lender contact updated successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Edit Lender Contact — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 3 — Add Contact Person ────────────────────────────
    test(
        'Should add contact person to Lender successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Add Contact Person to Lender');
            console.log(`🏢 Lender : ${lenderName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open lender ───────────────────────────────
            await test.step('Open lender contact from the list', async () => {
                await page.getByRole('gridcell', { name: lenderName }).first().click();
                console.log(`📂 Lender contact opened: ${lenderName}`);
            });

            // ── Step 2 — Open Contact Persons ──────────────────────
            await test.step('Open Contact Persons section from More menu', async () => {
                await page.getByRole('button', { name: 'More arrow_drop_down' }).click();
                await page.getByRole('menuitem', { name: 'Contact persons' }).click();
                await page.getByRole('button', { name: 'Add contact person' }).click();
                console.log('👤 Add contact person form opened');
            });

            // ── Step 3 — Fill contact person details ───────────────
            await test.step('Fill contact person details and save', async () => {
                await page.getByRole('textbox', { name: 'First name' }).fill(
                    contactsData.lender.contactPerson.firstName
                );
                await page.getByRole('textbox', { name: 'Last name' }).fill(
                    contactsData.lender.contactPerson.lastName
                );
                await page.getByRole('textbox', { name: 'Email' }).fill(
                    contactsData.lender.contactPerson.email
                );
                await page.getByRole('button', { name: 'Save' }).click();
                console.log('✏️  Contact person details filled and saved');
            });

            // ── Step 4 — Verify and close ──────────────────────────
            await test.step('Verify contact person saved and close dialog', async () => {
                await expect(
                    page.getByText('Contact saved successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForTimeout(5000);
                await page.getByRole('button', { name: 'close' }).waitFor({ state: 'visible' });
                await page.getByRole('button', { name: 'close' }).first().click();
                await page.waitForTimeout(3000);
                console.log('✅ Contact person added successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Add Contact Person to Lender — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 4 — Upload Document ───────────────────────────────
    test(
        'Should upload document to Lender successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Upload Document to Lender');
            console.log(`🏢 Lender : ${lenderName}`);
            console.log(`📄 File   : ${UPLOAD_FILE_PATH}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open lender ───────────────────────────────
            await test.step('Open lender contact from the list', async () => {
                await page.getByRole('gridcell', { name: lenderName }).first().click();
                console.log(`📂 Lender contact opened: ${lenderName}`);
            });

            // ── Step 2 — Open Documents section ───────────────────
            await test.step('Open Documents section from More menu', async () => {
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'Documents' }).click();
                await page.getByRole('button', { name: 'Upload file' }).click();
                console.log('📁 Documents section opened');
            });

            // ── Step 3 — Upload file ───────────────────────────────
            await test.step('Select and upload PDF file', async () => {
                const [fileChooser] = await Promise.all([
                    page.waitForEvent('filechooser'),
                    page.getByRole('button', { name: 'Choose File' }).first().click(),
                ]);
                await fileChooser.setFiles(UPLOAD_FILE_PATH);
                await page.getByRole('button', { name: 'Upload' }).nth(1).click();
                console.log('📤 File selected and upload submitted');
            });

            // ── Step 4 — Verify upload and close ──────────────────
            await test.step('Verify file uploaded successfully and close dialog', async () => {
                await expect(
                    page.getByText('File uploaded successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.getByRole('button', { name: 'close' }).waitFor({ state: 'visible' });
                await page.getByRole('button', { name: 'close' }).click();
                await page.waitForTimeout(3000);
                console.log('✅ Document uploaded successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Upload Document to Lender — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 5 — Delete Document ───────────────────────────────
    test(
        'Should delete document from Lender successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Delete Document from Lender');
            console.log(`🏢 Lender : ${lenderName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open lender ───────────────────────────────
            await test.step('Open lender contact from the list', async () => {
                await page.getByRole('gridcell', { name: lenderName }).first().click();
                console.log(`📂 Lender contact opened: ${lenderName}`);
            });

            // ── Step 2 — Open Documents section ───────────────────
            await test.step('Open Documents section from More menu', async () => {
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'Documents' }).click();
                console.log('📁 Documents section opened');
            });

            // ── Step 3 — Delete document ───────────────────────────
            await test.step('Delete the uploaded document', async () => {
                await page.getByRole('button', { name: 'more_vert' }).click();
                await page.getByRole('menuitem', { name: 'Delete' }).click();
                console.log('🗑️  Document deletion initiated');
            });

            // ── Step 4 — Verify deletion and close ────────────────
            await test.step('Verify document deleted successfully and close dialog', async () => {
                await expect(
                    page.getByText('Document deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.getByRole('button', { name: 'close' }).waitFor({ state: 'visible' });
                await page.getByRole('button', { name: 'close' }).click();
                await page.waitForTimeout(3000);
                console.log('✅ Document deleted successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Delete Document from Lender — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 6 — Delete Lender ─────────────────────────────────
    test(
        'Should delete Lender contact successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Delete Lender Contact');
            console.log(`🏢 Lender : ${lenderName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open lender ───────────────────────────────
            await test.step('Open lender contact from the list', async () => {
                await page.getByRole('gridcell', { name: lenderName }).first().click();
                console.log(`📂 Lender contact opened: ${lenderName}`);
            });

            // ── Step 2 — Initiate deletion ─────────────────────────
            await test.step('Select Delete Lender from More menu and confirm', async () => {
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'delete Delete lender' }).click();
                await page.getByRole('button', { name: 'Yes' }).click();
                console.log('🗑️  Lender deletion confirmed');
            });

            // ── Step 3 — Verify deletion ───────────────────────────
            await test.step('Verify lender contact deleted successfully', async () => {
                await expect(
                    page.getByText('Contact deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForTimeout(3000);
                console.log('✅ Lender contact deleted successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Delete Lender Contact — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});
