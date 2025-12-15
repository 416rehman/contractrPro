"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// get all org expenses
exports.default = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const { contract_id, job_id, vendor_id } = req.query;
        const orgId = req.params.org_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid organization_id'));
        if (contract_id && !(0, isValidUUID_1.isValidUUID)(contract_id))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid contract_id'));
        if (job_id && !(0, isValidUUID_1.isValidUUID)(job_id))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid job_id'));
        if (vendor_id && !(0, isValidUUID_1.isValidUUID)(vendor_id))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid vendor_id'));
        const queryOptions = {
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.expenses.organizationId, orgId), contract_id ? (0, drizzle_orm_1.eq)(db_1.expenses.contractId, contract_id) : undefined, job_id ? (0, drizzle_orm_1.eq)(db_1.expenses.jobId, job_id) : undefined, vendor_id ? (0, drizzle_orm_1.eq)(db_1.expenses.vendorId, vendor_id) : undefined),
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        };
        if (req.query.expand) {
            queryOptions.with = {
                expenseEntries: true
            };
        }
        const results = await db_1.db.query.expenses.findMany(queryOptions);
        return res.status(200).json((0, response_1.createSuccessResponse)(results));
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
