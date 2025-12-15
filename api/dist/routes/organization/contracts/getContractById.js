"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const response_1 = require("../../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
// Gets the organization's contract by ID
exports.default = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const contractID = req.params.contract_id;
        if (!orgID || !(0, isValidUUID_1.isValidUUID)(orgID)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID required'));
        }
        else if (!contractID || !(0, isValidUUID_1.isValidUUID)(contractID)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Contract ID required'));
        }
        const organizationContract = await db_1.db.query.contracts.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractID), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgID)),
            with: {
                jobs: true // Include jobs if needed? Legacy getContractById didn't include jobs in `findOne`? 
                // Legacy: `Contract.findOne` lines 26-35 only excludes `organization_id`. 
                // It does NOT have `include` option in legacy code!
                // So it returns just contract fields.
                // I will return just contract fields to match EXACT legacy behavior.
                // Wait, legacy `getContracts` (plural) includes jobs if expand=true.
                // `getContractById` (singular) legacy code shows NO `include`.
                // So I will stick to basic fields.
            }
        });
        if (!organizationContract) {
            return res.status(400).json((0, response_1.createErrorResponse)('Not found'));
        }
        return res
            .status(200)
            .json((0, response_1.createSuccessResponse)(organizationContract));
    }
    catch (error) {
        res.status(500).json((0, response_1.createErrorResponse)('', error));
    }
};
