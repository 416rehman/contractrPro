# Contractor Pro

This project consists of 3 parts:

    - Database: Postgres
    - API: Express
    - Client: React

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js (Bundled with NPM)](https://nodejs.org/en/download/)

## Getting Started
*All the commands must be run from the root of the project*

1. Install the NPM packages for client and API. 
```bash
cd ./api && npm install && cd ../client && npm install && cd ..
```
2. Start the Database and API docker containers, and open the client in your browser.
```bash
cd ./db && docker-compose up -d && cd ../api && docker-compose up -d && cd ../client && npm start
```

Access the client in your browser at [http://localhost:3000](http://localhost:3000). <br>
Access the API at [http://localhost:4000](http://localhost:4000). <br>
Access the Database at [http://localhost:5432](http://localhost:5432).
