FROM node:24-alpine

#for macbook, with windows remove this line
RUN apk add --no-cache python3 make g++ 
WORKDIR /home/node/app

# install pnpm globally
RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

COPY . .

ENTRYPOINT ["pnpm", "run", "start"]