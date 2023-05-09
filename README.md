# Contractor Pro

This project consists of 3 parts:

    - Database: Postgres
    - API: Express
    - Client: React

## Getting Started

Start the Database and API docker containers, and open the client in your browser.

**NOTE:** The following commands should be run in the project directory.

### To accomplish the above with one command, run:

```bash
# Starts the database and API containers and opens the client in your browser.
cd ./db && docker-compose up -d && cd ../api && docker-compose up -d && cd ../client && npm start
```

### To start each service individually:

```bash
### Start the Database container
cd ./db && docker-compose up -d && cd ..
```

```bash
### Start the API container
cd ./api && docker-compose up -d && cd ..
```

```bash
### Run and open the client in your browser
cd ./client && npm start
```

Access the client in your browser at [http://localhost:3000](http://localhost:3000).
Access the API at [http://localhost:4000](http://localhost:4000).
Access the Database at [http://localhost:5432](http://localhost:5432).
