import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, bigint, numeric, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Users & Auth ---
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    username: text('username').notNull().unique(),
    phone: text('phone').unique(),
    email: text('email').unique(),
    password: text('password').notNull(),
    refreshToken: text('refresh_token'),
    avatarUrl: text('avatar_url'),
    phoneCountry: text('phone_country'),
    phoneNumber: text('phone_number'),
    flags: integer('flags').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tokens = pgTable('tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: text('type').notNull(),
    value: text('value').notNull(),
    flags: integer('flags').default(0),
    meta: jsonb('meta'),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Organizations ---
export const organizations = pgTable('organizations', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    taxId: text('tax_id'),
    timezone: text('timezone').default('UTC'),
    currency: text('currency').default('USD'),
    logo: text('logo'),
    ownerId: uuid('owner_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const organizationMembers = pgTable('organization_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    role: text('role').notNull().default('member'),
    status: text('status').notNull().default('active'),
    name: text('name'),
    email: text('email'),
    phone: text('phone'),
    website: text('website'),
    description: text('description'),
    permissions: jsonb('permissions'),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: uuid('updated_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    flags: integer('flags').default(0),
});

// --- CRM ---
export const clients = pgTable('clients', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    description: text('description'),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: uuid('updated_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const vendors = pgTable('vendors', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    description: text('description'),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: uuid('updated_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Projects ---
export const contracts = pgTable('contracts', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').default('draft'),
    startDate: timestamp('start_date'),
    dueDate: timestamp('due_date'),
    completionDate: timestamp('completion_date'),
    clientId: uuid('client_id').references(() => clients.id),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: uuid('updated_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const jobs = pgTable('jobs', {
    id: uuid('id').defaultRandom().primaryKey(),
    reference: text('reference'),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').default('pending'),
    startDate: timestamp('start_date'),
    dueDate: timestamp('due_date'),
    payout: numeric('payout'),
    contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const jobMembers = pgTable('job_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
    organizationMemberId: uuid('organization_member_id').references(() => organizationMembers.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Finances ---
export const invoices = pgTable('invoices', {
    id: uuid('id').defaultRandom().primaryKey(),
    invoiceNumber: text('invoice_number'),
    issueDate: timestamp('issue_date'),
    dueDate: timestamp('due_date'),
    poNumber: text('po_number'),
    note: text('note'),
    taxRate: numeric('tax_rate'),
    status: text('status').default('draft'),
    amount: numeric('amount').default('0'),
    balance: numeric('balance').default('0'),
    billToClientId: uuid('bill_to_client_id').references(() => clients.id),
    contractId: uuid('contract_id').references(() => contracts.id),
    jobId: uuid('job_id').references(() => jobs.id),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: uuid('updated_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoiceEntries = pgTable('invoice_entries', {
    id: uuid('id').defaultRandom().primaryKey(),
    description: text('description'),
    quantity: numeric('quantity'),
    unitCost: numeric('unit_cost'),
    invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expenses = pgTable('expenses', {
    id: uuid('id').defaultRandom().primaryKey(),
    reference: text('reference'),
    amount: numeric('amount').notNull(),
    date: timestamp('date'),
    description: text('description'),
    category: text('category'),
    status: text('status').default('pending'),
    taxRate: numeric('tax_rate'),
    vendorId: uuid('vendor_id').references(() => vendors.id),
    contractId: uuid('contract_id').references(() => contracts.id),
    jobId: uuid('job_id').references(() => jobs.id),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: uuid('updated_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contractMembers = pgTable('contract_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
    organizationMemberId: uuid('organization_member_id').references(() => organizationMembers.id, { onDelete: 'cascade' }).notNull(),
    permissions: jsonb('permissions'),
    updatedByUserId: uuid('updated_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expenseEntries = pgTable('expense_entries', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name'),
    description: text('description'),
    quantity: numeric('quantity'),
    unitCost: numeric('unit_cost'),
    amount: numeric('amount'),
    expenseId: uuid('expense_id').references(() => expenses.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Misc ---
export const comments = pgTable('comments', {
    id: uuid('id').defaultRandom().primaryKey(),
    content: text('content').notNull(),
    authorId: uuid('author_id').references(() => users.id),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    // Polymorphic associations are tricky in strict SQL, easiest to have nullable FKs or separate tables.
    // Assuming simple nullable FKs for now based on typical modernization patterns while keeping one table.
    contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }),
    jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }),
    clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }),
    vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }),
    invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }),
    expenseId: uuid('expense_id').references(() => expenses.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const attachments = pgTable('attachments', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    size: bigint('size', { mode: 'number' }).notNull(),
    accessUrl: text('access_url').notNull(),
    commentId: uuid('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
    // Similarly, attachments likely link to comments or directly to entities.
    // Based on previous code (createComment), attachments were linked to comments.
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const addresses = pgTable('addresses', {
    id: uuid('id').defaultRandom().primaryKey(),
    street: text('street'),
    city: text('city'),
    state: text('state'),
    zip: text('zip'),
    country: text('country'),
    clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }),
    vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invites = pgTable('invites', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    token: text('token').notNull(),
    role: text('role').default('member'),
    maxUses: integer('max_uses').default(1),
    uses: integer('uses').default(0).notNull(),
    forOrganizationMemberId: uuid('for_organization_member_id').references(() => organizationMembers.id),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    inviterId: uuid('inviter_id').references(() => users.id),
    accepted: boolean('accepted').default(false),
    updatedByUserId: uuid('updated_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Relations Definitions ---

export const usersRelations = relations(users, ({ many }) => ({
    tokens: many(tokens),
    organizationMemberships: many(organizationMembers),
    ownedOrganizations: many(organizations),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
    user: one(users, {
        fields: [tokens.userId],
        references: [users.id],
    }),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
    owner: one(users, {
        fields: [organizations.ownerId],
        references: [users.id],
    }),
    members: many(organizationMembers),
    contracts: many(contracts),
    invoices: many(invoices),
    clients: many(clients),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [organizationMembers.organizationId],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [organizationMembers.userId],
        references: [users.id],
    }),
    jobMembers: many(jobMembers),
    contractMembers: many(contractMembers),
}));



export const clientsRelations = relations(clients, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [clients.organizationId],
        references: [organizations.id],
    }),
    contracts: many(contracts),
    invoices: many(invoices),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
    client: one(clients, {
        fields: [contracts.clientId],
        references: [clients.id],
    }),
    organization: one(organizations, {
        fields: [contracts.organizationId],
        references: [organizations.id],
    }),
    jobs: many(jobs),
    invoices: many(invoices),
    members: many(contractMembers),
}));

export const contractMembersRelations = relations(contractMembers, ({ one }) => ({
    contract: one(contracts, {
        fields: [contractMembers.contractId],
        references: [contracts.id],
    }),
    organizationMember: one(organizationMembers, {
        fields: [contractMembers.organizationMemberId],
        references: [organizationMembers.id],
    }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
    contract: one(contracts, {
        fields: [jobs.contractId],
        references: [contracts.id],
    }),
    members: many(jobMembers),
}));

export const jobMembersRelations = relations(jobMembers, ({ one }) => ({
    job: one(jobs, {
        fields: [jobMembers.jobId],
        references: [jobs.id],
    }),
    organizationMember: one(organizationMembers, {
        fields: [jobMembers.organizationMemberId],
        references: [organizationMembers.id],
    }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [invoices.organizationId],
        references: [organizations.id]
    }),
    contract: one(contracts, {
        fields: [invoices.contractId],
        references: [contracts.id]
    }),
    job: one(jobs, {
        fields: [invoices.jobId],
        references: [jobs.id]
    }),
    client: one(clients, {
        fields: [invoices.billToClientId],
        references: [clients.id],
    }),
    invoiceEntries: many(invoiceEntries),
}));

export const invoiceEntriesRelations = relations(invoiceEntries, ({ one }) => ({
    invoice: one(invoices, {
        fields: [invoiceEntries.invoiceId],
        references: [invoices.id],
    }),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [expenses.organizationId],
        references: [organizations.id]
    }),
    contract: one(contracts, {
        fields: [expenses.contractId],
        references: [contracts.id]
    }),
    job: one(jobs, {
        fields: [expenses.jobId],
        references: [jobs.id]
    }),
    vendor: one(vendors, {
        fields: [expenses.vendorId],
        references: [vendors.id]
    }),
    expenseEntries: many(expenseEntries)
}));

export const expenseEntriesRelations = relations(expenseEntries, ({ one }) => ({
    expense: one(expenses, {
        fields: [expenseEntries.expenseId],
        references: [expenses.id]
    }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
    contract: one(contracts, { fields: [comments.contractId], references: [contracts.id] }),
    author: one(users, { fields: [comments.authorId], references: [users.id] }),
    attachments: many(attachments)
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
    comment: one(comments, {
        fields: [attachments.commentId],
        references: [comments.id],
    }),
}));
