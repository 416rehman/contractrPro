"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Deletes an organization's vendor by ID
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const vendorId = req.params.vendor_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID is required'));
        }
        if (!vendorId || !(0, isValidUUID_1.isValidUUID)(vendorId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Vendor ID is required'));
        }
        const deletedRows = await db_1.db.delete(db_1.vendors)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.vendors.id, vendorId), (0, drizzle_orm_1.eq)(db_1.vendors.organizationId, orgId)))
            .returning();
        if (!deletedRows.length) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Vendor not found'));
        }
        res.status(200).json((0, response_1.createSuccessResponse)(deletedRows.length));
    }
    catch (error) {
        res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
