"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const utils_1 = require("../../../../utils");
const drizzle_orm_1 = require("drizzle-orm");
// Update Contract Member
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const contractId = req.params.contract_id;
        const memberId = req.params.member_id;
        if (!(0, isValidUUID_1.isValidUUID)(contractId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid contract_id'));
        if (!(0, isValidUUID_1.isValidUUID)(orgId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid org_id'));
        if (!(0, isValidUUID_1.isValidUUID)(memberId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid member_id'));
        const body = {
            ...(0, utils_1.pick)(req.body, ['permissionOverwrites']),
            updatedByUserId: req.auth.id,
        };
        // Validate entities
        const orgMember = await db_1.db.query.organizationMembers.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.id, memberId), (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, orgId))
        });
        if (!orgMember)
            return res.status(404).json((0, response_1.createErrorResponse)('Organization member not found'));
        const contract = await db_1.db.query.contracts.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId))
        });
        if (!contract)
            return res.status(404).json((0, response_1.createErrorResponse)('Contract not found'));
        // Update
        const cm = await db_1.db.query.contractMembers.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contractMembers.contractId, contractId), (0, drizzle_orm_1.eq)(db_1.contractMembers.organizationMemberId, memberId))
        });
        if (!cm)
            return res.status(404).json((0, response_1.createErrorResponse)('Contract member not found'));
        await db_1.db.update(db_1.contractMembers)
            .set(body)
            .where((0, drizzle_orm_1.eq)(db_1.contractMembers.id, cm.id));
        return res.status(200).json((0, response_1.createSuccessResponse)('Contract member updated'));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json((0, response_1.createErrorResponse)('Server error'));
    }
};
