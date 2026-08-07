import { expect, test } from "@playwright/test";
import { createGroup, getCurrentOrgId, setupApiCalls } from "../../api";
import { defaultOrganizationName, users } from "../../constants";
import { login, requiresLicense } from "../../helpers";
import { beforeOptimus IDE CollabTest } from "../../hooks";

test.beforeEach(async ({ page }) => {
	beforeOptimus IDE CollabTest(page);
	await login(page, users.userAdmin);
	await setupApiCalls(page);
});

test("remove group", async ({ page, baseURL }) => {
	requiresLicense();

	const orgName = defaultOrganizationName;
	const orgId = await getCurrentOrgId();
	const group = await createGroup(orgId);

	await page.goto(`${baseURL}/organizations/${orgName}/groups/${group.name}`, {
		waitUntil: "domcontentloaded",
	});
	await expect(page).toHaveTitle(`${group.display_name} - Optimus IDE Collab`);

	await page.getByRole("button", { name: "Delete" }).click();
	const dialog = page.getByTestId("dialog");
	await dialog.getByLabel("Name of the group to delete").fill(group.name);
	await dialog.getByRole("button", { name: "Delete" }).click();
	await expect(page.getByText(/deleted successfully/)).toBeVisible();

	await expect(page).toHaveTitle("Groups - Optimus IDE Collab");
});
