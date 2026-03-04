FROM node:22-alpine AS builder
WORKDIR /app
# Build tools needed for native modules
RUN apk add --no-cache python3 make g++ openssl
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 5112
CMD ["node", "dist/main.js"]
