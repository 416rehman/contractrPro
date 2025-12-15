"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../../db");
const response_1 = require("../../../../../utils/response");
const isValidUUID_1 = require("../../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Get jobMember
exports.default = async (req, res) => {
    try {
        const jobId = req.params.job_id;
        const contractId = req.params.contract_id;
        const orgId = req.params.org_id;
        const orgMemberId = req.params.member_id;
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
        if (!orgMemberId || !(0, isValidUUID_1.isValidUUID)(orgMemberId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Invalid jobMember id.'));
        }
        // Find jobMember for the job
        // Legacy: Returns `OrganizationMember` with nested `Job` info.
        // Meaning it returns the OrganizationMember profile IF they are in the job.
        // Drizzle: Query organizationMembers where id = orgMemberId AND exists relationship.
        const member = await db_1.db.query.organizationMembers.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.id, orgMemberId), (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, orgId)),
            with: {
                jobMembers: {
                    where: (0, drizzle_orm_1.eq)(db_1.jobMembers.jobId, jobId),
                    with: {
                        job: {
                        // verify contractId? 
                        // The `where` on jobMembers connects to job. 
                        // I can't easily filter `job.contractId` inside the `with` unless I use extra logic.
                        // But I can trust that if they asked for `jobId`, we check if `jobId` belongs to `contractId` separately or assume validity if DB is consistent.
                        // Legacy: `include Job where id=jobId, ContractId=contractId`.
                        // So it enforces job validity.
                        }
                    }
                }
            }
        });
        // Manual validation of job context:
        // Check if `member.jobMembers` has any entry that links to local jobId (which is filtered in `with`).
        // But need to ensure that `job` actually belongs to `contractId`.
        // The above query fetches `jobMembers` for `jobId`.
        // I should also verify `jobId` belongs to `contractId` and `orgId`.
        // I'll do a quick separate check or assume if record exists it's valid?
        // Safer to check.
        const jobValid = await db_1.db.query.jobs.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.id, jobId), (0, drizzle_orm_1.eq)(db_1.jobs.contractId, contractId), (0, drizzle_orm_1.eq)(db_1.jobs.organizationId, orgId))
        });
        if (!jobValid) {
            // Legacy returned "JobMember not found" if ANY part required failed (inner join).
            // Basically 404.
            return res.status(404).json((0, response_1.createErrorResponse)('JobMember not found (Job context invalid).'));
        }
        if (!member || !member.jobMembers || member.jobMembers.length === 0) {
            return res
                .status(404)
                .json((0, response_1.createErrorResponse)('JobMember not found.'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(member));
    }
    catch (err) {
        return res.status(500).json((0, response_1.createErrorResponse)('', err));
    }
};
