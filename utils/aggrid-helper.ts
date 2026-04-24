// ============================================================
// AG Grid Helper
// Description : Reusable helper for editing AG Grid cells.
//               Used across Chartering module tests —
//               Vessel, Ownership, Cargo and Estimate.
// ============================================================

import { Page } from '@playwright/test';

/**
 * Edits a cell in an AG Grid table.
 * Clicks the cell, activates edit mode and types the value.
 *
 * @param page  - Playwright Page object
 * @param colId - Column ID attribute of the gridcell
 * @param index - Zero-based row index of the cell
 * @param value - Value to type into the cell
 */
export async function editAgGridCell(
    page: Page,
    colId: string,
    index: number,
    value: string
): Promise<void> {
    const cell = page
        .locator(`div[role="gridcell"][col-id="${colId}"]`)
        .nth(index);

    await cell.scrollIntoViewIfNeeded();
    await cell.click({ force: true });

    // Activate edit mode — AG Grid requires Enter key
    await page.keyboard.press('Enter');

    // Small wait for editor to mount — AG Grid is async
    await page.waitForTimeout(150);

    // Clear existing value and type new one
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(value, { delay: 50 });

    // Commit the value
    await page.keyboard.press('Enter');
}