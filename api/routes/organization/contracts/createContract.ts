import { db, contracts, jobs, jobMembers, organizations } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { pick } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

// Creates an organization's contract
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const clientId = req.body.ClientId

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse('Valid Organization ID required'))
        }

        if (!clientId || !isValidUUID(clientId)) {
            return res.status(400).json(createErrorResponse('Valid Client ID required'))
        }

        const result = await db.transaction(async (tx) => {
            const org = await tx.query.organizations.findFirst({
                where: eq(organizations.id, orgID)
            })

            if (!org) {
                throw new Error('Organization not found')
            }

            const contractBody = {
                ...pick(req.body, [
                    'name',
                    'description',
                    'startDate',
                    'dueDate',
                    'completionDate',
                    'status',
                    // 'ClientId', // Schema uses clientId snake_case
                ]),
                clientId: clientId,
                organizationId: orgID,
                updatedByUserId: req.auth.id,
            }

            const [newContract] = await tx.insert(contracts).values(contractBody).returning();

            let createdJobs: any[] = [];

            if (req.body?.Jobs?.length) {
                const jobsData = req.body.Jobs.map((job: any) => ({
                    ...pick(job, [
                        'reference',
                        'name',
                        'description',
                        'status',
                        'startDate',
                        'dueDate',
                        'payout',
                    ]),
                    contractId: newContract.id,
                    organizationId: orgID,
                    updatedByUserId: req.auth.id,
                }));

                if (jobsData.length > 0) {
                    createdJobs = await tx.insert(jobs).values(jobsData).returning();

                    // Handle logic for assignments (Job Members)
                    // Legacy code loop:
                    for (let i = 0; i < req.body.Jobs.length; i++) {
                        const jobInput = req.body.Jobs[i];
                        const createdJob = createdJobs[i]; // Assumption: order preserved in bulk insert. Usually true for Postgres RETURNING.

                        const memberIds = jobInput.assignedTo;
                        if (memberIds && memberIds.length > 0) {
                            const membersData = memberIds.map((memberId: string) => ({
                                jobId: createdJob.id,
                                organizationMemberId: memberId
                            }));
                            await tx.insert(jobMembers).values(membersData);

                            // Attach assignedTo to the job object for response
                            createdJob.assignedTo = memberIds;
                        }
                    }
                }
            }

            // Return structure matching legacy
            const responseContract = {
                ...newContract,
                Jobs: createdJobs
            };
            return responseContract;
        });

        return res.status(201).json(createSuccessResponse(result))
    } catch (err: any) {
        // Legacy error handling was a bit mix of throw and statusCode.
        const msg = err.message || '';
        const status = msg === 'Organization not found' || msg.includes('required') ? 400 : 500;
        return res.status(status).json(createErrorResponse('', err))
    }
}
