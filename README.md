# Contractor Pro

This project consists of 3 parts:

    - Database: Postgres
    - API: Express
    - Client: React

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js (Bundled with NPM)](https://nodejs.org/en/download/)

On Windows, you can download and install Docker Desktop for Windows, which includes both Docker and Docker Compose.
Visit https://docs.docker.com/desktop/install/windows-install/ and follow the instructions.
Once installed, open the start menu and search for Docker Desktop. Open the application and wait for it to start.

## Getting Started
*All the commands must be run from the root of the project*

1. Install the NPM packages for client and API. 
```bash
cd ./api && npm install && cd ../client && npm install && cd ..
```
2. Start the database (might take a minute or two to start up)
```bash
cd ./db && docker compose up -d && cd ..
```
3. Start the API
```bash
cd ./api && docker compose up -d && cd ..
```
4. Start the client
```bash
cd ./client && npm start
```

Access the client in your browser at [http://localhost:3000](http://localhost:3000). <br>
Access the API at [http://localhost:4000](http://localhost:4000). <br>
Access the Database at [http://localhost:5432](http://localhost:5432).
