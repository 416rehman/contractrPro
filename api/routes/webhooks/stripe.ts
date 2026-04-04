import { Request, Response, Router } from 'express'
import { db, invoices, payments, organizations } from '../../db'
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response'
import { ErrorCode } from '../../utils/errorCodes'
import { getStripe, isStripeConfigured } from '../../utils/stripe'
import { InvoiceStatus, PaymentType, PaymentMethod } from '../../db/enums'
import { eq } from 'drizzle-orm'
import { webhookLimiter } from '../../middleware/rateLimit'

const routes = Router()

// stripe sends raw body for signature verification, so we need to handle it before json parsing
routes.post('/stripe', webhookLimiter, async (req: Request, res: Response) => {
    try {
        if (!isStripeConfigured()) {
            return res
                .status(503)
                .json(createErrorResponse(ErrorCode.STRIPE_NOT_CONFIGURED))
        }

        const stripe = getStripe()
        const signingSecret = process.env.STRIPE_WEBHOOK_SECRET

        if (!signingSecret) {
            return res
                .status(503)
                .json(createErrorResponse(ErrorCode.STRIPE_NOT_CONFIGURED))
        }

        const sig = req.headers['stripe-signature'] as string
        let event

        try {
            // req.body should be raw buffer for signature verification
            // this requires express.raw() middleware on this route
            event = stripe.webhooks.constructEvent(req.body, sig, signingSecret)
        } catch (err: any) {
            return res
                .status(400)
                .json(createErrorResponse(ErrorCode.STRIPE_WEBHOOK_INVALID))
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const invoiceId = session.metadata?.invoiceId
                const orgId = session.metadata?.orgId

                if (!invoiceId || !orgId) break

                const invoice = await db.query.invoices.findFirst({
                    where: eq(invoices.id, invoiceId),
                    with: { invoiceEntries: true },
                })

                if (!invoice) break

                // calculate total
                let invoiceTotal = 0
                for (const entry of invoice.invoiceEntries) {
                    invoiceTotal +=
                        (Number(entry.quantity) || 0) *
                        (Number(entry.unitCost) || 0)
                }
                const taxRate = Number(invoice.taxRate) || 0
                invoiceTotal = invoiceTotal * (1 + taxRate / 100)

                const amountPaid = (session.amount_total || 0) / 100

                // record the payment
                await db.insert(payments).values({
                    type: PaymentType.Deposit,
                    amount: String(amountPaid),
                    method: PaymentMethod.Stripe,
                    reference: session.payment_intent as string,
                    description: `Stripe payment for invoice ${invoice.invoiceNumber || invoice.id}`,
                    stripePaymentIntentId: session.payment_intent as string,
                    invoiceId: invoice.id,
                    organizationId: orgId,
                    date: new Date(),
                })

                // update invoice status
                const newBalance = invoiceTotal - amountPaid
                const newStatus =
                    newBalance <= 0 ? InvoiceStatus.Paid : InvoiceStatus.Partial

                await db
                    .update(invoices)
                    .set({
                        status: newStatus,
                        balance: String(newBalance),
                        amount: String(invoiceTotal),
                        stripePaymentIntentId: session.payment_intent as string,
                        updatedAt: new Date(),
                    })
                    .where(eq(invoices.id, invoiceId))

                break
            }

            case 'payment_intent.payment_failed': {
                const intent = event.data.object
                const invoiceId = intent.metadata?.invoiceId

                if (invoiceId) {
                    // keep invoice in sent status, the client can retry
                    await db
                        .update(invoices)
                        .set({ updatedAt: new Date() })
                        .where(eq(invoices.id, invoiceId))
                }
                break
            }
        }

        return res.status(200).json({ received: true })
    } catch (e: any) {
        return res
            .status(500)
            .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
})

export default routes
