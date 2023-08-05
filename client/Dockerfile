FROM node:18-alpine as build

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .

# build the app
RUN npm run build

CMD ["npm", "run", "start"]