import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { pick } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';
import { db, contracts, jobs, jobMembers } from '../../../db';
import { eq, and, notInArray } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID is required'))
        }

        const body = {
            ...pick(req.body, [
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
        }

        // Remove undefined keys
        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

        const result = await db.transaction(async (tx) => {
            const [updatedContract] = await tx.update(contracts)
                .set(body)
                .where(and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId)))
                .returning();

            if (!updatedContract) {
                throw new Error('Contract not found')
            }

            let updatedJobsList: any[] = [];

            if (req.body.Jobs && Array.isArray(req.body.Jobs)) {
                // Determine IDs to keep
                const jobIdsToKeep: string[] = [];

                updatedJobsList = await Promise.all(req.body.Jobs.map(async (job: any) => {
                    const jobData = {
                        ...pick(job, [
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
                    if (job.id && isValidUUID(job.id)) {
                        // Update existing
                        const [upd] = await tx.update(jobs)
                            .set(jobData)
                            .where(and(eq(jobs.id, job.id), eq(jobs.contractId, contractId)))
                            .returning();
                        savedJob = upd;
                    } else {
                        // Create new
                        const [ins] = await tx.insert(jobs)
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
                            await tx.delete(jobMembers).where(eq(jobMembers.jobId, savedJob.id));

                            if (memberIds.length > 0) {
                                const membersData = memberIds.map((mId: string) => ({
                                    jobId: savedJob.id,
                                    organizationMemberId: mId
                                }));
                                await tx.insert(jobMembers).values(membersData);
                            }

                            (savedJob as any).assignedTo = memberIds;
                        }
                    }
                    return savedJob;
                }));

                // Delete jobs not in the list
                if (jobIdsToKeep.length > 0) {
                    await tx.delete(jobs)
                        .where(and(
                            eq(jobs.contractId, contractId),
                            notInArray(jobs.id, jobIdsToKeep)
                        ));
                } else {
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
                (updatedContract as any).Jobs = updatedJobsList;
            }

            return updatedContract;
        });

        return res.status(200).json(createSuccessResponse(result))
    } catch (err: any) {
        const msg = err.message || '';
        const status = msg === 'Contract not found' ? 400 : 500;
        return res.status(status).json(createErrorResponse('', err))
    }
}
