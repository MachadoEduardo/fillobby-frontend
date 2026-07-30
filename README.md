# Fillobby — Frontend

Interface web do Fillobby, uma aplicação colaborativa para grupos de amigos
decidirem quais jogos jogar, organizarem participantes e acompanharem partidas
até o histórico.

- Aplicação: https://fillobby-frontend.vercel.app
- API: https://fillobby-backend.onrender.com
- Repositório do frontend:
  https://github.com/MachadoEduardo/fillobby-frontend
- Repositório do backend:
  https://github.com/MachadoEduardo/fillobby-backend

## Integrantes

- Eduardo Machado (`MachadoEduardo`);
- Miguel (`miguellima2011`);
- Guilherme (`lealgui670-boop`).

Os identificadores acima correspondem aos autores registrados no histórico dos
repositórios.

## Problema e solução

Grupos de amigos frequentemente têm dificuldade para escolher um jogo,
organizar quem participará e confirmar se todos estão prontos. Essas decisões
acabam espalhadas entre mensagens e enquetes.

O Fillobby reúne esse processo em um único fluxo. Usuários criam grupos ou
entram por convite, cadastram jogos, fazem sugestões, votam, selecionam
participantes, confirmam prontidão e consultam o histórico das partidas
concluídas.

## Funcionalidades

- cadastro e login;
- navegação protegida para usuários autenticados;
- criação, listagem, edição e inativação de grupos;
- entrada em grupos por código de convite;
- administração de membros, papéis e propriedade;
- catálogo de jogos com busca e filtro por plataforma;
- criação, edição e inativação de jogos;
- fila de jogos por grupo;
- votação única por usuário;
- seleção de participantes e confirmação de prontidão;
- transições de status até a conclusão da partida;
- histórico com filtros;
- edição de nome e avatar;
- troca autenticada de senha;
- seleção de plataformas preferidas e badges no perfil;
- mensagens de sucesso, validação e erro retornadas pela API;
- layout responsivo para desktop e dispositivos móveis.

## Tecnologias

- React;
- TypeScript;
- TanStack Start;
- TanStack Router;
- TanStack Query;
- Vite;
- Tailwind CSS;
- Radix UI;
- Lucide React;
- Sonner;
- ESLint e Prettier.

## Arquitetura

```text
Tela ou componente
        |
        v
TanStack Query / AuthProvider
        |
        v
src/lib/api.ts
        |
        | HTTPS + JSON + JWT
        v
API Fillobby no Render
        |
        v
MongoDB Atlas
```

A camada `src/lib/api.ts` centraliza:

- a URL da API;
- envio do JWT;
- serialização de query strings;
- interpretação do envelope de resposta;
- tratamento de falhas de rede;
- encerramento da sessão quando o token é inválido.

O `AuthProvider` mantém o usuário autenticado, valida a sessão com
`GET /api/v1/auth/me` e disponibiliza login, logout e atualização do perfil.
TanStack Query controla consultas, mutations, cache e sincronização das telas.

## Estrutura principal

```text
src/
├── components/       Componentes compartilhados e componentes de interface
├── lib/
│   ├── api.ts        Cliente HTTP e funções por domínio
│   ├── api-types.ts  Tipos do contrato da API
│   └── auth.tsx      Contexto de autenticação
└── routes/
    ├── login.tsx
    ├── register.tsx
    ├── _authenticated.tsx
    ├── _authenticated.groups.index.tsx
    ├── _authenticated.groups.$groupId.tsx
    ├── _authenticated.games.tsx
    └── _authenticated.profile.tsx
```

## Pré-requisitos

- Node.js 22 ou versão compatível;
- npm;
- backend Fillobby local ou publicado.

## Instalação

```bash
git clone https://github.com/MachadoEduardo/fillobby-frontend.git
cd fillobby-frontend
npm install
```

Crie o arquivo local de ambiente:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

## Variáveis de ambiente

| Variável       | Obrigatória | Exemplo                 | Finalidade          |
| -------------- | ----------- | ----------------------- | ------------------- |
| `VITE_API_URL` | Sim         | `http://localhost:3000` | URL base do backend |

Para consumir a API publicada:

```env
VITE_API_URL=https://fillobby-backend.onrender.com
```

Não inclua barra no final da URL.

## Execução

Ambiente de desenvolvimento:

```bash
npm run dev
```

Por padrão, o Vite disponibiliza a aplicação em
`http://localhost:5173`.

Build de produção:

```bash
npm run build
```

Pré-visualização do build:

```bash
npm run preview
```

Análise estática:

```bash
npm run lint
```

## Scripts

| Comando             | Descrição                               |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Inicia o servidor de desenvolvimento    |
| `npm run build`     | Gera o build de produção                |
| `npm run build:dev` | Gera o build no modo de desenvolvimento |
| `npm run preview`   | Executa a pré-visualização do build     |
| `npm run lint`      | Executa o ESLint                        |
| `npm run format`    | Formata o projeto com Prettier          |

## Executando a solução completa localmente

Em um terminal, inicie o backend:

```bash
git clone https://github.com/MachadoEduardo/fillobby-backend.git
cd fillobby-backend
npm install
cp .env.example .env
npm run dev
```

Configure `MONGO_URI`, `JWT_SECRET` e as demais variáveis descritas no README
do backend.

Em outro terminal, inicie este frontend:

```bash
cd fillobby-frontend
npm install
npm run dev
```

O arquivo `.env` do frontend deve conter:

```env
VITE_API_URL=http://localhost:3000
```

## Rotas da interface

| Rota               | Acesso       | Descrição                          |
| ------------------ | ------------ | ---------------------------------- |
| `/register`        | Público      | Cadastro                           |
| `/login`           | Público      | Login                              |
| `/groups`          | Autenticado  | Lista, criação e entrada em grupos |
| `/groups/:groupId` | Membro ativo | Grupo, fila, membros e histórico   |
| `/games`           | Autenticado  | Catálogo e CRUD de jogos           |
| `/profile`         | Autenticado  | Nome, avatar, senha e preferências |

A proteção do frontend melhora a navegação, mas a autorização real é sempre
validada novamente pelo backend.

## Integração e erros

A API responde com envelopes padronizados.

Sucesso:

```json
{
  "success": true,
  "data": {}
}
```

Erro:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados invalidos.",
    "details": [
      {
        "field": "body.password",
        "message": "Senha deve conter letra maiuscula"
      }
    ]
  }
}
```

O frontend utiliza `code` para decisões programáticas, `message` para avisos e
`details` para associar mensagens aos campos dos formulários.

## Deploy na Vercel

O projeto usa o preset da Vercel no TanStack Start.

1. importe o repositório na Vercel;
2. mantenha o comando de build `npm run build`;
3. configure `VITE_API_URL` com a URL pública do backend;
4. faça o deploy;
5. configure a URL gerada como `FRONTEND_URL` no backend;
6. faça novo deploy do backend caso a origem tenha mudado.

## Credenciais de teste

Não existem credenciais públicas fixas no repositório. Para testar, crie uma
conta pela tela de cadastro.

Nunca publique senhas, tokens, arquivos `.env` ou credenciais do MongoDB.
