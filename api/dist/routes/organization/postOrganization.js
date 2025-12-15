"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
const utils_1 = require("../../utils");
// Creates an organization
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
                // 'Address', // Processed separately
            ]),
            ownerId: req.auth.id,
            // UpdatedByUserId: req.auth.id, // Not in schema
        };
        console.log('Creating organization');
        await db_1.db.transaction(async (tx) => {
            // create the new organization
            const [org] = await tx.insert(db_1.organizations).values(body).returning();
            // create address if present
            if (req.body.Address) {
                await tx.insert(db_1.addresses).values({
                    ...req.body.Address,
                    organizationId: org.id
                });
                // Attach address to org object for response if needed, or fetch it back.
                // Original used "include: [Address]", which returns it.
                // We'll leave it as is or manually attach.
                org.Address = req.body.Address;
            }
            // add the owner to the organization
            await tx.insert(db_1.organizationMembers).values({
                organizationId: org.id,
                userId: req.auth.id,
                role: 'owner', // Default role for creator? Schema validation default is 'member', but logic below implies just adding them.
                // properties from original:
                // name: req.auth.name || req.auth.username || 'Member',
                // email: req.auth.email,
                // phone: req.auth.phone || null,
                // schema organizationMembers only has role, status, organizationId, userId, flags.
                // It does NOT have name, email, phone (redundant with users table).
                // So I ignore those extra props.
            });
            return res.status(201).json((0, response_1.createSuccessResponse)(org));
        });
    }
    catch (error) {
        console.log('Error: ', error);
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
