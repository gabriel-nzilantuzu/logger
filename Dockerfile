FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:20
WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./

COPY --from=builder /app/server.js /app/server.js

RUN npm install --production --legacy-peer-deps

ENV NODE_ENV=production
ENV PORT=3000


EXPOSE 3000

CMD ["node", "/app/server.js"]