"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentsRelations = exports.commentsRelations = exports.expenseEntriesRelations = exports.expensesRelations = exports.invoiceEntriesRelations = exports.invoicesRelations = exports.jobMembersRelations = exports.jobsRelations = exports.contractMembersRelations = exports.contractsRelations = exports.clientsRelations = exports.organizationMembersRelations = exports.organizationsRelations = exports.tokensRelations = exports.usersRelations = exports.invites = exports.addresses = exports.attachments = exports.comments = exports.expenseEntries = exports.contractMembers = exports.expenses = exports.invoiceEntries = exports.invoices = exports.jobMembers = exports.jobs = exports.contracts = exports.vendors = exports.clients = exports.organizationMembers = exports.organizations = exports.tokens = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// --- Users & Auth ---
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    username: (0, pg_core_1.text)('username').notNull().unique(),
    phone: (0, pg_core_1.text)('phone').unique(),
    email: (0, pg_core_1.text)('email').unique(),
    password: (0, pg_core_1.text)('password').notNull(),
    refreshToken: (0, pg_core_1.text)('refresh_token'),
    avatarUrl: (0, pg_core_1.text)('avatar_url'),
    phoneCountry: (0, pg_core_1.text)('phone_country'),
    phoneNumber: (0, pg_core_1.text)('phone_number'),
    flags: (0, pg_core_1.integer)('flags').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.tokens = (0, pg_core_1.pgTable)('tokens', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    type: (0, pg_core_1.text)('type').notNull(),
    value: (0, pg_core_1.text)('value').notNull(),
    flags: (0, pg_core_1.integer)('flags').default(0),
    meta: (0, pg_core_1.jsonb)('meta'),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// --- Organizations ---
exports.organizations = (0, pg_core_1.pgTable)('organizations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    taxId: (0, pg_core_1.text)('tax_id'),
    timezone: (0, pg_core_1.text)('timezone').default('UTC'),
    currency: (0, pg_core_1.text)('currency').default('USD'),
    logo: (0, pg_core_1.text)('logo'),
    ownerId: (0, pg_core_1.uuid)('owner_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.organizationMembers = (0, pg_core_1.pgTable)('organization_members', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    role: (0, pg_core_1.text)('role').notNull().default('member'),
    status: (0, pg_core_1.text)('status').notNull().default('active'),
    name: (0, pg_core_1.text)('name'),
    email: (0, pg_core_1.text)('email'),
    phone: (0, pg_core_1.text)('phone'),
    website: (0, pg_core_1.text)('website'),
    description: (0, pg_core_1.text)('description'),
    permissions: (0, pg_core_1.jsonb)('permissions'),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id, { onDelete: 'cascade' }).notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: (0, pg_core_1.uuid)('updated_by_user_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    flags: (0, pg_core_1.integer)('flags').default(0),
});
// --- CRM ---
exports.clients = (0, pg_core_1.pgTable)('clients', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    phone: (0, pg_core_1.text)('phone'),
    email: (0, pg_core_1.text)('email'),
    website: (0, pg_core_1.text)('website'),
    description: (0, pg_core_1.text)('description'),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: (0, pg_core_1.uuid)('updated_by_user_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.vendors = (0, pg_core_1.pgTable)('vendors', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    phone: (0, pg_core_1.text)('phone'),
    email: (0, pg_core_1.text)('email'),
    website: (0, pg_core_1.text)('website'),
    description: (0, pg_core_1.text)('description'),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: (0, pg_core_1.uuid)('updated_by_user_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// --- Projects ---
exports.contracts = (0, pg_core_1.pgTable)('contracts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, pg_core_1.text)('status').default('draft'),
    startDate: (0, pg_core_1.timestamp)('start_date'),
    dueDate: (0, pg_core_1.timestamp)('due_date'),
    completionDate: (0, pg_core_1.timestamp)('completion_date'),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: (0, pg_core_1.uuid)('updated_by_user_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.jobs = (0, pg_core_1.pgTable)('jobs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    reference: (0, pg_core_1.text)('reference'),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, pg_core_1.text)('status').default('pending'),
    startDate: (0, pg_core_1.timestamp)('start_date'),
    dueDate: (0, pg_core_1.timestamp)('due_date'),
    payout: (0, pg_core_1.numeric)('payout'),
    contractId: (0, pg_core_1.uuid)('contract_id').references(() => exports.contracts.id, { onDelete: 'cascade' }),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id, { onDelete: 'cascade' }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.jobMembers = (0, pg_core_1.pgTable)('job_members', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobs.id, { onDelete: 'cascade' }).notNull(),
    organizationMemberId: (0, pg_core_1.uuid)('organization_member_id').references(() => exports.organizationMembers.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// --- Finances ---
exports.invoices = (0, pg_core_1.pgTable)('invoices', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    invoiceNumber: (0, pg_core_1.text)('invoice_number'),
    issueDate: (0, pg_core_1.timestamp)('issue_date'),
    dueDate: (0, pg_core_1.timestamp)('due_date'),
    poNumber: (0, pg_core_1.text)('po_number'),
    note: (0, pg_core_1.text)('note'),
    taxRate: (0, pg_core_1.numeric)('tax_rate'),
    status: (0, pg_core_1.text)('status').default('draft'),
    amount: (0, pg_core_1.numeric)('amount').default('0'),
    balance: (0, pg_core_1.numeric)('balance').default('0'),
    billToClientId: (0, pg_core_1.uuid)('bill_to_client_id').references(() => exports.clients.id),
    contractId: (0, pg_core_1.uuid)('contract_id').references(() => exports.contracts.id),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobs.id),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: (0, pg_core_1.uuid)('updated_by_user_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.invoiceEntries = (0, pg_core_1.pgTable)('invoice_entries', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    description: (0, pg_core_1.text)('description'),
    quantity: (0, pg_core_1.numeric)('quantity'),
    unitCost: (0, pg_core_1.numeric)('unit_cost'),
    invoiceId: (0, pg_core_1.uuid)('invoice_id').references(() => exports.invoices.id, { onDelete: 'cascade' }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.expenses = (0, pg_core_1.pgTable)('expenses', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    reference: (0, pg_core_1.text)('reference'),
    amount: (0, pg_core_1.numeric)('amount').notNull(),
    date: (0, pg_core_1.timestamp)('date'),
    description: (0, pg_core_1.text)('description'),
    category: (0, pg_core_1.text)('category'),
    status: (0, pg_core_1.text)('status').default('pending'),
    taxRate: (0, pg_core_1.numeric)('tax_rate'),
    vendorId: (0, pg_core_1.uuid)('vendor_id').references(() => exports.vendors.id),
    contractId: (0, pg_core_1.uuid)('contract_id').references(() => exports.contracts.id),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobs.id),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id, { onDelete: 'cascade' }).notNull(),
    updatedByUserId: (0, pg_core_1.uuid)('updated_by_user_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.contractMembers = (0, pg_core_1.pgTable)('contract_members', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    contractId: (0, pg_core_1.uuid)('contract_id').references(() => exports.contracts.id, { onDelete: 'cascade' }).notNull(),
    organizationMemberId: (0, pg_core_1.uuid)('organization_member_id').references(() => exports.organizationMembers.id, { onDelete: 'cascade' }).notNull(),
    permissions: (0, pg_core_1.jsonb)('permissions'),
    updatedByUserId: (0, pg_core_1.uuid)('updated_by_user_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.expenseEntries = (0, pg_core_1.pgTable)('expense_entries', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name'),
    description: (0, pg_core_1.text)('description'),
    quantity: (0, pg_core_1.numeric)('quantity'),
    unitCost: (0, pg_core_1.numeric)('unit_cost'),
    amount: (0, pg_core_1.numeric)('amount'),
    expenseId: (0, pg_core_1.uuid)('expense_id').references(() => exports.expenses.id, { onDelete: 'cascade' }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// --- Misc ---
exports.comments = (0, pg_core_1.pgTable)('comments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    content: (0, pg_core_1.text)('content').notNull(),
    authorId: (0, pg_core_1.uuid)('author_id').references(() => exports.users.id),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id, { onDelete: 'cascade' }).notNull(),
    // Polymorphic associations are tricky in strict SQL, easiest to have nullable FKs or separate tables.
    // Assuming simple nullable FKs for now based on typical modernization patterns while keeping one table.
    contractId: (0, pg_core_1.uuid)('contract_id').references(() => exports.contracts.id, { onDelete: 'cascade' }),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobs.id, { onDelete: 'cascade' }),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id, { onDelete: 'cascade' }),
    vendorId: (0, pg_core_1.uuid)('vendor_id').references(() => exports.vendors.id, { onDelete: 'cascade' }),
    invoiceId: (0, pg_core_1.uuid)('invoice_id').references(() => exports.invoices.id, { onDelete: 'cascade' }),
    expenseId: (0, pg_core_1.uuid)('expense_id').references(() => exports.expenses.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.attachments = (0, pg_core_1.pgTable)('attachments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    size: (0, pg_core_1.bigint)('size', { mode: 'number' }).notNull(),
    accessUrl: (0, pg_core_1.text)('access_url').notNull(),
    commentId: (0, pg_core_1.uuid)('comment_id').references(() => exports.comments.id, { onDelete: 'cascade' }),
    // Similarly, attachments likely link to comments or directly to entities.
    // Based on previous code (createComment), attachments were linked to comments.
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.addresses = (0, pg_core_1.pgTable)('addresses', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    street: (0, pg_core_1.text)('street'),
    city: (0, pg_core_1.text)('city'),
    state: (0, pg_core_1.text)('state'),
    zip: (0, pg_core_1.text)('zip'),
    country: (0, pg_core_1.text)('country'),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id, { onDelete: 'cascade' }),
    vendorId: (0, pg_core_1.uuid)('vendor_id').references(() => exports.vendors.id, { onDelete: 'cascade' }),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.invites = (0, pg_core_1.pgTable)('invites', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    email: (0, pg_core_1.text)('email').notNull(),
    token: (0, pg_core_1.text)('token').notNull(),
    role: (0, pg_core_1.text)('role').default('member'),
    maxUses: (0, pg_core_1.integer)('max_uses').default(1),
    uses: (0, pg_core_1.integer)('uses').default(0).notNull(),
    forOrganizationMemberId: (0, pg_core_1.uuid)('for_organization_member_id').references(() => exports.organizationMembers.id),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id, { onDelete: 'cascade' }).notNull(),
    inviterId: (0, pg_core_1.uuid)('inviter_id').references(() => exports.users.id),
    accepted: (0, pg_core_1.boolean)('accepted').default(false),
    updatedByUserId: (0, pg_core_1.uuid)('updated_by_user_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// --- Relations Definitions ---
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    tokens: many(exports.tokens),
    organizationMemberships: many(exports.organizationMembers),
    ownedOrganizations: many(exports.organizations),
}));
exports.tokensRelations = (0, drizzle_orm_1.relations)(exports.tokens, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.tokens.userId],
        references: [exports.users.id],
    }),
}));
exports.organizationsRelations = (0, drizzle_orm_1.relations)(exports.organizations, ({ one, many }) => ({
    owner: one(exports.users, {
        fields: [exports.organizations.ownerId],
        references: [exports.users.id],
    }),
    members: many(exports.organizationMembers),
    contracts: many(exports.contracts),
    invoices: many(exports.invoices),
    clients: many(exports.clients),
}));
exports.organizationMembersRelations = (0, drizzle_orm_1.relations)(exports.organizationMembers, ({ one, many }) => ({
    organization: one(exports.organizations, {
        fields: [exports.organizationMembers.organizationId],
        references: [exports.organizations.id],
    }),
    user: one(exports.users, {
        fields: [exports.organizationMembers.userId],
        references: [exports.users.id],
    }),
    jobMembers: many(exports.jobMembers),
    contractMembers: many(exports.contractMembers),
}));
exports.clientsRelations = (0, drizzle_orm_1.relations)(exports.clients, ({ one, many }) => ({
    organization: one(exports.organizations, {
        fields: [exports.clients.organizationId],
        references: [exports.organizations.id],
    }),
    contracts: many(exports.contracts),
    invoices: many(exports.invoices),
}));
exports.contractsRelations = (0, drizzle_orm_1.relations)(exports.contracts, ({ one, many }) => ({
    client: one(exports.clients, {
        fields: [exports.contracts.clientId],
        references: [exports.clients.id],
    }),
    organization: one(exports.organizations, {
        fields: [exports.contracts.organizationId],
        references: [exports.organizations.id],
    }),
    jobs: many(exports.jobs),
    invoices: many(exports.invoices),
    members: many(exports.contractMembers),
}));
exports.contractMembersRelations = (0, drizzle_orm_1.relations)(exports.contractMembers, ({ one }) => ({
    contract: one(exports.contracts, {
        fields: [exports.contractMembers.contractId],
        references: [exports.contracts.id],
    }),
    organizationMember: one(exports.organizationMembers, {
        fields: [exports.contractMembers.organizationMemberId],
        references: [exports.organizationMembers.id],
    }),
}));
exports.jobsRelations = (0, drizzle_orm_1.relations)(exports.jobs, ({ one, many }) => ({
    contract: one(exports.contracts, {
        fields: [exports.jobs.contractId],
        references: [exports.contracts.id],
    }),
    members: many(exports.jobMembers),
}));
exports.jobMembersRelations = (0, drizzle_orm_1.relations)(exports.jobMembers, ({ one }) => ({
    job: one(exports.jobs, {
        fields: [exports.jobMembers.jobId],
        references: [exports.jobs.id],
    }),
    organizationMember: one(exports.organizationMembers, {
        fields: [exports.jobMembers.organizationMemberId],
        references: [exports.organizationMembers.id],
    }),
}));
exports.invoicesRelations = (0, drizzle_orm_1.relations)(exports.invoices, ({ one, many }) => ({
    organization: one(exports.organizations, {
        fields: [exports.invoices.organizationId],
        references: [exports.organizations.id]
    }),
    contract: one(exports.contracts, {
        fields: [exports.invoices.contractId],
        references: [exports.contracts.id]
    }),
    job: one(exports.jobs, {
        fields: [exports.invoices.jobId],
        references: [exports.jobs.id]
    }),
    client: one(exports.clients, {
        fields: [exports.invoices.billToClientId],
        references: [exports.clients.id],
    }),
    invoiceEntries: many(exports.invoiceEntries),
}));
exports.invoiceEntriesRelations = (0, drizzle_orm_1.relations)(exports.invoiceEntries, ({ one }) => ({
    invoice: one(exports.invoices, {
        fields: [exports.invoiceEntries.invoiceId],
        references: [exports.invoices.id],
    }),
}));
exports.expensesRelations = (0, drizzle_orm_1.relations)(exports.expenses, ({ one, many }) => ({
    organization: one(exports.organizations, {
        fields: [exports.expenses.organizationId],
        references: [exports.organizations.id]
    }),
    contract: one(exports.contracts, {
        fields: [exports.expenses.contractId],
        references: [exports.contracts.id]
    }),
    job: one(exports.jobs, {
        fields: [exports.expenses.jobId],
        references: [exports.jobs.id]
    }),
    vendor: one(exports.vendors, {
        fields: [exports.expenses.vendorId],
        references: [exports.vendors.id]
    }),
    expenseEntries: many(exports.expenseEntries)
}));
exports.expenseEntriesRelations = (0, drizzle_orm_1.relations)(exports.expenseEntries, ({ one }) => ({
    expense: one(exports.expenses, {
        fields: [exports.expenseEntries.expenseId],
        references: [exports.expenses.id]
    }),
}));
exports.commentsRelations = (0, drizzle_orm_1.relations)(exports.comments, ({ one, many }) => ({
    contract: one(exports.contracts, { fields: [exports.comments.contractId], references: [exports.contracts.id] }),
    author: one(exports.users, { fields: [exports.comments.authorId], references: [exports.users.id] }),
    attachments: many(exports.attachments)
}));
exports.attachmentsRelations = (0, drizzle_orm_1.relations)(exports.attachments, ({ one }) => ({
    comment: one(exports.comments, {
        fields: [exports.attachments.commentId],
        references: [exports.comments.id],
    }),
}));
