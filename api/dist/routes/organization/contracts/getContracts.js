"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const response_1 = require("../../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
// Gets the organization's contracts
exports.default = async (req, res) => {
    try {
        const expand = req.query.expand;
        const orgID = req.params.org_id;
        if (!orgID || !(0, isValidUUID_1.isValidUUID)(orgID)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID required'));
        }
        const queryOptions = {
            where: (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgID)
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
            };
        }
        const organizationContracts = await db_1.db.query.contracts.findMany(queryOptions);
        // Transformation to match legacy shape if expanded
        if (expand && organizationContracts) {
            organizationContracts.forEach((contract) => {
                if (contract.jobs) {
                    contract.jobs.forEach((job) => {
                        if (job.jobMembers) {
                            job.assignedTo = job.jobMembers.map((jm) => jm.organizationMemberId);
                            // legacy code deleted `OrganizationMembers` (which was `JobMembers` in include?).
                            // I will delete `jobMembers` from object to be clean
                            delete job.jobMembers;
                        }
                    });
                }
            });
        }
        return res
            .status(200)
            .json((0, response_1.createSuccessResponse)(organizationContracts));
    }
    catch (error) {
        res.status(500).json((0, response_1.createErrorResponse)('', error));
    }
};
