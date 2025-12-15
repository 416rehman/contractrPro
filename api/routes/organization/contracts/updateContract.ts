import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { pick } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';
import { db, contracts, jobs, jobMembers } from '../../../db';
import { eq, and, notInArray } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}:
 *   patch:
 *     summary: Update a contract
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: contract_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract updated
 *       400:
 *         description: Invalid ID or not found
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const body = {
            ...pick(req.body, ['name', 'description', 'startDate', 'dueDate', 'completionDate', 'status']),
            clientId: req.body.ClientId,
            updatedByUserId: req.auth.id,
            organizationId: orgId,
        }

        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

        const result = await db.transaction(async (tx) => {
            const [updatedContract] = await tx.update(contracts)
                .set(body)
                .where(and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId)))
                .returning();

            if (!updatedContract) {
                throw new Error('CONTRACT_NOT_FOUND')
            }

            let updatedJobsList: any[] = [];

            if (req.body.Jobs && Array.isArray(req.body.Jobs)) {
                const jobIdsToKeep: string[] = [];

                updatedJobsList = await Promise.all(req.body.Jobs.map(async (job: any) => {
                    const jobData = {
                        ...pick(job, ['reference', 'name', 'description', 'status', 'startDate', 'dueDate', 'payout']),
                        contractId: contractId,
                        organizationId: orgId,
                        updatedByUserId: req.auth.id
                    };

                    let savedJob;
                    if (job.id && isValidUUID(job.id)) {
                        const [upd] = await tx.update(jobs)
                            .set(jobData)
                            .where(and(eq(jobs.id, job.id), eq(jobs.contractId, contractId)))
                            .returning();
                        savedJob = upd;
                    } else {
                        const [ins] = await tx.insert(jobs).values(jobData).returning();
                        savedJob = ins;
                    }

                    if (savedJob) {
                        jobIdsToKeep.push(savedJob.id);

                        const memberIds = job.assignedTo;
                        if (memberIds) {
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

                if (jobIdsToKeep.length > 0) {
                    await tx.delete(jobs)
                        .where(and(eq(jobs.contractId, contractId), notInArray(jobs.id, jobIdsToKeep)));
                }
            }

            if (updatedJobsList.length > 0) {
                (updatedContract as any).Jobs = updatedJobsList;
            }

            return updatedContract;
        });

        return res.status(200).json(createSuccessResponse(result))
    } catch (err: any) {
        if (err.message === 'CONTRACT_NOT_FOUND') {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

