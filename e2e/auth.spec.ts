import { expect, test } from "@playwright/test";
import { createTestUser, loginViaUi, registerViaApi } from "./support/users";

test("protege rotas privadas e permite entrar com credenciais válidas", async ({
  page,
  request,
}) => {
  const user = createTestUser("Auth");
  await registerViaApi(request, user);

  await page.goto("/groups");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("E-mail", { exact: true }).fill(user.email);
  await page.getByLabel("Senha", { exact: true }).fill("InvalidPassword123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByText("Email ou senha invalidos.", { exact: true })).toBeVisible();

  await loginViaUi(page, user);
});
