"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
const utils_1 = require("../../utils");
const drizzle_orm_1 = require("drizzle-orm");
// Updates an organization
exports.default = async (req, res) => {
    try {
        const body = {
            ...(0, utils_1.pick)(req.body, [
                'name',
                'description',
                'email',
                'phone',
                'website',
                'logoUrl',
            ]),
            // UpdatedByUserId: req.auth.id, // Not in schema yet?
        };
        const orgId = req.params.org_id;
        if (!orgId) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization id is required'));
        }
        const [updatedOrg] = await db_1.db.update(db_1.organizations)
            .set(body)
            .where((0, drizzle_orm_1.eq)(db_1.organizations.id, orgId))
            .returning();
        if (!updatedOrg) {
            return res.status(404).json((0, response_1.createErrorResponse)('Organization not found'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(updatedOrg));
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
