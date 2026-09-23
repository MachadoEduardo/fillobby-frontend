import { expect, test } from "@playwright/test";
import { createTestUser, E2E_API_URL, registerViaApi } from "./support/users";

test("aceita um convite por link após cadastro e login, sem entrar automaticamente", async ({
  page,
  request,
}) => {
  const owner = createTestUser("InviteOwner");
  const guest = createTestUser("InviteGuest");
  const groupName = `Grupo convite ${crypto.randomUUID().slice(0, 8)}`;
  await registerViaApi(request, owner);

  const login = await request.post(`${E2E_API_URL}/api/v1/auth/login`, {
    data: { email: owner.email, password: owner.password },
  });
  expect(login.ok(), await login.text()).toBe(true);
  const { data: auth } = await login.json();
  const created = await request.post(`${E2E_API_URL}/api/v1/groups`, {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: { name: groupName },
  });
  expect(created.ok(), await created.text()).toBe(true);
  const { data: group } = await created.json();
  const invitePath = `/invite/${group.inviteCode}`;
  let joinRequests = 0;
  page.on("request", (outgoing) => {
    if (outgoing.url().endsWith("/api/v1/groups/join") && outgoing.method() === "POST")
      joinRequests++;
  });

  await page.goto(invitePath);
  await expect(page.getByRole("heading", { name: "Convite para um grupo" })).toBeVisible();
  await page.getByRole("link", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(new RegExp(`/register\\?invite=${group.inviteCode}$`));
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("button", { name: "Criar conta" })).toBeEnabled();
  await page.getByLabel("Nome", { exact: true }).fill(guest.name);
  await page.getByLabel("E-mail", { exact: true }).fill(guest.email);
  await page.getByLabel("Senha", { exact: true }).fill(guest.password);
  await page.getByLabel("Confirmar senha", { exact: true }).fill(guest.password);
  expect(
    await page.locator("form").evaluate((form) =>
      Array.from(form.querySelectorAll("input"))
        .filter((input) => !input.checkValidity())
        .map((input) => input.id),
    ),
  ).toEqual([]);
  const registration = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/auth/register") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Criar conta" }).click();
  expect((await registration).ok()).toBe(true);

  await expect(page).toHaveURL(new RegExp(`/login\\?invite=${group.inviteCode}$`));
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeEnabled();
  await page.getByLabel("E-mail", { exact: true }).fill(guest.email);
  await page.getByLabel("Senha", { exact: true }).fill(guest.password);
  const authentication = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/auth/login") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  expect((await authentication).ok()).toBe(true);

  await expect(page).toHaveURL(new RegExp(`${invitePath}$`));
  expect(joinRequests).toBe(0);
  const firstJoin = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/groups/join") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Entrar no grupo" }).click();
  expect((await firstJoin).status()).toBe(201);
  await expect(page.getByRole("heading", { name: groupName })).toBeVisible();
  await expect(page.getByText("Sugira o primeiro jogo", { exact: false })).toBeVisible();

  await page.goto(invitePath);
  const repeatedJoin = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/groups/join") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Entrar no grupo" }).click();
  expect((await repeatedJoin).status()).toBe(200);
  await expect(page.getByRole("heading", { name: groupName })).toBeVisible();
});
