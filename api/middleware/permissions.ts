import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../utils/response';
import { ErrorCode } from '../utils/errorCodes';
import { UserFlags } from '../db/flags';
import { OrgMemberStatus, OrgRole } from '../db/enums';
import { isFlagSet } from '../utils/flags';
import { db, organizationMembers } from '../db';
import { eq, and } from 'drizzle-orm';

// --- Identity Verifications ---

export const requiresVerifiedEmail = (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth;
    if (!auth) {
        return res.status(401).json(createErrorResponse(ErrorCode.AUTH_UNAUTHORIZED));
    }

    if (!isFlagSet(auth.flags || 0, UserFlags.VERIFIED_EMAIL)) {
        return res.status(403).json(createErrorResponse(ErrorCode.AUTH_UNAUTHORIZED, "Email verification required"));
    }
    next();
};

export const requiresVerifiedPhone = (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth;
    if (!auth) {
        return res.status(401).json(createErrorResponse(ErrorCode.AUTH_UNAUTHORIZED));
    }
    if (!isFlagSet(auth.flags || 0, UserFlags.VERIFIED_PHONE)) {
        return res.status(403).json(createErrorResponse(ErrorCode.AUTH_UNAUTHORIZED, "Phone verification required"));
    }
    next();
};

// --- Organization Permissions ---

import { getRolePermissions } from '../utils/permissions';
import { OrgPermissions } from '../db/flags';

/**
 * Middleware to authorize organization access.
 * Checks if user is an active member of the org depending on required permissions.
 */
export const authorizeOrg = (requiredPermission?: bigint) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auth = (req as any).auth;
            if (!auth) {
                return res.status(401).json(createErrorResponse(ErrorCode.AUTH_UNAUTHORIZED));
            }

            const orgId = req.params.orgId || req.params.org_id;
            if (!orgId) {
                return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED));
            }

            const memberships = auth.organizationMemberships || [];
            const membership = memberships.find((m: any) =>
                m.organizationId === orgId && m.status === OrgMemberStatus.Active
            );

            if (!membership) {
                return res.status(403).json(createErrorResponse(ErrorCode.ORG_NOT_FOUND, "Not a member of this organization"));
            }

            if (requiredPermission) {
                const memberPermissions = getRolePermissions(membership.role);

                // Check for Administrator or specific permission
                const hasAdmin = (memberPermissions & OrgPermissions.ADMINISTRATOR) === OrgPermissions.ADMINISTRATOR;
                const hasPermission = (memberPermissions & requiredPermission) === requiredPermission;

                if (!hasAdmin && !hasPermission) {
                    return res.status(403).json(createErrorResponse(ErrorCode.AUTH_UNAUTHORIZED, "Insufficient permissions"));
                }
            }

            (req as any).orgMember = membership;
            next();
        } catch (error) {
            return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error));
        }
    }
};
