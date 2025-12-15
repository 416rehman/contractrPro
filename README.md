# Contractr Pro

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
cd ./api; npm install; cd ../client; npm install; cd ..
```
2. Start the database (might take a minute or two to start up)
```bash
cd ./db; docker compose up -d; cd ..
```
3. Start the API
```bash
cd ./api; docker compose up -d; cd ..
```
4. Start the client
```bash
cd ./client; npm run dev
```

Access the client in your browser at [http://localhost:3000](http://localhost:3000). <br>
Access the API at [http://localhost:4000](http://localhost:4000). <br>
Access the Database at [http://localhost:5432](http://localhost:5432).

# What is Contraman

Name is WIP. Here is everything, A to Z, about contraman.

Contraman is a streamlined, mobile-first business and project management platform purpose-built for contractors. It simplifies the entire project lifecycle—from initial client contact to final payment—with an emphasis on "minimal friction."

Contraman provides a unified, all-in-one solution for:
  1. Project & Task Management: Organize projects, assign tasks, and optimize team dispatching based on criteria like location, availability, and priority.
  2. Financial Management: Track accounts, manage transactions, generate invoices, and handle payments and bills.
  3. Team & Client Communication: Centralized company inbox and internal chat space.

## Philosophy

- **Minimal Friction**:
Make as many fields optional as possible.
  - Data should only be required when absolutely necessary.
  - Use sensible defaults and auto-generation (e.g. new company → default to "My Company").

- **Mobile-First Design**:
Prioritize responsive, mobile-first UI for consistent experiences across all devices.

- **Progressive Onboarding**:
Let users start fast — verification and deeper config can come later.

- **APIs & Automation First**:
Everything a user can do manually should be triggerable by a bot or script.

## Features

- Business:
    - Company Inbox (for any outside messages/queries)

    - Dashboard
        - At a glance view of company
        - charts/diagrams i.e (profit/loss)
        - contracts nearing deadline
        - pending payments

    - Company-wide chat space (for messaging between all employees)

    - Clients (issue contracts)

    - Members: (Employees, workers, contractors)
        - Roles can be assigned to members to restrict/grant them permissions

    - Projects / Contracts:
        - Tasks (with a task matching system)
        - Threads (for documents, notes etc per project. "Files" tab aggregates all docs/attachments)

    - Assignments (i.e person X assigned to task Y, and Z)
        - Dispatching system to plan member assignments to tasks based on criterias like:
            - location clusering: member x is assigned job a, and job b is in proximity to that so assign same member to it
            - time: member x is available on tuesday, and job y is due on wednesday, assign them the job
            - priority: a job is high priority because of a client request, hence it should be done ASAP.
            - ... more i cant think of
        - Aggregates all assignments across all projects/tasks
        - Workload monitoring:
            - Company members can record their workloads, i.e X worked 3 hours yesterday on task y and z
            - Members can optionally have limited number of hours they can work i.e per day,week,month etc
            - Here all of that can be monitored

    - Finances:
        - Financial Accounts (i.e Assets, Liabilities & Credit Cards, Income, Expenses, Equity)
            - These help in taxes, creating reports, etc
            - Wave (waveapps.com) has good examples.
            - Transactions are for financial accounts (i.e all expenses go to the expenses account)
        - Tax Rates (configurable tax rates. i.e gst/hst)
        - Transactions/Payments (reviewable)
            - Withdrawals (i.e paying vendors, buying gas. standalone, linked to contract and or tasks)
            - Deposits (all incoming money, i.e after client pays an invoice. standalone, linked to contract and or tasks)
        - Invoices (i.e contract A finished, so send invoice to client to pay us. Can be generated from contracts)
            - Make Deposit transactions linked to this, so "amount due" == 0 to mark it as "paid".
                - Receipts (i.e after invoice has been paid)
        - Bills (i.e bought $100 paint for contract A and B from Vendor dulux)
            - Create Withdrawal transactions linked to this bill, so "amount due" == 0 to mark it as "paid".
            - Unpaid: when we havent paid any money to the vendor
            - Partially Paid: when we have paid some money but not the entire "amount due"
            - Paid: when we have paid the entire "amount due"
                - Overpaid (should we have this?): when we have paid MORE than the "amount due".

    - Company-wide Search:
        - with filters (i.e "type: project | message (in chat or threads) | task | invoice | bill | transaction | file; author: omar; ")

    - Automation:
        - Bots running in the company's context (i.e Websockets API broadcasts events to all bots in company)
            - The bots do operations on events, examples include:
                - on new member join, send welcome message to their inbox
                - contract became overdue, send message to all members assigned to incomplete tasks
                - on new task created, auto assign a member to it
                - .... possibilities are endless

    - Business Profile (not a must until CrewCalls is implements)
        - public facing page of your business

    - Reports (i.e profit & loss, sales tax)
        - Can be exported as pdf, or other formats
        - These are dynamic reports that the user can change preconfigured filters. filters are report dependent.
            - i.e. a profit & loss report will have a date range
            - i.e. an "income by customers" report will have a "customers" filter, and date range

    - Settings
        - Invoice and receipt customization (colors, headings, etc)
        - Currency used by company
        - Fiscal year end and date format (everything is stored in UTC, this format is only for client side)

- User:
    - Auth with username/phone/email and password (or passkeys, google, intuit, etc)
    - Personal dashboard / Planner
        - Keeps track of important things, i.e tasks nearing due date
        - Generate plans to work on tasks in specific orders (i.e proximity to task locations, priority, time, etc)

    - Messaging (user <-> user <-> company (company inbox))

## Tech:

### Communication

- Rest APIs to perform CRUD operations.
- websockets to send events to bots, and client (browser app) for realtime updates.

### Authentication

- Visitng the tld like "contraman.com" takes you to a landing page, marketing the platform.
    - A button can be pressed to take user to login page.
    - Auth with username/phone/email and password, webauthn for passkeys, or external identity providers like google, intuit, etc
        - Receive a refresh token when authenticated (after login or signup)
        - Use the refresh token to generate an access token (through `/token` endpoint)
        - Use the generated token to interact with other endpoints (expires after 15 mins)
        - after Expiry, use refreshToken to generate a new accessToken
    - After auth, the user is redirected to another sub tld like "app.contraman.com". This app is the main platform.

### Onboarding

- After signup and logging in
    - The user's account is "unverified", and they are given the option to enter their country/phone number.
    - Entering the phone number sends them a verification code (via Twilio).
    - The code is entered in an input shown to them on the page, and sets their account status to "active".
- the user has the option to join an existing company via an invite-code, or create their own company.

## Third Party

- Twilio: for texts (auth codes, mfa, notifications)
- Plaid: Banking integration (for syncing bank transactions, i.e their bank transactions should show up in contramans transactions)
