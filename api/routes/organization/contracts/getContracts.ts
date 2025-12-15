import { db, contracts } from '../../../db';
import { isValidUUID } from '../../../utils/isValidUUID';

import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { eq } from 'drizzle-orm';

// Gets the organization's contracts
export default async (req, res) => {
    try {
        const expand = req.query.expand
        const orgID = req.params.org_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        const queryOptions: any = {
            where: eq(contracts.organizationId, orgID)
        };

        if (expand) {
            queryOptions.with = {
                jobs: {
                    with: {
                        jobMembers: true
                        // Legacy code mapped `JobMembers` to `assignedTo` array of IDs.
                        // I will need to process the result after fetching if I want to match that shape exactly.
                    }
                }
            }
        }

        const organizationContracts = await db.query.contracts.findMany(queryOptions);

        // Transformation to match legacy shape if expanded
        if (expand && organizationContracts) {
            organizationContracts.forEach((contract: any) => {
                if (contract.jobs) {
                    contract.jobs.forEach((job: any) => {
                        if (job.jobMembers) {
                            job.assignedTo = job.jobMembers.map((jm: any) => jm.organizationMemberId);
                            // legacy code deleted `OrganizationMembers` (which was `JobMembers` in include?).
                            // I will delete `jobMembers` from object to be clean
                            delete job.jobMembers;
                        }
                    })
                }
            })
        }

        return res
            .status(200)
            .json(createSuccessResponse(organizationContracts))
    } catch (error) {
        res.status(500).json(createErrorResponse('', error))
    }
}
