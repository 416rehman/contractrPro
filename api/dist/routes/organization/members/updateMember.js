"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const utils_1 = require("../../../utils");
const db_1 = require("../../../db");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const memberId = req.params.member_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID is required'));
        }
        if (!memberId || !(0, isValidUUID_1.isValidUUID)(memberId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Member ID is required'));
        }
        const body = {
            ...(0, utils_1.pick)(req.body, [
                'name',
                'email',
                'phone',
                'website',
                'description',
            ]),
            updatedByUserId: req.auth.id,
        };
        const [updatedMember] = await db_1.db.update(db_1.organizationMembers)
            .set(body)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.id, memberId), (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, orgId)))
            .returning();
        if (!updatedMember) {
            throw new Error('Member not found');
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(updatedMember));
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
