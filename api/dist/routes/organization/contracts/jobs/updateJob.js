"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const utils_1 = require("../../../../utils");
const drizzle_orm_1 = require("drizzle-orm");
// Put job
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
        const body = {
            ...(0, utils_1.pick)(req.body, [
                'identifier',
                'name',
                'description',
                'status',
            ]),
            contractId: contractID, // Ensure it stays in this contract?
            organizationId: orgID,
            updatedByUserId: req.auth.id,
        };
        const [updatedJob] = await db_1.db.update(db_1.jobs)
            .set(body)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.id, jobId), (0, drizzle_orm_1.eq)(db_1.jobs.contractId, contractID), (0, drizzle_orm_1.eq)(db_1.jobs.organizationId, orgID)))
            .returning();
        if (!updatedJob) {
            return res.status(400).json((0, response_1.createErrorResponse)('Job not found or access denied'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(updatedJob));
    }
    catch (error) {
        res.status(500).json((0, response_1.createErrorResponse)('Failed to update job.', error));
    }
};
