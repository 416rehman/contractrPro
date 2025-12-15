"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const index_1 = require("../../../utils/index");
const drizzle_orm_1 = require("drizzle-orm");
// create invoice
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid organization_id'));
        }
        const entriesData = req.body?.InvoiceEntries?.map((entry) => (0, index_1.pick)(entry, ['description', 'quantity', 'unitCost', 'name'])) || [];
        if (entriesData.length === 0) {
            return res.status(400).json((0, response_1.createErrorResponse)('InvoiceEntries is required. Provide at least one entry.'));
        }
        const body = {
            ...(0, index_1.pick)(req.body, [
                'invoiceNumber',
                'issueDate',
                'dueDate',
                'poNumber',
                'note',
                'taxRate',
                // 'BillToClientId', // CamelCase in schema?
            ]),
            billToClientId: req.body.BillToClientId,
            contractId: req.body.ContractId,
            jobId: req.body.JobId,
            organizationId: orgId,
            updatedByUserId: req.auth.id,
        };
        // Clean undefined params
        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);
        await db_1.db.transaction(async (tx) => {
            // Verify contract if provided
            if (body.contractId) {
                const contract = await tx.query.contracts.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, body.contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId))
                });
                if (!contract)
                    throw new Error('Contract not found');
            }
            // Verify job if provided
            if (body.jobId) {
                const job = await tx.query.jobs.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.id, body.jobId), (0, drizzle_orm_1.eq)(db_1.jobs.organizationId, orgId))
                });
                if (!job)
                    throw new Error('Job not found');
            }
            const [invoice] = await tx.insert(db_1.invoices).values(body).returning();
            if (!invoice)
                throw new Error('Failed to create invoice');
            // Create entries
            const entriesWithId = entriesData.map((entry) => ({
                ...entry,
                invoiceId: invoice.id,
                updatedByUserId: req.auth.id
            }));
            await tx.insert(db_1.invoiceEntries).values(entriesWithId);
            // Legacy returned invoice WITH entries in `InvoiceEntries`?
            // Legacy: `include: req.body.InvoiceEntries && [InvoiceEntry]` => yes.
            // I'll reconstruct it.
            const response = {
                ...invoice,
                invoiceEntries: entriesWithId // or fetch from DB?
            };
            return res.status(201).json((0, response_1.createSuccessResponse)(response));
        });
    }
    catch (e) {
        return res.status(400).json((0, response_1.createErrorResponse)('Error creating invoice', e));
    }
};
