import { db, contracts, jobs, jobMembers, organizations } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { pick } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts:
 *   post:
 *     summary: Create a new contract
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Contract created
 *       400:
 *         description: Validation error
 */
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const clientId = req.body.ClientId

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        if (!clientId || !isValidUUID(clientId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const result = await db.transaction(async (tx) => {
            const org = await tx.query.organizations.findFirst({
                where: eq(organizations.id, orgID)
            })

            if (!org) {
                throw new Error('ORG_NOT_FOUND')
            }

            const contractBody = {
                ...pick(req.body, ['name', 'description', 'startDate', 'dueDate', 'completionDate', 'status']),
                clientId: clientId,
                organizationId: orgID,
                updatedByUserId: req.auth.id,
            }

            const [newContract] = await tx.insert(contracts).values(contractBody).returning();

            let createdJobs: any[] = [];

            if (req.body?.Jobs?.length) {
                const jobsData = req.body.Jobs.map((job: any) => ({
                    ...pick(job, ['reference', 'name', 'description', 'status', 'startDate', 'dueDate', 'payout']),
                    contractId: newContract.id,
                    organizationId: orgID,
                    updatedByUserId: req.auth.id,
                }));

                if (jobsData.length > 0) {
                    createdJobs = await tx.insert(jobs).values(jobsData).returning();

                    for (let i = 0; i < req.body.Jobs.length; i++) {
                        const jobInput = req.body.Jobs[i];
                        const createdJob = createdJobs[i];

                        const memberIds = jobInput.assignedTo;
                        if (memberIds && memberIds.length > 0) {
                            const membersData = memberIds.map((memberId: string) => ({
                                jobId: createdJob.id,
                                organizationMemberId: memberId
                            }));
                            await tx.insert(jobMembers).values(membersData);
                            createdJob.assignedTo = memberIds;
                        }
                    }
                }
            }

            return { ...newContract, Jobs: createdJobs };
        });

        return res.status(201).json(createSuccessResponse(result))
    } catch (err: any) {
        if (err.message === 'ORG_NOT_FOUND') {
            return res.status(400).json(createErrorResponse(ErrorCode.ORG_NOT_FOUND))
        }
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

