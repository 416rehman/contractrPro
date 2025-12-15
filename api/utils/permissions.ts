import { OrgRole } from '../db/enums';
import { OrgPermissions } from '../db/flags';

export const canAssignRole = (assignerRole: OrgRole, targetRole: OrgRole): boolean => {
    if (assignerRole === OrgRole.Owner) return true;
    if (assignerRole === OrgRole.Manager) {
        // Manager can assign anything except Owner
        return targetRole !== OrgRole.Owner;
    }
    // Others cannot assign roles (handled by MANAGE_MEMBERS permission check usually, but safely return false here)
    return false;
};

export const getRolePermissions = (role: OrgRole): bigint => {
    switch (role) {
        case OrgRole.Owner:
            return OrgPermissions.ADMINISTRATOR;
        case OrgRole.Manager:
            return OrgPermissions.VIEW_ORG | OrgPermissions.EDIT_ORG | OrgPermissions.MANAGE_MEMBERS | OrgPermissions.MANAGE_CLIENTS | OrgPermissions.MANAGE_VENDORS | OrgPermissions.MANAGE_CONTRACTS | OrgPermissions.MANAGE_JOBS | OrgPermissions.MANAGE_FINANCES | OrgPermissions.VIEW_FINANCES;
        case OrgRole.Supervisor:
            return OrgPermissions.VIEW_ORG | OrgPermissions.MANAGE_JOBS | OrgPermissions.MANAGE_CLIENTS | OrgPermissions.MANAGE_VENDORS;
        case OrgRole.Worker:
            return OrgPermissions.VIEW_ORG;
        case OrgRole.Subcontractor:
            return OrgPermissions.VIEW_ORG;
        default:
            return 0n;
    }
};
