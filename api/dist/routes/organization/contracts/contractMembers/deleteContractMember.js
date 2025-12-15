"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Delete Contract Member
exports.default = async (req, res) => {
    const orgId = req.params.org_id;
    const contractId = req.params.contract_id;
    const memberId = req.params.member_id;
    if (!(0, isValidUUID_1.isValidUUID)(contractId))
        return res.status(400).json((0, response_1.createErrorResponse)('Invalid contract_id'));
    if (!(0, isValidUUID_1.isValidUUID)(memberId))
        return res.status(400).json((0, response_1.createErrorResponse)('Invalid member_id'));
    if (!(0, isValidUUID_1.isValidUUID)(orgId))
        return res.status(400).json((0, response_1.createErrorResponse)('Invalid org_id'));
    try {
        const orgMember = await db_1.db.query.organizationMembers.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.id, memberId), (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, orgId))
        });
        if (!orgMember) {
            return res.status(404).json((0, response_1.createErrorResponse)('Contract member not found'));
        }
        const contract = await db_1.db.query.contracts.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId))
        });
        if (!contract) {
            return res.status(404).json((0, response_1.createErrorResponse)('Contract not found'));
        }
        // Delete from junction
        await db_1.db.delete(db_1.contractMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contractMembers.contractId, contractId), (0, drizzle_orm_1.eq)(db_1.contractMembers.organizationMemberId, memberId)));
        return res
            .status(200)
            .json((0, response_1.createSuccessResponse)('Contract member deleted'));
    }
    catch (err) {
        return res
            .status(500)
            .json((0, response_1.createErrorResponse)('Failed to delete contract member'));
    }
};
