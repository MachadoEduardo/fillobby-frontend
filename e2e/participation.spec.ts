import { expect, test } from "@playwright/test";
import { createTestUser, E2E_API_URL, registerViaApi } from "./support/users";

test("permite inscrição e saída voluntária antes da partida", async ({ browser, request }) => {
  const owner = createTestUser("ParticipationOwner");
  const member = createTestUser("ParticipationMember");
  await registerViaApi(request, owner);
  await registerViaApi(request, member);

  async function login(email: string, password: string) {
    const response = await request.post(`${E2E_API_URL}/api/v1/auth/login`, {
      data: { email, password },
    });
    expect(response.ok(), await response.text()).toBe(true);
    return (await response.json()).data as { token: string; user: unknown };
  }

  const ownerSession = await login(owner.email, owner.password);
  const memberSession = await login(member.email, member.password);
  const ownerHeaders = { Authorization: `Bearer ${ownerSession.token}` };
  const memberHeaders = { Authorization: `Bearer ${memberSession.token}` };
  const groupResponse = await request.post(`${E2E_API_URL}/api/v1/groups`, {
    headers: ownerHeaders,
    data: { name: `Participação ${crypto.randomUUID().slice(0, 8)}` },
  });
  expect(groupResponse.ok(), await groupResponse.text()).toBe(true);
  const group = (await groupResponse.json()).data;
  const joined = await request.post(`${E2E_API_URL}/api/v1/groups/join`, {
    headers: memberHeaders,
    data: { inviteCode: group.inviteCode },
  });
  expect(joined.status()).toBe(201);
  const gameTitle = `Jogo participação ${crypto.randomUUID().slice(0, 6)}`;
  const gameResponse = await request.post(`${E2E_API_URL}/api/v1/games`, {
    headers: ownerHeaders,
    data: { title: gameTitle, platforms: ["PC"], maxPlayers: 2 },
  });
  expect(gameResponse.ok(), await gameResponse.text()).toBe(true);
  const gameId = (await gameResponse.json()).data.game.id;
  const queueResponse = await request.post(`${E2E_API_URL}/api/v1/groups/${group.id}/queue`, {
    headers: ownerHeaders,
    data: { gameId },
  });
  expect(queueResponse.status()).toBe(201);
  const itemId = (await queueResponse.json()).data.id;
  const roundResponse = await request.post(
    `${E2E_API_URL}/api/v1/groups/${group.id}/voting-rounds`,
    {
      headers: ownerHeaders,
      data: { candidateIds: [itemId] },
    },
  );
  expect(roundResponse.status()).toBe(201);
  const roundId = (await roundResponse.json()).data.id;
  expect(
    (
      await request.post(`${E2E_API_URL}/api/v1/groups/${group.id}/queue/${itemId}/votes`, {
        headers: memberHeaders,
        data: {},
      })
    ).status(),
  ).toBe(201);
  expect(
    (
      await request.post(
        `${E2E_API_URL}/api/v1/groups/${group.id}/voting-rounds/${roundId}/close`,
        { headers: ownerHeaders, data: {} },
      )
    ).status(),
  ).toBe(200);

  const ownerContext = await browser.newContext();
  const memberContext = await browser.newContext();
  try {
    for (const [context, session] of [
      [ownerContext, ownerSession],
      [memberContext, memberSession],
    ] as const) {
      await context.addInitScript(({ token, user }) => {
        localStorage.setItem("fillobby.token", token);
        localStorage.setItem("fillobby.user", JSON.stringify(user));
      }, session);
    }
    const ownerPage = await ownerContext.newPage();
    const memberPage = await memberContext.newPage();
    await ownerPage.goto(`/groups/${group.id}`);
    const ownerCard = ownerPage.getByRole("article", { name: `Jogo na fila: ${gameTitle}` });
    await ownerCard.getByRole("button", { name: "Permitir inscrições" }).click();
    await expect(ownerCard.getByRole("button", { name: "Fechar inscrições" })).toBeVisible();

    await memberPage.goto(`/groups/${group.id}`);
    const memberCard = memberPage.getByRole("article", { name: `Jogo na fila: ${gameTitle}` });
    await memberCard.getByRole("button", { name: "Quero jogar" }).click();
    await expect(memberCard.getByRole("button", { name: "Sair da partida" })).toBeVisible();
    await memberCard.getByRole("button", { name: "Estou pronto" }).click();
    await expect(memberCard.getByRole("button", { name: "Não estou pronto" })).toBeVisible();
    await memberCard.getByRole("button", { name: "Sair da partida" }).click();
    await expect(memberCard.getByRole("button", { name: "Quero jogar" })).toBeVisible();
    await expect(memberCard.getByText("0/2 jogadores")).toBeVisible();

    await ownerPage.reload();
    await ownerCard.getByRole("button", { name: "Fechar inscrições" }).click();
    await ownerCard.getByRole("button", { name: "Selecionar participantes" }).click();
    const dialog = ownerPage.getByRole("dialog", { name: "Selecionar participantes" });
    await dialog.getByRole("checkbox", { name: member.name }).check();
    await dialog.getByRole("button", { name: "Salvar participantes" }).click();
    await memberPage.reload();
    await memberCard.getByRole("button", { name: "Sair da partida" }).click();
    await expect(memberCard.getByRole("button", { name: "Quero jogar" })).toHaveCount(0);
  } finally {
    await ownerContext.close();
    await memberContext.close();
  }
});
