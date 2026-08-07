import { expect, test } from "@playwright/test";
import { users } from "../../constants";
import { login } from "../../helpers";
import { beforeOptimus IDE CollabTest } from "../../hooks";

test.beforeEach(async ({ page }) => {
	beforeOptimus IDE CollabTest(page);
	await login(page, users.templateAdmin);
});

test("list templates", async ({ page, baseURL }) => {
	await page.goto(`${baseURL}/templates`, { waitUntil: "domcontentloaded" });
	await expect(page).toHaveTitle("Templates - Optimus IDE Collab");
});
