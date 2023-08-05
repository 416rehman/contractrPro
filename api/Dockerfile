FROM node:18-alpine

#for macbook, with windows remove this line
RUN apk add --no-cache python3 make g++ 
WORKDIR /home/node/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

ENTRYPOINT ["npm", "run", "start"]