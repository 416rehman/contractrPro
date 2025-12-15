"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// get all org invoices
exports.default = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const { contract_id, job_id, client_id } = req.query;
        const orgId = req.params.org_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid organization_id'));
        if (contract_id && !(0, isValidUUID_1.isValidUUID)(contract_id))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid contract_id'));
        if (job_id && !(0, isValidUUID_1.isValidUUID)(job_id))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid job_id'));
        if (client_id && !(0, isValidUUID_1.isValidUUID)(client_id))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid client_id'));
        const queryOptions = {
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.invoices.organizationId, orgId), contract_id ? (0, drizzle_orm_1.eq)(db_1.invoices.contractId, contract_id) : undefined, job_id ? (0, drizzle_orm_1.eq)(db_1.invoices.jobId, job_id) : undefined, client_id ? (0, drizzle_orm_1.eq)(db_1.invoices.billToClientId, client_id) : undefined),
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        };
        if (req.query.expand) {
            queryOptions.with = {
                invoiceEntries: true
            };
        }
        const results = await db_1.db.query.invoices.findMany(queryOptions);
        return res.status(200).json((0, response_1.createSuccessResponse)(results));
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
