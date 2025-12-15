"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Get an organization's vendor by ID
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
        const vendor = await db_1.db.query.vendors.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.vendors.organizationId, orgId), (0, drizzle_orm_1.eq)(db_1.vendors.id, vendorId))
        });
        if (!vendor) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Vendor not found'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(vendor));
    }
    catch (error) {
        res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
