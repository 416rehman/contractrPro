import { Request, Response } from 'express'
import { db, organizations } from '../../../db'
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response'
import { ErrorCode } from '../../../utils/errorCodes'
import { getStripe, isStripeConfigured } from '../../../utils/stripe'
import { eq } from 'drizzle-orm'

// initiate stripe connect onboarding for the organization
// creates a connected account and returns the onboarding url
export default async (req: Request, res: Response) => {
    try {
        if (!isStripeConfigured()) {
            return res
                .status(503)
                .json(createErrorResponse(ErrorCode.STRIPE_NOT_CONFIGURED))
        }

        const orgId = req.params.org_id
        const stripe = getStripe()

        const org = await db.query.organizations.findFirst({
            where: eq(organizations.id, orgId),
        })

        if (!org) {
            return res
                .status(404)
                .json(createErrorResponse(ErrorCode.ORG_NOT_FOUND))
        }

        let accountId = org.stripeAccountId

        // create a new connected account if one doesnt exist
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'standard',
                metadata: { orgId },
            })
            accountId = account.id

            await db
                .update(organizations)
                .set({ stripeAccountId: accountId, updatedAt: new Date() })
                .where(eq(organizations.id, orgId))
        }

        // create an account link for onboarding
        const returnUrl = `${process.env.CLIENT_URL || process.env.CLIENT_URL_DEV}/stripe/callback?org_id=${orgId}`
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: returnUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
        })

        return res.status(200).json(
            createSuccessResponse({
                url: accountLink.url,
                accountId,
            })
        )
    } catch (e: any) {
        return res
            .status(500)
            .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}
