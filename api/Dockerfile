FROM node:18-alpine
WORKDIR /home/node/app

COPY package*.json ./
RUN npm install

COPY . .

ENTRYPOINT ["npm", "run", "dev"]
