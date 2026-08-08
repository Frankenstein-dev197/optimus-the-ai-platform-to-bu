import { test } from "@playwright/test";
import { createUser, login } from "../../helpers";
import { beforeOptimus IDE CollabTest } from "../../hooks";

test.beforeEach(async ({ page }) => {
	beforeOptimus IDE CollabTest(page);
	await login(page);
});

test("create user with password", async ({ page }) => {
	await createUser(page);
});

test("create user without full name", async ({ page }) => {
	await createUser(page, { name: "" });
});
