"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const utils_1 = require("../../../utils");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Creates an organization's contract
exports.default = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const clientId = req.body.ClientId;
        if (!orgID || !(0, isValidUUID_1.isValidUUID)(orgID)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Valid Organization ID required'));
        }
        if (!clientId || !(0, isValidUUID_1.isValidUUID)(clientId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Valid Client ID required'));
        }
        const result = await db_1.db.transaction(async (tx) => {
            const org = await tx.query.organizations.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.organizations.id, orgID)
            });
            if (!org) {
                throw new Error('Organization not found');
            }
            const contractBody = {
                ...(0, utils_1.pick)(req.body, [
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
            };
            const [newContract] = await tx.insert(db_1.contracts).values(contractBody).returning();
            let createdJobs = [];
            if (req.body?.Jobs?.length) {
                const jobsData = req.body.Jobs.map((job) => ({
                    ...(0, utils_1.pick)(job, [
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
                    createdJobs = await tx.insert(db_1.jobs).values(jobsData).returning();
                    // Handle logic for assignments (Job Members)
                    // Legacy code loop:
                    for (let i = 0; i < req.body.Jobs.length; i++) {
                        const jobInput = req.body.Jobs[i];
                        const createdJob = createdJobs[i]; // Assumption: order preserved in bulk insert. Usually true for Postgres RETURNING.
                        const memberIds = jobInput.assignedTo;
                        if (memberIds && memberIds.length > 0) {
                            const membersData = memberIds.map((memberId) => ({
                                jobId: createdJob.id,
                                organizationMemberId: memberId
                            }));
                            await tx.insert(db_1.jobMembers).values(membersData);
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
        return res.status(201).json((0, response_1.createSuccessResponse)(result));
    }
    catch (err) {
        // Legacy error handling was a bit mix of throw and statusCode.
        const msg = err.message || '';
        const status = msg === 'Organization not found' || msg.includes('required') ? 400 : 500;
        return res.status(status).json((0, response_1.createErrorResponse)('', err));
    }
};
