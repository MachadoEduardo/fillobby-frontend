FROM node:24.21.0-bookworm-slim AS base

WORKDIR /app

FROM base AS dependencies

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS development

ENV NODE_ENV=development

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM dependencies AS build

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}
ENV NITRO_PRESET=node-server

COPY . .
RUN npm run build

FROM base AS production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
