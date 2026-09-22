import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const E2E_API_URL = process.env.E2E_API_URL ?? "http://127.0.0.1:3100";
export const TEST_PASSWORD = "E2ePassword123";

export type TestUser = {
  name: string;
  email: string;
  password: string;
};

export function createTestUser(label: string): TestUser {
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  return {
    name: `${label} ${suffix.slice(-8)}`,
    email: `${label.toLowerCase()}-${suffix}@fillobby.test`,
    password: TEST_PASSWORD,
  };
}

export async function registerViaApi(request: APIRequestContext, user: TestUser) {
  const response = await request.post(`${E2E_API_URL}/api/v1/auth/register`, {
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
      confirmPassword: user.password,
    },
  });

  expect(response.ok(), await response.text()).toBe(true);
}

export async function registerAndLoginViaUi(page: Page, user: TestUser) {
  await page.goto("/register");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Nome", { exact: true }).fill(user.name);
  await page.getByLabel("E-mail", { exact: true }).fill(user.email);
  await page.getByLabel("Senha", { exact: true }).fill(user.password);
  await page.getByLabel("Confirmar senha", { exact: true }).fill(user.password);
  const registrationResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/auth/register") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Criar conta" }).click();
  expect((await registrationResponse).ok()).toBe(true);

  await expect(page).toHaveURL(/\/login$/);
  await loginViaUi(page, user);
}

export async function loginViaUi(page: Page, user: TestUser) {
  await page.waitForLoadState("networkidle");
  const emailField = page.getByLabel("E-mail", { exact: true });
  await emailField.fill(user.email);
  await page.getByLabel("Senha", { exact: true }).fill(user.password);
  await expect(emailField).toHaveValue(user.email);
  const loginResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/auth/login") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  expect((await loginResponse).ok()).toBe(true);

  await expect(page).toHaveURL(/\/groups$/);
  await expect(page.getByRole("heading", { name: "Seus grupos" })).toBeVisible();
}
