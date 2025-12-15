"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const utils_1 = require("../../../../utils");
const drizzle_orm_1 = require("drizzle-orm");
// Create Contract Member
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const contractId = req.params.contract_id;
        const memberId = req.body.OrganizationMemberId;
        if (!(0, isValidUUID_1.isValidUUID)(contractId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Invalid contract_id'));
        }
        if (!(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org_id'));
        }
        const body = {
            ...(0, utils_1.pick)(req.body, ['permissions']),
        };
        const [orgMember] = await db_1.db.select().from(db_1.organizationMembers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.id, memberId), (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, orgId)));
        if (!orgMember) {
            return res
                .status(404)
                .json((0, response_1.createErrorResponse)('Organization member not found'));
        }
        const [contract] = await db_1.db.select().from(db_1.contracts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId) // Ensure org ownership
        ));
        if (!contract) {
            return res
                .status(404)
                .json((0, response_1.createErrorResponse)('Contract not found'));
        }
        // Upsert or Insert check
        const existing = await db_1.db.query.contractMembers.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contractMembers.contractId, contractId), (0, drizzle_orm_1.eq)(db_1.contractMembers.organizationMemberId, memberId))
        });
        if (existing) {
            await db_1.db.update(db_1.contractMembers)
                .set(body)
                .where((0, drizzle_orm_1.eq)(db_1.contractMembers.id, existing.id));
            return res.status(200).json((0, response_1.createSuccessResponse)(existing));
        }
        const [result] = await db_1.db.insert(db_1.contractMembers).values({
            contractId: contractId,
            organizationMemberId: memberId,
            ...body
        }).returning();
        return res.status(200).json((0, response_1.createSuccessResponse)(result));
    }
    catch (err) {
        return res.status(500).json((0, response_1.createErrorResponse)('', err));
    }
};
