"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// delete job
exports.default = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const contractID = req.params.contract_id;
        const jobId = req.params.job_id;
        if (!orgID || !(0, isValidUUID_1.isValidUUID)(orgID)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Organization ID required'));
        }
        if (!contractID || !(0, isValidUUID_1.isValidUUID)(contractID)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Contract ID required'));
        }
        if (!jobId || !(0, isValidUUID_1.isValidUUID)(jobId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Job ID required'));
        }
        const deletedRows = await db_1.db.delete(db_1.jobs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.id, jobId), (0, drizzle_orm_1.eq)(db_1.jobs.contractId, contractID), (0, drizzle_orm_1.eq)(db_1.jobs.organizationId, orgID)))
            .returning();
        if (!deletedRows.length) {
            return res.status(400).json((0, response_1.createErrorResponse)('Job not found'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(1));
    }
    catch (error) {
        return res.status(500).json((0, response_1.createErrorResponse)('', error));
    }
};
