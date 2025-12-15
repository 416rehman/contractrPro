"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
const isValidUUID_1 = require("../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const org_id = req.params.org_id;
        if (!org_id || !(0, isValidUUID_1.isValidUUID)(org_id)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID is required'));
        }
        const deletedRows = await db_1.db.delete(db_1.organizations)
            .where((0, drizzle_orm_1.eq)(db_1.organizations.id, org_id))
            .returning();
        if (!deletedRows.length) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization not found'));
        }
        res.status(200).json((0, response_1.createSuccessResponse)(1)); // Return 1 to match "rowsDeleted" count behavior approximately
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
