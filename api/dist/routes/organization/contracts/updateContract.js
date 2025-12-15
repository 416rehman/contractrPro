"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../utils/response");
const utils_1 = require("../../../utils");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const db_1 = require("../../../db");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const contractId = req.params.contract_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID is required'));
        }
        if (!contractId || !(0, isValidUUID_1.isValidUUID)(contractId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Contract ID is required'));
        }
        const body = {
            ...(0, utils_1.pick)(req.body, [
                'name',
                'description',
                'startDate',
                'dueDate',
                'completionDate',
                'status',
                // 'ClientId',
            ]),
            clientId: req.body.ClientId, // optional update?
            updatedByUserId: req.auth.id,
            organizationId: orgId,
        };
        // Remove undefined keys
        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);
        const result = await db_1.db.transaction(async (tx) => {
            const [updatedContract] = await tx.update(db_1.contracts)
                .set(body)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId)))
                .returning();
            if (!updatedContract) {
                throw new Error('Contract not found');
            }
            let updatedJobsList = [];
            if (req.body.Jobs && Array.isArray(req.body.Jobs)) {
                // Determine IDs to keep
                const jobIdsToKeep = [];
                updatedJobsList = await Promise.all(req.body.Jobs.map(async (job) => {
                    const jobData = {
                        ...(0, utils_1.pick)(job, [
                            'reference',
                            'name',
                            'description',
                            'status',
                            'startDate',
                            'dueDate',
                            'payout',
                        ]),
                        contractId: contractId,
                        organizationId: orgId,
                        updatedByUserId: req.auth.id
                    };
                    let savedJob;
                    if (job.id && (0, isValidUUID_1.isValidUUID)(job.id)) {
                        // Update existing
                        const [upd] = await tx.update(db_1.jobs)
                            .set(jobData)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.id, job.id), (0, drizzle_orm_1.eq)(db_1.jobs.contractId, contractId)))
                            .returning();
                        savedJob = upd;
                    }
                    else {
                        // Create new
                        const [ins] = await tx.insert(db_1.jobs)
                            .values(jobData)
                            .returning();
                        savedJob = ins;
                    }
                    if (savedJob) {
                        jobIdsToKeep.push(savedJob.id);
                        // Handle assignments
                        const memberIds = job.assignedTo;
                        if (memberIds) { // If provided (empty array means unassign all)
                            // Delete all existing assignments for this job
                            await tx.delete(db_1.jobMembers).where((0, drizzle_orm_1.eq)(db_1.jobMembers.jobId, savedJob.id));
                            if (memberIds.length > 0) {
                                const membersData = memberIds.map((mId) => ({
                                    jobId: savedJob.id,
                                    organizationMemberId: mId
                                }));
                                await tx.insert(db_1.jobMembers).values(membersData);
                            }
                            savedJob.assignedTo = memberIds;
                        }
                    }
                    return savedJob;
                }));
                // Delete jobs not in the list
                if (jobIdsToKeep.length > 0) {
                    await tx.delete(db_1.jobs)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.contractId, contractId), (0, drizzle_orm_1.notInArray)(db_1.jobs.id, jobIdsToKeep)));
                }
                else {
                    // If req.body.Jobs provided but empty or logic failed? 
                    // Legacy logic: "Delete the jobs that were not updated". 
                    // If input list was empty, jobIdsToKeep is empty.
                    // But legacy `Jobs.length > 0` check wraps entire block. 
                    // So if `req.body.Jobs` is [], it skips job processing entirely?
                    // Legacy: `if (Jobs.length > 0)` line 70.
                    // Snippet line 40: `map... || []`.
                    // If `req.body.Jobs` is empty array, code skips updates.
                    // It does NOT delete all jobs.
                    // So I should adhere to that.
                }
            }
            // If jobs update happened, attach them
            // Legacy response structure included `Jobs` with assignments
            if (updatedJobsList.length > 0) {
                updatedContract.Jobs = updatedJobsList;
            }
            return updatedContract;
        });
        return res.status(200).json((0, response_1.createSuccessResponse)(result));
    }
    catch (err) {
        const msg = err.message || '';
        const status = msg === 'Contract not found' ? 400 : 500;
        return res.status(status).json((0, response_1.createErrorResponse)('', err));
    }
};
