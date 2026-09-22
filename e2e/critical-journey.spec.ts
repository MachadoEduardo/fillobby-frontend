import { expect, test, type Locator, type Page } from "@playwright/test";
import { createTestUser, registerAndLoginViaUi } from "./support/users";

test("conclui o fluxo central de uma partida entre dois membros", async ({ browser }) => {
  const ownerContext = await browser.newContext();
  const memberContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage();
  const memberPage = await memberContext.newPage();
  const owner = createTestUser("Owner");
  const member = createTestUser("Member");
  const suffix = crypto.randomUUID().slice(0, 8);
  const groupName = `Lobby E2E ${suffix}`;
  const gameName = `Game E2E ${suffix}`;

  try {
    await test.step("cadastrar e autenticar os dois usuários pela interface", async () => {
      await registerAndLoginViaUi(ownerPage, owner);
      await registerAndLoginViaUi(memberPage, member);
    });

    let groupUrl = "";
    let inviteCode = "";

    await test.step("criar o grupo e obter seu convite", async () => {
      await ownerPage.getByRole("button", { name: "Novo grupo" }).click();
      await ownerPage.getByLabel("Nome do grupo").fill(groupName);
      await ownerPage.getByRole("button", { name: "Criar grupo", exact: true }).click();

      const groupLink = ownerPage.getByRole("link", { name: `Abrir o grupo ${groupName}` });
      await expect(groupLink).toBeVisible();
      await groupLink.click();
      await expect(ownerPage.getByRole("heading", { name: groupName })).toBeVisible();

      groupUrl = new URL(ownerPage.url()).pathname;
      inviteCode = (await ownerPage.getByLabel("Código de convite").textContent())?.trim() ?? "";
      expect(inviteCode).not.toBe("");
    });

    await test.step("entrar no grupo pelo código de convite", async () => {
      await memberPage.getByRole("button", { name: "Entrar por código" }).click();
      await memberPage.getByLabel("Código de convite").fill(inviteCode);
      await memberPage.getByRole("button", { name: "Entrar no grupo", exact: true }).click();

      const groupLink = memberPage.getByRole("link", { name: `Abrir o grupo ${groupName}` });
      await expect(groupLink).toBeVisible();
      await groupLink.click();
      await expect(memberPage.getByRole("heading", { name: groupName })).toBeVisible();
    });

    await test.step("cadastrar um jogo e sugeri-lo na fila", async () => {
      await ownerPage.goto("/games");
      await ownerPage.getByRole("button", { name: "Novo jogo" }).click();
      const gameDialog = ownerPage.getByRole("dialog", { name: "Adicionar jogo" });
      await gameDialog.getByLabel("Título").fill(gameName);
      await gameDialog.getByRole("checkbox", { name: "PC" }).check();
      await gameDialog.getByLabel("Máximo de jogadores").fill("2");
      await gameDialog.getByRole("button", { name: "Adicionar jogo", exact: true }).click();
      await expect(ownerPage.getByText(gameName, { exact: true })).toBeVisible();

      await ownerPage.goto(groupUrl);
      await ownerPage.getByRole("button", { name: "Sugerir jogo" }).click();
      const suggestDialog = ownerPage.getByRole("dialog", { name: "Sugerir um jogo" });
      await suggestDialog.getByLabel("Buscar jogo por título").fill(gameName);
      await suggestDialog.getByRole("button", { name: new RegExp(gameName) }).click();
      await expect(queueItem(ownerPage, gameName)).toBeVisible();
    });

    await test.step("votar e selecionar os dois participantes", async () => {
      await queueItem(ownerPage, gameName).getByRole("button", { name: "Iniciar votação" }).click();

      await memberPage.goto(groupUrl);
      const memberItem = queueItem(memberPage, gameName);
      await memberItem.getByRole("button", { name: "Votar neste jogo" }).click();
      await expect(memberItem.getByRole("button", { name: "Remover voto" })).toBeVisible();

      await ownerPage.reload();
      await queueItem(ownerPage, gameName)
        .getByRole("button", { name: "Selecionar participantes" })
        .click();
      const participantsDialog = ownerPage.getByRole("dialog", {
        name: "Selecionar participantes",
      });
      await participantsDialog.getByRole("checkbox", { name: owner.name }).check();
      await participantsDialog.getByRole("checkbox", { name: member.name }).check();
      await participantsDialog.getByRole("button", { name: "Salvar participantes" }).click();
      await expect(queueItem(ownerPage, gameName).getByText("0/2")).toBeVisible();
    });

    await test.step("confirmar prontidão, jogar e concluir a partida", async () => {
      await queueItem(ownerPage, gameName).getByRole("button", { name: "Estou pronto" }).click();

      await memberPage.reload();
      await queueItem(memberPage, gameName).getByRole("button", { name: "Estou pronto" }).click();

      await ownerPage.reload();
      await queueItem(ownerPage, gameName).getByRole("button", { name: "Iniciar partida" }).click();
      await queueItem(ownerPage, gameName)
        .getByRole("button", { name: "Concluir partida" })
        .click();
      await expect(queueItem(ownerPage, gameName)).toHaveCount(0);
    });

    await test.step("consultar a partida concluída no histórico", async () => {
      await ownerPage.getByRole("tab", { name: "Histórico" }).click();
      const historyItem = ownerPage.getByRole("article", {
        name: `Partida concluída: ${gameName}`,
      });
      await expect(historyItem).toBeVisible();
      await historyItem.getByRole("button", { name: /Participantes da partida/ }).click();
      await expect(historyItem.getByText(owner.name, { exact: true })).toBeVisible();
      await expect(historyItem.getByText(member.name, { exact: true })).toBeVisible();
    });
  } finally {
    await ownerContext.close();
    await memberContext.close();
  }
});

function queueItem(page: Page, gameName: string): Locator {
  return page.getByRole("article", { name: `Jogo na fila: ${gameName}` });
}
