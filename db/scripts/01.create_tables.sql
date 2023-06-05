-- User -----------------------------------------------------------------------
-- Source of Truth is the user table in bytechID database
-- MORE: https://authguidance.com/2017/10/02/user-data/
CREATE SEQUENCE IF NOT EXISTS user_id_seq;

CREATE TABLE IF NOT EXISTS "user"
(
    id         BIGINT PRIMARY KEY                DEFAULT generate_uid(NEXTVAL('user_id_seq')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON COLUMN "user".id IS 'Id must match source data stored in BytechID database "user" table';

-- Company ---------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS company_id_seq;

CREATE TABLE IF NOT EXISTS company
(
    id          BIGINT PRIMARY KEY                DEFAULT generate_uid(NEXTVAL('company_id_seq')),
    name        VARCHAR(255)             NOT NULL,
    description VARCHAR(512)             NOT NULL,
    email       VARCHAR(255)             NOT NULL,
    phone       VARCHAR(25)              NOT NULL,
    website     VARCHAR(255),
    logo        VARCHAR(255),
    owner_id    BIGINT                   NOT NULL
        REFERENCES "user" (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP WITH TIME ZONE
);

-- Client ---------------------------------------------------------------
-- Client is a one to many relationship between a company and client
-- A company can have many clients, but a client can only belong to one company
CREATE TABLE IF NOT EXISTS client
(
    id               SERIAL PRIMARY KEY,
    company_id       BIGINT                   NOT NULL
        REFERENCES company (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    name             VARCHAR(255)             NOT NULL,
    point_of_contact VARCHAR(255),
    poc_email        VARCHAR(255),
    poc_phone        VARCHAR(255),
    website          VARCHAR(255),
    email            VARCHAR(255),
    phone            VARCHAR(24),
    notes            VARCHAR(1024),
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMP WITH TIME ZONE,
    CONSTRAINT client_company_id_unique UNIQUE (company_id, name)
);

COMMENT ON COLUMN client.name IS 'Name of the client. Usually the name of the company';
COMMENT ON COLUMN client.point_of_contact IS 'Name of the point of contact for the client';
COMMENT ON COLUMN client.poc_email IS 'Email of the point of contact for the client';
COMMENT ON COLUMN client.poc_phone IS 'Phone number of the point of contact for the client';
COMMENT ON COLUMN client.website IS 'Website of the client. Usually the website of the company';
COMMENT ON COLUMN client.email IS 'Email of the client. Usually the email of the company';
COMMENT ON COLUMN client.phone IS 'Phone number of the client. Usually the phone number of the company';

-- Address ---------------------------------------------------------------
-- Address can belong to a company or a user
CREATE TABLE IF NOT EXISTS address
(
    id         SERIAL PRIMARY KEY,
    street     VARCHAR(255),
    city       VARCHAR(255),
    state      VARCHAR(255),
    zip        VARCHAR(255),
    country    VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    company_id BIGINT
        REFERENCES company (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    user_id    BIGINT
        REFERENCES "user" (id)
            ON UPDATE CASCADE ON DELETE CASCADE,

    -- Either company_id or user_id must be set
    CONSTRAINT chk_address CHECK ( company_id IS NOT NULL OR user_id IS NOT NULL ),

    -- If user_id is set, street, city, state, zip, country must be set
    CONSTRAINT chk_user_address CHECK ( user_id IS NOT NULL OR
                                        (street IS NOT NULL AND city IS NOT NULL AND state IS NOT NULL AND
                                         zip IS NOT NULL AND country IS NOT NULL) )
);

-- Company_Member (Join Table) ---------------------------------------------------------------
-- Company_Member is a many to many relationship between users and companies
-- Company a user is a member of
CREATE TABLE IF NOT EXISTS company_member
(
    id          SERIAL PRIMARY KEY,
    member_id   BIGINT                   NOT NULL
        REFERENCES "user" (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    company_id  BIGINT                   NOT NULL
        REFERENCES company (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    permissions BIGINT                   NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN company_member.permissions IS 'Global permissions for the user in this company';

-- Invite ---------------------------------------------------------------
-- Invites are sent to users to join an organization
CREATE TABLE IF NOT EXISTS invite
(
    code            VARCHAR(12) PRIMARY KEY,
    uses            INTEGER                  NOT NULL DEFAULT 0,
    use_limit       INTEGER,
    created_by      BIGINT                   NOT NULL
        REFERENCES "user" (id)
            ON UPDATE CASCADE ON DELETE NO ACTION, -- Not using company_member because invites should remain valid if the user leaves the company
    organization_id BIGINT                   NOT NULL
        REFERENCES company (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    expires_at      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE,
    CONSTRAINT invite_code_unique UNIQUE (code)
);

COMMENT ON COLUMN invite.code IS 'Unique code for invite - Should be generated by the server';
COMMENT ON COLUMN invite.expires_at IS 'If not null, invite expires at this time';

-- Contract ---------------------------------------------------------------
-- Contracts belong to organizations and contain jobs that need to be completed
CREATE SEQUENCE IF NOT EXISTS contract_id_seq;
CREATE TABLE IF NOT EXISTS contract
(
    id          BIGINT PRIMARY KEY                DEFAULT NEXTVAL('contract_id_seq'),
    name        VARCHAR(255),
    description VARCHAR(1024),
    comment     VARCHAR(150),
    notes       VARCHAR(1024),
    due_date    TIMESTAMP WITH TIME ZONE,
    bill_to     SERIAL                   NOT NULL
        REFERENCES client (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    company_id  BIGINT                   NOT NULL
        REFERENCES company
            ON UPDATE CASCADE ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP WITH TIME ZONE
);

COMMENT ON COLUMN contract.name IS 'Name of the contract';
COMMENT ON COLUMN contract.bill_to IS 'Client that the contract is billed to';
COMMENT ON COLUMN contract.company_id IS 'The parent company of the contract';
COMMENT ON COLUMN contract.comment IS 'visible on invoice';
COMMENT ON COLUMN contract.notes IS 'internal use, not visible on invoice';


-- Contract_User (Join Table) ---------------------------------------------
-- Contract_User is a many to many relationship between a user and contract
CREATE TABLE IF NOT EXISTS contract_user
(
    user_id             BIGINT                   NOT NULL
        REFERENCES "user" (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    contract_id         BIGINT                   NOT NULL
        REFERENCES contract (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    permission_override BIGINT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMP WITH TIME ZONE,

    CONSTRAINT contract_user_unique UNIQUE (user_id, contract_id)
);
COMMENT ON COLUMN contract_user.user_id IS 'Not using company_member_id so data can be persistent even if the user leaves the company';
COMMENT ON COLUMN contract_user.permission_override IS 'If not null, ignore the permissions of the company_member and use this instead';

-- Job ------------------------------------------------------------------------
-- Jobs belong to contracts
CREATE SEQUENCE IF NOT EXISTS job_id_seq;
CREATE TABLE IF NOT EXISTS job
(
    id           BIGINT PRIMARY KEY                DEFAULT NEXTVAL('job_id_seq'),
    order_number VARCHAR(256),
    job_name     VARCHAR(256),
    description  VARCHAR(512),
    status       "enum_Jobs_status"                DEFAULT 'open'::"enum_Jobs_status",
    comment      VARCHAR(150),
    notes        VARCHAR(1024),
    due_date     TIMESTAMP WITH TIME ZONE,
    contract_id  BIGINT                   NOT NULL
        REFERENCES contract (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMP WITH TIME ZONE
);


COMMENT ON COLUMN job.order_number IS 'order_number is a UID usually provided by the client';
COMMENT ON COLUMN job.comment IS 'visible on invoice';
COMMENT ON COLUMN job.notes IS 'internal use, not visible on invoice';
COMMENT ON COLUMN job.status IS 'open, in_progress, completed, or cancelled';

-- Job_User (Join Table) ----------------------------------------------------
-- Job_User is a many to many relationship between a contract_user and job
-- Job_User is the user who is assigned to a job

CREATE TABLE IF NOT EXISTS job_user
(
    user_id             BIGINT                   NOT NULL
        REFERENCES "user" (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    job_id              BIGINT                   NOT NULL
        REFERENCES job (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    permission_override BIGINT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, job_id)
);

COMMENT ON COLUMN job_user.user_id IS 'Using the user_id and not company_member_id so data can be persistent even if the user leaves the company';
COMMENT ON COLUMN job_user.permission_override IS 'If not null, ignore the global and contract_user permissions and use this instead';

-- Invoice ---------------------------------------------------------------
-- Invoices belong to contracts and contain jobs that are completed
CREATE TABLE IF NOT EXISTS invoice
(
    id          VARCHAR(12) PRIMARY KEY,
    note        VARCHAR(512),
    contract_id BIGINT                   NOT NULL
        REFERENCES contract (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP WITH TIME ZONE
);

COMMENT ON COLUMN invoice.id IS '3 chars company name + 6 digit timestamp + 3 chars client name. Example: "COM123456CLI';

-- Invoice_Job (Join Table) ------------------------------------------------
-- Invoice_Job is a many to many relationship between an invoice and job
CREATE TABLE IF NOT EXISTS invoice_job
(
    invoice_id VARCHAR(12)              NOT NULL
        REFERENCES invoice (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    job_id     BIGINT                   NOT NULL
        REFERENCES job (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (invoice_id, job_id)
);

-- Expense --------------------------------------------------------------------
-- Expenses can belong to either jobs or contracts and can be marked as billable or not
CREATE SEQUENCE IF NOT EXISTS expense_id_seq;
CREATE TABLE IF NOT EXISTS expense
(
    id          BIGINT PRIMARY KEY                DEFAULT NEXTVAL('expense_id_seq'),
    cost        DOUBLE PRECISION,
    name        VARCHAR(255),
    description VARCHAR(512),
    notes       VARCHAR(1024),
    quantity    DOUBLE PRECISION,
    contract_id BIGINT
        REFERENCES contract (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    job_id      BIGINT
        REFERENCES job (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    is_billable BOOLEAN                           DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP WITH TIME ZONE,

    CONSTRAINT chk_expense CHECK (job_id IS NOT NULL OR contract_id IS NOT NULL) -- Only one of job_id or contract_id can be set
);

COMMENT ON COLUMN expense.id IS 'Primary key for expense table';
COMMENT ON COLUMN expense.cost IS 'Cost of the expense';
COMMENT ON COLUMN expense.is_billable IS 'If true, the expense will be billed to the client on the invoice';

-- Comment -----------------------------------------------------------------------
-- Comments can belong to any entity, and can contain attachments
CREATE SEQUENCE IF NOT EXISTS comment_id_seq;
CREATE TABLE IF NOT EXISTS comment
(
    id          BIGINT PRIMARY KEY                DEFAULT NEXTVAL('comment_id_seq'),
    content        VARCHAR(1024),
    created_by  BIGINT                   NOT NULL
        REFERENCES "user" (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP WITH TIME ZONE,
    invoice_id BIGINT
        REFERENCES invoice (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    expense_id BIGINT
        REFERENCES expense (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    job_id      BIGINT
        REFERENCES job (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    project_id BIGINT
        REFERENCES project (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    vendor_id   BIGINT                NOT NULL
        REFERENCES vendor (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_comment CHECK (invoice_id IS NOT NULL OR expense_id IS NOT NULL OR job_id IS NOT NULL OR project_id IS NOT NULL OR vendor_id IS NOT NULL) -- Only one of invoice_id, expense_id, job_id, project_id, or vendor_id can be set, or neither
);

COMMENT ON COLUMN comment.body IS 'body is the body of the comment';
COMMENT ON COLUMN comment.entity_id IS 'entity_id is the id of the entity that the comment belongs to';
COMMENT ON COLUMN comment.entity_type IS 'entity_type is the type of the entity that the comment belongs to';

-- Attachment -----------------------------------------------------------------------
-- Attachments can belong to comments
CREATE SEQUENCE IF NOT EXISTS attachment_id_seq;
CREATE TABLE IF NOT EXISTS attachment
(
    id          BIGINT PRIMARY KEY                DEFAULT NEXTVAL('attachment_id_seq'),
    file_name   VARCHAR(255),
    file_type   VARCHAR(255),
    file_size   BIGINT,
    file_path   VARCHAR(1024),
    comment_id  BIGINT                 NOT NULL
        REFERENCES comment (id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP WITH TIME ZONE
);

COMMENT ON COLUMN attachment.file_name IS 'file_name is the name of the file';
COMMENT ON COLUMN attachment.file_type IS 'file_type is the type of the file';
COMMENT ON COLUMN attachment.file_size IS 'file_size is the size of the file in bytes';
COMMENT ON COLUMN attachment.file_path IS 'file_path is the path of the file';
COMMENT ON COLUMN attachment.comment_id IS 'comment_id is the comment that the attachment belongs to';