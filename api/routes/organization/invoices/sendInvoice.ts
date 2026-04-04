import { Request, Response } from 'express'
import { db, invoices, organizations } from '../../../db'
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response'
import { ErrorCode } from '../../../utils/errorCodes'
import { getStripe, isStripeConfigured } from '../../../utils/stripe'
import { InvoiceStatus } from '../../../db/enums'
import { eq, and } from 'drizzle-orm'
import { isValidUUID } from '../../../utils/isValidUUID'
import jwt from 'jsonwebtoken'

// send an invoice: generates a stripe checkout session and payment url
export default async (req: Request, res: Response) => {
    try {
        const orgId = req.params.org_id
        const invoiceId = req.params.invoice_id

        if (!invoiceId || !isValidUUID(invoiceId)) {
            return res
                .status(400)
                .json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const invoice = await db.query.invoices.findFirst({
            where: and(
                eq(invoices.id, invoiceId),
                eq(invoices.organizationId, orgId)
            ),
            with: { invoiceEntries: true, client: true },
        })

        if (!invoice) {
            return res
                .status(404)
                .json(createErrorResponse(ErrorCode.INVOICE_NOT_FOUND))
        }

        // only draft or sent invoices can be (re)sent
        if (
            ![InvoiceStatus.Draft, InvoiceStatus.Sent].includes(
                invoice.status as InvoiceStatus
            )
        ) {
            return res
                .status(400)
                .json(createErrorResponse(ErrorCode.INVOICE_NOT_SENDABLE))
        }

        if (!invoice.invoiceEntries || invoice.invoiceEntries.length === 0) {
            return res
                .status(400)
                .json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        // generate a payment token for the public payment page
        const paymentToken = jwt.sign(
            { invoiceId: invoice.id, orgId },
            process.env.JWT_SECRET!,
            { expiresIn: '30d' }
        )

        const clientUrl =
            process.env.CLIENT_URL ||
            process.env.CLIENT_URL_DEV ||
            'http://localhost:3000'
        let paymentUrl = `${clientUrl}/pay/${paymentToken}`
        let stripeSessionId: string | null = null

        // if stripe is configured and the org is onboarded, create a checkout session
        if (isStripeConfigured()) {
            const org = await db.query.organizations.findFirst({
                where: eq(organizations.id, orgId),
            })

            if (org?.stripeOnboarded && org.stripeAccountId) {
                const stripe = getStripe()

                const lineItems = invoice.invoiceEntries.map((entry) => ({
                    price_data: {
                        currency: org.currency || 'usd',
                        product_data: {
                            name: entry.description || 'Service',
                        },
                        unit_amount: Math.round(
                            (Number(entry.unitCost) || 0) * 100
                        ),
                    },
                    quantity: Number(entry.quantity) || 1,
                }))

                // add tax as a separate line item if applicable
                const taxRate = Number(invoice.taxRate) || 0
                if (taxRate > 0) {
                    const subtotal = invoice.invoiceEntries.reduce(
                        (sum, entry) => {
                            return (
                                sum +
                                (Number(entry.quantity) || 0) *
                                    (Number(entry.unitCost) || 0)
                            )
                        },
                        0
                    )
                    const taxAmount = Math.round(
                        subtotal * (taxRate / 100) * 100
                    )
                    lineItems.push({
                        price_data: {
                            currency: org.currency || 'usd',
                            product_data: { name: `Tax (${taxRate}%)` },
                            unit_amount: taxAmount,
                        },
                        quantity: 1,
                    })
                }

                const session = await stripe.checkout.sessions.create(
                    {
                        payment_method_types: ['card'],
                        line_items: lineItems,
                        mode: 'payment',
                        success_url: `${clientUrl}/pay/${paymentToken}?status=success`,
                        cancel_url: `${clientUrl}/pay/${paymentToken}?status=cancelled`,
                        metadata: {
                            invoiceId: invoice.id,
                            orgId,
                        },
                        payment_intent_data: {
                            transfer_data: {
                                destination: org.stripeAccountId,
                            },
                        },
                    },
                    {
                        idempotencyKey: `invoice-${invoice.id}-send`,
                    }
                )

                stripeSessionId = session.id
                paymentUrl = session.url || paymentUrl
            }
        }

        // update invoice status and store payment info
        await db
            .update(invoices)
            .set({
                status: InvoiceStatus.Sent,
                paymentToken,
                paymentUrl,
                stripeCheckoutSessionId: stripeSessionId,
                updatedAt: new Date(),
                updatedByUserId: (req as any).auth.id,
            })
            .where(eq(invoices.id, invoiceId))

        return res.status(200).json(
            createSuccessResponse({
                status: InvoiceStatus.Sent,
                paymentUrl,
                paymentToken,
            })
        )
    } catch (e: any) {
        return res
            .status(500)
            .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}
