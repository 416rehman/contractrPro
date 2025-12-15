FROM node:24-alpine as build

WORKDIR /app

# install pnpm globally
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# build the app
RUN pnpm run build

CMD ["pnpm", "run", "start"]