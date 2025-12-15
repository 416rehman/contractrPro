"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        if (!req.params.org_id || !(0, isValidUUID_1.isValidUUID)(req.params.org_id)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID is required'));
        }
        if (!req.params.member_id || !(0, isValidUUID_1.isValidUUID)(req.params.member_id)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Member ID is required'));
        }
        const deletedRows = await db_1.db.delete(db_1.organizationMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.id, req.params.member_id), (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, req.params.org_id)))
            .returning();
        if (!deletedRows.length) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Member not found'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(deletedRows.length));
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
