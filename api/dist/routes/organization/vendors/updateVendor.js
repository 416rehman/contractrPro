"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const utils_1 = require("../../../utils");
const db_1 = require("../../../db");
const drizzle_orm_1 = require("drizzle-orm");
// Updates an organization's vendor by ID
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
        const body = {
            ...(0, utils_1.pick)(req.body, [
                'name',
                'phone',
                'email',
                'website',
                'description',
            ]),
            updatedByUserId: req.auth.id,
        };
        const [updatedVendor] = await db_1.db.update(db_1.vendors)
            .set(body)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.vendors.id, vendorId), (0, drizzle_orm_1.eq)(db_1.vendors.organizationId, orgId)))
            .returning();
        if (!updatedVendor) {
            throw new Error('Vendor not found');
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(updatedVendor));
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
