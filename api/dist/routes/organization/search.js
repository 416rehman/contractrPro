"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
const queryTypes = {
    organizationMember: (searchQuery, orgId) => db_1.db.query.organizationMembers.findMany({
        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, orgId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(db_1.organizationMembers.name, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.organizationMembers.email, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.organizationMembers.phone, `%${searchQuery}%`)))
    }),
    invoice: (searchQuery, orgId) => db_1.db.query.invoices.findMany({
        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.invoices.organizationId, orgId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(db_1.invoices.invoiceNumber, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.invoices.poNumber, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.invoices.note, `%${searchQuery}%`)))
    }),
    job: (searchQuery, orgId) => db_1.db.query.jobs.findMany({
        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.organizationId, orgId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(db_1.jobs.reference, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.jobs.name, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.jobs.description, `%${searchQuery}%`)))
    }),
    expense: (searchQuery, orgId) => db_1.db.query.expenses.findMany({
        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.expenses.organizationId, orgId), (0, drizzle_orm_1.or)(
        // Legacy: expenseNumber. Drizzle schema assumes 'reference'?
        // I used 'reference' in createExpense.
        (0, drizzle_orm_1.ilike)(db_1.expenses.reference, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.expenses.description, `%${searchQuery}%`)))
    }),
    client: (searchQuery, orgId) => db_1.db.query.clients.findMany({
        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.clients.organizationId, orgId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(db_1.clients.name, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.clients.email, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.clients.phone, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.clients.website, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.clients.description, `%${searchQuery}%`)))
    }),
    contract: (searchQuery, orgId) => db_1.db.query.contracts.findMany({
        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(db_1.contracts.name, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.contracts.description, `%${searchQuery}%`)))
    }),
    attachment: async (searchQuery, orgId) => {
        // Attachments don't have organizationId directly?
        // Schema line 215: attachments { id, name, ... commentId ... } (no orgId)
        // Legacy used include Comment where OrganizationId.
        // I need join.
        // db.select().from(attachments).innerJoin(comments, eq(attachments.commentId, comments.id)).where(...)
        const results = await db_1.db.select({
            id: db_1.attachments.id,
            name: db_1.attachments.name,
            type: db_1.attachments.type,
            size: db_1.attachments.size,
            accessUrl: db_1.attachments.accessUrl,
            commentId: db_1.attachments.commentId,
            createdAt: db_1.attachments.createdAt,
            updatedAt: db_1.attachments.updatedAt,
        })
            .from(db_1.attachments)
            .innerJoin(db_1.comments, (0, drizzle_orm_1.eq)(db_1.attachments.commentId, db_1.comments.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.comments.organizationId, orgId), (0, drizzle_orm_1.ilike)(db_1.attachments.name, `%${searchQuery}%`)));
        return results;
    },
    vendor: (searchQuery, orgId) => db_1.db.query.vendors.findMany({
        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.vendors.organizationId, orgId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(db_1.vendors.name, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.vendors.email, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.vendors.phone, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.vendors.website, `%${searchQuery}%`), (0, drizzle_orm_1.ilike)(db_1.vendors.description, `%${searchQuery}%`)))
    }),
};
exports.default = async (req, res) => {
    const organizationId = req.params.org_id;
    //Search route
    const searchQuery = req.query.q;
    const searchType = req.query.type;
    if (!searchQuery) {
        return res
            .status(400)
            .json((0, response_1.createErrorResponse)('Missing search query parameter (q)'));
    }
    const searchFunction = queryTypes[searchType];
    try {
        if (searchFunction) {
            // If the search type is specified, search only that type, returns an object with key of the type and value of the results
            const results = await searchFunction(searchQuery, organizationId);
            return res.status(200).json((0, response_1.createSuccessResponse)({ [searchType]: results }));
        }
        else {
            // If the search type is not specified, search all types, returns an object with keys of the types and values of the results
            const results = {};
            for (const type in queryTypes) {
                results[type] = await queryTypes[type](searchQuery, organizationId);
            }
            return res.status(200).json((0, response_1.createSuccessResponse)(results));
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json((0, response_1.createErrorResponse)('Search failed', err));
    }
};
