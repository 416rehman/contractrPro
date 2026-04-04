import { Request, Response } from 'express'
import { db, organizations } from '../../../db'
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response'
import { ErrorCode } from '../../../utils/errorCodes'
import { getStripe, isStripeConfigured } from '../../../utils/stripe'
import { eq } from 'drizzle-orm'

// check stripe connect onboarding status for the organization
export default async (req: Request, res: Response) => {
    try {
        if (!isStripeConfigured()) {
            return res.status(200).json(
                createSuccessResponse({
                    configured: false,
                    onboarded: false,
                })
            )
        }

        const orgId = req.params.org_id

        const org = await db.query.organizations.findFirst({
            where: eq(organizations.id, orgId),
        })

        if (!org) {
            return res
                .status(404)
                .json(createErrorResponse(ErrorCode.ORG_NOT_FOUND))
        }

        if (!org.stripeAccountId) {
            return res.status(200).json(
                createSuccessResponse({
                    configured: true,
                    onboarded: false,
                    accountId: null,
                })
            )
        }

        const stripe = getStripe()
        const account = await stripe.accounts.retrieve(org.stripeAccountId)

        const isOnboarded = account.charges_enabled && account.details_submitted

        // persist onboarding status if it changed
        if (isOnboarded && !org.stripeOnboarded) {
            await db
                .update(organizations)
                .set({ stripeOnboarded: true, updatedAt: new Date() })
                .where(eq(organizations.id, orgId))
        }

        return res.status(200).json(
            createSuccessResponse({
                configured: true,
                onboarded: isOnboarded,
                accountId: org.stripeAccountId,
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
            })
        )
    } catch (e: any) {
        return res
            .status(500)
            .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}
