"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
const utils_1 = require("../../utils");
const drizzle_orm_1 = require("drizzle-orm");
// Joins an organization by invite
exports.default = async (req, res) => {
    try {
        const inviteID = req.params.invite_id;
        if (!inviteID || !(0, utils_1.isValidInviteCode)(inviteID)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invite ID required'));
        }
        const invite = await db_1.db.query.invites.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.invites.id, inviteID)
        });
        if (!invite) {
            return res.status(404).json((0, response_1.createErrorResponse)('Invite not found'));
        }
        const organization = await db_1.db.query.organizations.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.organizations.id, invite.organizationId)
        });
        if (!organization) {
            return res.status(404).json((0, response_1.createErrorResponse)('Organization not found'));
        }
        await db_1.db.transaction(async (tx) => {
            if (invite.uses >= invite.maxUses) {
                return res.status(400).json((0, response_1.createErrorResponse)('Invite has been used too many times'));
            }
            if (invite.forOrganizationMemberId) {
                // if the invite is for a specific member, make sure that member still exists
                const member = await tx.query.organizationMembers.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.id, invite.forOrganizationMemberId), (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, invite.organizationId))
                });
                if (!member) {
                    return res.status(404).json((0, response_1.createErrorResponse)('The member this invite is for no longer exists'));
                }
                if (member.userId) {
                    return res.status(400).json((0, response_1.createErrorResponse)('The member this invite is for has already joined'));
                }
                await tx.update(db_1.organizationMembers)
                    .set({ userId: req.auth.id })
                    .where((0, drizzle_orm_1.eq)(db_1.organizationMembers.id, member.id));
            }
            else {
                // if the invite is not for a specific member, create a new member
                await tx.insert(db_1.organizationMembers).values({
                    name: req.auth.username,
                    organizationId: invite.organizationId,
                    userId: req.auth.id,
                    updatedByUserId: req.auth.id,
                });
            }
            // update the invite uses
            await tx.update(db_1.invites)
                .set({ uses: invite.uses + 1 })
                .where((0, drizzle_orm_1.eq)(db_1.invites.id, invite.id));
            return res.status(200).json((0, response_1.createSuccessResponse)(organization));
        });
    }
    catch (err) {
        return res.status(500).json((0, response_1.createErrorResponse)('Error joining organization', err));
    }
};
