import { OrgRole } from '../db/enums'
import { OrgPermissions } from '../db/flags'

export const canAssignRole = (
    assignerRole: OrgRole,
    targetRole: OrgRole
): boolean => {
    if (assignerRole === OrgRole.Owner) return true
    if (assignerRole === OrgRole.Manager) {
        return targetRole !== OrgRole.Owner
    }
    return false
}

export const getRolePermissions = (role: OrgRole): bigint => {
    switch (role) {
        case OrgRole.Owner:
            return OrgPermissions.ADMINISTRATOR
        case OrgRole.Manager:
            return (
                OrgPermissions.VIEW_ORG |
                OrgPermissions.EDIT_ORG |
                OrgPermissions.MANAGE_MEMBERS |
                OrgPermissions.MANAGE_CLIENTS |
                OrgPermissions.MANAGE_VENDORS |
                OrgPermissions.MANAGE_CONTRACTS |
                OrgPermissions.MANAGE_JOBS |
                OrgPermissions.MANAGE_FINANCES |
                OrgPermissions.VIEW_FINANCES |
                OrgPermissions.MANAGE_PAYMENTS |
                OrgPermissions.MANAGE_TIME_ENTRIES
            )
        case OrgRole.Supervisor:
            return (
                OrgPermissions.VIEW_ORG |
                OrgPermissions.MANAGE_JOBS |
                OrgPermissions.MANAGE_CLIENTS |
                OrgPermissions.MANAGE_VENDORS |
                OrgPermissions.MANAGE_TIME_ENTRIES
            )
        case OrgRole.Worker:
            return OrgPermissions.VIEW_ORG | OrgPermissions.MANAGE_TIME_ENTRIES
        case OrgRole.Subcontractor:
            return OrgPermissions.VIEW_ORG | OrgPermissions.MANAGE_TIME_ENTRIES
        default:
            return 0n
    }
}
