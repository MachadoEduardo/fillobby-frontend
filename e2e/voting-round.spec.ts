import { expect, test } from "@playwright/test";
import { createTestUser, E2E_API_URL, registerViaApi } from "./support/users";

test("desempata uma rodada e mantém a sugestão não escolhida", async ({ browser, request }) => {
  const owner = createTestUser("RoundOwner");
  const voter = createTestUser("RoundVoter");
  await registerViaApi(request, owner);
  await registerViaApi(request, voter);
  const ownerLogin = await request.post(`${E2E_API_URL}/api/v1/auth/login`, {
    data: { email: owner.email, password: owner.password },
  });
  expect(ownerLogin.ok(), await ownerLogin.text()).toBe(true);
  const ownerSession = (await ownerLogin.json()).data;
  const ownerToken = ownerSession.token as string;
  const ownerHeaders = { Authorization: `Bearer ${ownerToken}` };
  const groupName = `Rodada ${crypto.randomUUID().slice(0, 8)}`;
  const created = await request.post(`${E2E_API_URL}/api/v1/groups`, {
    headers: ownerHeaders,
    data: { name: groupName },
  });
  expect(created.ok(), await created.text()).toBe(true);
  const group = (await created.json()).data;
  const voterLogin = await request.post(`${E2E_API_URL}/api/v1/auth/login`, {
    data: { email: voter.email, password: voter.password },
  });
  expect(voterLogin.ok(), await voterLogin.text()).toBe(true);
  const voterSession = (await voterLogin.json()).data;
  const voterHeaders = { Authorization: `Bearer ${voterSession.token}` };
  const joined = await request.post(`${E2E_API_URL}/api/v1/groups/join`, {
    headers: voterHeaders,
    data: { inviteCode: group.inviteCode },
  });
  expect(joined.status()).toBe(201);

  const titles = [
    `Jogo A ${crypto.randomUUID().slice(0, 5)}`,
    `Jogo B ${crypto.randomUUID().slice(0, 5)}`,
  ];
  for (const title of titles) {
    const gameResponse = await request.post(`${E2E_API_URL}/api/v1/games`, {
      headers: ownerHeaders,
      data: { title, platforms: ["PC"] },
    });
    expect(gameResponse.ok(), await gameResponse.text()).toBe(true);
    const gameId = (await gameResponse.json()).data.game.id;
    const suggestion = await request.post(`${E2E_API_URL}/api/v1/groups/${group.id}/queue`, {
      headers: ownerHeaders,
      data: { gameId },
    });
    expect(suggestion.status()).toBe(201);
  }

  const ownerContext = await browser.newContext();
  const voterContext = await browser.newContext();
  try {
    await ownerContext.addInitScript(({ token, user }) => {
      localStorage.setItem("fillobby.token", token);
      localStorage.setItem("fillobby.user", JSON.stringify(user));
    }, ownerSession);
    await voterContext.addInitScript(({ token, user }) => {
      localStorage.setItem("fillobby.token", token);
      localStorage.setItem("fillobby.user", JSON.stringify(user));
    }, voterSession);
    const ownerPage = await ownerContext.newPage();
    const voterPage = await voterContext.newPage();
    await ownerPage.goto(`/groups/${group.id}`);
    await ownerPage.getByRole("button", { name: "Iniciar votação", exact: true }).click();
    const startDialog = ownerPage.getByRole("dialog", { name: "Escolher jogos da votação" });
    for (const title of titles) await startDialog.getByText(title, { exact: true }).click();
    await startDialog.getByRole("button", { name: "Iniciar com 2 jogos" }).click();
    await expect(ownerPage.getByRole("heading", { name: "Votação aberta" })).toBeVisible();

    await voterPage.goto(`/groups/${group.id}`);
    for (const title of titles) {
      const card = voterPage.getByRole("article", { name: `Jogo na fila: ${title}` });
      await card.getByRole("button", { name: "Votar neste jogo" }).click();
      await expect(card.getByRole("button", { name: "Remover voto" })).toBeVisible();
    }

    await ownerPage.reload();
    await ownerPage.getByRole("button", { name: "Encerrar votação" }).click();
    const closeDialog = ownerPage.getByRole("dialog", { name: "Encerrar votação?" });
    await expect(closeDialog.getByText("Houve empate.")).toBeVisible();
    await closeDialog.getByText(titles[1], { exact: true }).click();
    await closeDialog.getByRole("button", { name: "Confirmar resultado" }).click();
    await expect(ownerPage.getByText(`Vencedor: ${titles[1]}`, { exact: false })).toBeVisible();
    await expect(
      ownerPage
        .getByRole("article", { name: `Jogo na fila: ${titles[1]}` })
        .getByText("A votação terminou.", { exact: false }),
    ).toBeVisible();
    const losingItem = ownerPage.getByRole("article", { name: `Jogo na fila: ${titles[0]}` });
    await expect(losingItem.getByText("Sugerido", { exact: true })).toBeVisible();
    await expect(losingItem.getByText("0", { exact: true })).toBeVisible();
  } finally {
    await ownerContext.close();
    await voterContext.close();
  }
});
