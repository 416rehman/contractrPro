"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../../db");
const response_1 = require("../../../../../utils/response");
const isValidUUID_1 = require("../../../../../utils/isValidUUID");
const utils_1 = require("../../../../../utils");
const drizzle_orm_1 = require("drizzle-orm");
// Post jobMember
exports.default = async (req, res) => {
    try {
        const jobId = req.params.job_id;
        const contractId = req.params.contract_id;
        const orgId = req.params.org_id;
        const memberId = req.body.OrganizationMemberId;
        if (!jobId || !(0, isValidUUID_1.isValidUUID)(jobId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid job id.'));
        }
        if (!contractId || !(0, isValidUUID_1.isValidUUID)(contractId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Invalid contract id.'));
        }
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        }
        if (!memberId || !(0, isValidUUID_1.isValidUUID)(memberId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Invalid orgMember id.'));
        }
        const body = {
            ...(0, utils_1.pick)(req.body, ['permissionOverwrites']),
            updatedByUserId: req.auth.id,
        };
        const [orgMember] = await db_1.db.select().from(db_1.organizationMembers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.id, memberId), (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, orgId)));
        if (!orgMember) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Failed to find orgMember.'));
        }
        // Verify job exists and belongs to contract/org
        const job = await db_1.db.query.jobs.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.id, jobId), (0, drizzle_orm_1.eq)(db_1.jobs.contractId, contractId), (0, drizzle_orm_1.eq)(db_1.jobs.organizationId, orgId))
        });
        if (!job) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Failed to find job.'));
        }
        // Check/Insert jobMember
        // Legacy used `addOrganizationMember` which likely upserts or ignores if exists?
        // Legacy comment: "Check if the orgMember is already a member of the job"
        // Then `addOrganizationMember`.
        // I will use upsert or just insert (if duplicate, constraints might fail or ignore).
        // Since schema likely has unique constraint on jobId+orgMemberId?
        // I'll check schema later but standard is composite PK or unique.
        // I'll try insert. If it fails, maybe check existence first?
        // Or simple insert.
        // Check existence first to prevent error
        const existing = await db_1.db.query.jobMembers.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobMembers.jobId, jobId), (0, drizzle_orm_1.eq)(db_1.jobMembers.organizationMemberId, memberId))
        });
        if (existing) {
            // Update if exists? Legacy passed `through: body`. 
            // `permissionOverwrites` might need updating.
            await db_1.db.update(db_1.jobMembers)
                .set(body)
                .where((0, drizzle_orm_1.eq)(db_1.jobMembers.id, existing.id));
            return res.status(200).json((0, response_1.createSuccessResponse)(existing));
        }
        const [newMembership] = await db_1.db.insert(db_1.jobMembers).values({
            jobId: jobId,
            organizationMemberId: memberId,
            ...body
        }).returning();
        return res.status(200).json((0, response_1.createSuccessResponse)(newMembership));
    }
    catch (err) {
        return res.status(500).json((0, response_1.createErrorResponse)('', err));
    }
};
