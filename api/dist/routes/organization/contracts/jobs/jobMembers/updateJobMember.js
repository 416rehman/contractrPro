"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../../db");
const response_1 = require("../../../../../utils/response");
const isValidUUID_1 = require("../../../../../utils/isValidUUID");
const utils_1 = require("../../../../../utils");
const drizzle_orm_1 = require("drizzle-orm");
// Update Job Member
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const contractId = req.params.contract_id;
        const jobId = req.params.job_id;
        const memberId = req.params.member_id;
        if (!(0, isValidUUID_1.isValidUUID)(contractId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid contract_id'));
        if (!(0, isValidUUID_1.isValidUUID)(orgId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid org_id'));
        if (!(0, isValidUUID_1.isValidUUID)(jobId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid job_id'));
        if (!(0, isValidUUID_1.isValidUUID)(memberId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid member_id'));
        const body = {
            ...(0, utils_1.pick)(req.body, ['permissionOverwrites']),
            updatedByUserId: req.auth.id,
        };
        // Validate context
        const orgMember = await db_1.db.query.organizationMembers.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.id, memberId), (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, orgId))
        });
        if (!orgMember)
            return res.status(404).json((0, response_1.createErrorResponse)('Organization member not found'));
        const job = await db_1.db.query.jobs.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.id, jobId), (0, drizzle_orm_1.eq)(db_1.jobs.contractId, contractId), (0, drizzle_orm_1.eq)(db_1.jobs.organizationId, orgId))
        });
        if (!job)
            return res.status(404).json((0, response_1.createErrorResponse)('Job not found'));
        // Update Job Member
        const result = await db_1.db.update(db_1.jobMembers)
            .set(body)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobMembers.jobId, jobId), (0, drizzle_orm_1.eq)(db_1.jobMembers.organizationMemberId, memberId)))
            .returning();
        if (!result.length) {
            return res.status(404).json((0, response_1.createErrorResponse)('Job member not found'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)('Job member updated successfully'));
    }
    catch (err) {
        return res
            .status(500)
            .json((0, response_1.createErrorResponse)('Internal server error', err));
    }
};
