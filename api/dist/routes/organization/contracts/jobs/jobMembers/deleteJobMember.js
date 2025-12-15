"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../../db");
const response_1 = require("../../../../../utils/response");
const isValidUUID_1 = require("../../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Delete jobMember
exports.default = async (req, res) => {
    try {
        const jobId = req.params.job_id;
        const contractId = req.params.contract_id;
        const orgId = req.params.org_id;
        const orgMemberId = req.params.member_id;
        if (!jobId || !(0, isValidUUID_1.isValidUUID)(jobId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid job id.'));
        if (!contractId || !(0, isValidUUID_1.isValidUUID)(contractId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid contract id.'));
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        if (!orgMemberId || !(0, isValidUUID_1.isValidUUID)(orgMemberId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid orgMember id.'));
        // Reuse validation logic from update/create?
        // Check job context
        const job = await db_1.db.query.jobs.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.id, jobId), (0, drizzle_orm_1.eq)(db_1.jobs.contractId, contractId), (0, drizzle_orm_1.eq)(db_1.jobs.organizationId, orgId))
        });
        if (!job)
            return res.status(400).json((0, response_1.createErrorResponse)('Failed to find job.')); // Legacy said 400
        // Check org member (not strictly needed for delete if unique constraint but good validation)
        const orgMember = await db_1.db.query.organizationMembers.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.id, orgMemberId), (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, orgId))
        });
        if (!orgMember)
            return res.status(400).json((0, response_1.createErrorResponse)('Failed to find orgMember.'));
        // Delete
        const deleted = await db_1.db.delete(db_1.jobMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobMembers.jobId, jobId), (0, drizzle_orm_1.eq)(db_1.jobMembers.organizationMemberId, orgMemberId)))
            .returning();
        // Legacy: returned `result` of removeOrganizationMember. 
        // This usually returns count or similar.
        // I'll return count.
        return res.status(200).json((0, response_1.createSuccessResponse)(deleted.length));
    }
    catch (err) {
        return res.status(500).json((0, response_1.createErrorResponse)('', err));
    }
};
