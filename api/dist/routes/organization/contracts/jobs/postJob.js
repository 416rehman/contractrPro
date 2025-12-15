"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const utils_1 = require("../../../../utils");
const drizzle_orm_1 = require("drizzle-orm");
// Post job
exports.default = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const contractID = req.params.contract_id;
        if (!orgID || !(0, isValidUUID_1.isValidUUID)(orgID)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Organization ID required'));
        }
        if (!contractID || !(0, isValidUUID_1.isValidUUID)(contractID)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Contract ID required'));
        }
        // Check if contract exists and belongs to organization
        const contract = await db_1.db.query.contracts.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractID), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgID))
        });
        if (!contract) {
            return res.status(400).json((0, response_1.createErrorResponse)('Contract not found'));
        }
        const body = {
            ...(0, utils_1.pick)(req.body, [
                'identifier',
                'name',
                'description',
                'status',
            ]),
            contractId: contractID,
            organizationId: orgID,
            updatedByUserId: req.auth.id,
        };
        const [createJob] = await db_1.db.insert(db_1.jobs).values(body).returning();
        return res.status(200).json((0, response_1.createSuccessResponse)(createJob));
    }
    catch (error) {
        res.status(500).json((0, response_1.createErrorResponse)('Failed to create job.', error));
    }
};
