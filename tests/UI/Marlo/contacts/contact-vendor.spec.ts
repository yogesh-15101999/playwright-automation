// ============================================================
// Test Suite  : Contact — Vendor
// Description : Covers full CRUD flow for Vendor contacts
//               in the Banking → Contacts module.
//               Includes Create, Edit, Add Contact Person,
//               Upload Document, Delete Document and Delete.
// Tags        : @banking @contacts @vendor
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
// Shared vendor name across all tests in this suite
// Set during Create and reused in all subsequent tests
// ─────────────────────────────────────────────────────────────
let vendorName: string;

// ─────────────────────────────────────────────────────────────
// File path for document upload — relative to project root
// ─────────────────────────────────────────────────────────────
const UPLOAD_FILE_PATH = path.resolve(contactsData.document.filePath);

test.describe('Contact — Vendor @banking @contacts @vendor', () => {

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

    // ── Test 1 — Create Vendor ─────────────────────────────────
    test(
        'Should create Vendor contact successfully @smoke',
        async ({ page }) => {
            test.setTimeout(120000);

            vendorName = pickRandom(contactsData.vendor.companies);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Create Vendor Contact');
            console.log(`🏢 Vendor : ${vendorName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Initiate vendor creation ──────────────────
            await test.step('Click Create contact and select Create Vendor', async () => {
                await page.getByRole('button', { name: 'Create contact' }).click();
                await page.getByRole('menuitem', { name: 'Create Vendor' }).click();
                console.log('➕ Create Vendor form opened');
            });

            // ── Step 2 — Fill vendor details ───────────────────────
            await test.step('Fill vendor company details', async () => {
                await page.locator('#name').fill(vendorName);
                await page.locator('#website').fill(contactsData.vendor.website);
                await page.locator('#vat_number').fill(contactsData.vendor.vat);
                await page.locator('#currency_id-input').fill(contactsData.vendor.currency);
                await page.getByRole('option', { name: 'USD' }).click();
                await page.locator('#public_notes').fill(contactsData.vendor.notes);
                await page.locator('#country_name-input').fill(contactsData.vendor.country);
                await page.keyboard.press('Enter');
                await page.locator('#state').fill(contactsData.vendor.state);
                await page.locator('#postal_code').fill(contactsData.vendor.postalCode);
                await page.locator('#city').fill(contactsData.vendor.city);
                await page.locator('#address1').fill(contactsData.vendor.address);
                console.log('✏️  Company details filled successfully');
            });

            // ── Step 3 — Fill contact person details ───────────────
            await test.step('Fill contact person details in the grid', async () => {
                await page.locator('div[role="gridcell"][col-id="first_name"]').nth(0).dblclick();
                await page.locator('div[role="gridcell"][col-id="first_name"] input').fill(contactsData.vendor.firstName);
                await page.locator('div[role="gridcell"][col-id="first_name"] input').press('Enter');

                await page.locator('div[role="gridcell"][col-id="last_name"]').nth(0).dblclick();
                await page.locator('div[role="gridcell"][col-id="last_name"] input').fill(contactsData.vendor.lastName);
                await page.locator('div[role="gridcell"][col-id="last_name"] input').press('Enter');

                await page.locator('div[role="gridcell"][col-id="email"]').nth(0).dblclick();
                await page.locator('div[role="gridcell"][col-id="email"] input').fill(contactsData.vendor.email);
                await page.locator('div[role="gridcell"][col-id="email"] input').press('Enter');
                console.log('✏️  Contact person details filled successfully');
            });

            // ── Step 4 — Save and skip bank details ────────────────
            await test.step('Save vendor and skip bank details for now', async () => {
                await page.getByRole('button', { name: 'Save' }).click();
                await page.getByRole('button', { name: 'I will do it later' }).click();
                await page.waitForTimeout(3000);
                console.log('✅ Vendor contact created successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Create Vendor Contact — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 2 — Edit Vendor ───────────────────────────────────
    test(
        'Should edit Vendor contact successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Edit Vendor Contact');
            console.log(`🏢 Vendor : ${vendorName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open vendor ───────────────────────────────
            await test.step('Open vendor contact from the list', async () => {
                await page.getByRole('gridcell', { name: vendorName }).first().click();
                console.log(`📂 Vendor contact opened: ${vendorName}`);
            });

            // ── Step 2 — Open Edit dialog ──────────────────────────
            await test.step('Open Edit Vendor dialog from More menu', async () => {
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'Edit vendor' }).click();
                console.log('✏️  Edit Vendor dialog opened');
            });

            // ── Step 3 — Update details ────────────────────────────
            await test.step('Update VAT number and address', async () => {
                await page.locator('#vat_number').fill(contactsData.vendor.edit.vat);
                await page.locator('#address1').fill(contactsData.vendor.edit.address);
                await page.getByRole('button', { name: 'Save' }).click();
                console.log('✏️  VAT and address updated');
            });

            // ── Step 4 — Verify update ─────────────────────────────
            await test.step('Verify vendor contact updated successfully', async () => {
                await expect(
                    page.getByText('Contact updated successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForTimeout(3000);
                console.log('✅ Vendor contact updated successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Edit Vendor Contact — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 3 — Add Contact Person ────────────────────────────
    test(
        'Should add contact person to Vendor successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Add Contact Person to Vendor');
            console.log(`🏢 Vendor : ${vendorName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open vendor ───────────────────────────────
            await test.step('Open vendor contact from the list', async () => {
                await page.getByRole('gridcell', { name: vendorName }).first().click();
                console.log(`📂 Vendor contact opened: ${vendorName}`);
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
                    contactsData.vendor.contactPerson.firstName
                );
                await page.getByRole('textbox', { name: 'Last name' }).fill(
                    contactsData.vendor.contactPerson.lastName
                );
                await page.getByRole('textbox', { name: 'Email' }).fill(
                    contactsData.vendor.contactPerson.email
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
            console.log('✅ Add Contact Person to Vendor — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 4 — Upload Document ───────────────────────────────
    test(
        'Should upload document to Vendor successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Upload Document to Vendor');
            console.log(`🏢 Vendor : ${vendorName}`);
            console.log(`📄 File   : ${UPLOAD_FILE_PATH}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open vendor ───────────────────────────────
            await test.step('Open vendor contact from the list', async () => {
                await page.getByRole('gridcell', { name: vendorName }).first().click();
                console.log(`📂 Vendor contact opened: ${vendorName}`);
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
            console.log('✅ Upload Document to Vendor — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 5 — Delete Document ───────────────────────────────
    test(
        'Should delete document from Vendor successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Delete Document from Vendor');
            console.log(`🏢 Vendor : ${vendorName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open vendor ───────────────────────────────
            await test.step('Open vendor contact from the list', async () => {
                await page.getByRole('gridcell', { name: vendorName }).first().click();
                console.log(`📂 Vendor contact opened: ${vendorName}`);
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
            console.log('✅ Delete Document from Vendor — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

    // ── Test 6 — Delete Vendor ─────────────────────────────────
    test(
        'Should delete Vendor contact successfully',
        async ({ page }) => {
            test.setTimeout(120000);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🧪 Test   : Delete Vendor Contact');
            console.log(`🏢 Vendor : ${vendorName}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // ── Step 1 — Open vendor ───────────────────────────────
            await test.step('Open vendor contact from the list', async () => {
                await page.getByRole('gridcell', { name: vendorName }).first().click();
                console.log(`📂 Vendor contact opened: ${vendorName}`);
            });

            // ── Step 2 — Initiate deletion ─────────────────────────
            await test.step('Select Delete Vendor from More menu and confirm', async () => {
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('menuitem', { name: 'delete Delete vendor' }).click();
                await page.getByRole('button', { name: 'Yes' }).click();
                console.log('🗑️  Vendor deletion confirmed');
            });

            // ── Step 3 — Verify deletion ───────────────────────────
            await test.step('Verify vendor contact deleted successfully', async () => {
                await expect(
                    page.getByText('Contact deleted successfully')
                ).toBeVisible({ timeout: 30000 });
                await page.waitForTimeout(3000);
                console.log('✅ Vendor contact deleted successfully');
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Delete Vendor Contact — Passed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    );

});
