FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --fetch-retries=5 --fetch-retry-factor=2 --network-timeout=1000000
COPY . .
RUN npm run build
CMD ["npm", "start"]
