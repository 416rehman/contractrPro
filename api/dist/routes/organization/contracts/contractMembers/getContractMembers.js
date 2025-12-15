"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Get Contract Members
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const contractId = req.params.contract_id;
        if (!(0, isValidUUID_1.isValidUUID)(contractId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Invalid contract_id'));
        }
        if (!(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org_id'));
        }
        // Verify contract context?
        // Legacy: OrganizationMember.findAll include Contract(where id, required).
        const members = await db_1.db.query.organizationMembers.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, orgId),
            with: {
                contractMembers: {
                    where: (0, drizzle_orm_1.eq)(db_1.contractMembers.contractId, contractId)
                }
            }
        });
        // Filter those who have the contract member entry
        const filtered = members.filter(m => m.contractMembers && m.contractMembers.length > 0);
        // Legacy returns 404 if "members not found" (which technically acts as empty array check).
        if (!filtered || filtered.length === 0) {
            return res
                .status(404)
                .json((0, response_1.createErrorResponse)('Contract members not found'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(filtered));
    }
    catch (err) {
        console.error(err);
        return res
            .status(500)
            .json((0, response_1.createErrorResponse)('Failed to get contract members'));
    }
};
