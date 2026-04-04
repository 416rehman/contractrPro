import { Request, Response } from 'express'
import {
    db,
    contracts,
    invoices,
    expenses,
    payments,
    timeEntries,
    jobs,
    invoiceEntries,
    expenseEntries,
} from '../../../db'
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response'
import { ErrorCode } from '../../../utils/errorCodes'
import { eq, and, sql } from 'drizzle-orm'
import { isValidUUID } from '../../../utils/isValidUUID'

// per-contract profitability analysis
// aggregates invoices, payments, expenses, and time entries to show the full financial picture
export default async (req: Request, res: Response) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const contract = await db.query.contracts.findFirst({
            where: and(
                eq(contracts.id, contractId),
                eq(contracts.organizationId, orgId)
            ),
            with: { client: true },
        })

        if (!contract) {
            return res
                .status(404)
                .json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        // get all invoices for this contract with entries
        const contractInvoices = await db.query.invoices.findMany({
            where: and(
                eq(invoices.contractId, contractId),
                eq(invoices.organizationId, orgId)
            ),
            with: { invoiceEntries: true },
        })

        // calculate total invoiced
        let totalInvoiced = 0
        for (const inv of contractInvoices) {
            let subtotal = 0
            for (const entry of inv.invoiceEntries) {
                subtotal +=
                    (Number(entry.quantity) || 0) *
                    (Number(entry.unitCost) || 0)
            }
            const taxRate = Number(inv.taxRate) || 0
            totalInvoiced += subtotal * (1 + taxRate / 100)
        }

        // get all payments linked to this contract or its invoices
        const contractPayments = await db.query.payments.findMany({
            where: and(eq(payments.organizationId, orgId)),
        })

        // filter payments linked to this contract's invoices or directly to this contract
        const invoiceIds = new Set(contractInvoices.map((i) => i.id))
        const relevantPayments = contractPayments.filter(
            (p) =>
                p.contractId === contractId ||
                (p.invoiceId && invoiceIds.has(p.invoiceId))
        )

        const totalCollected = relevantPayments
            .filter((p) => p.type === 'deposit')
            .reduce((sum, p) => sum + Number(p.amount), 0)

        const totalWithdrawals = relevantPayments
            .filter((p) => p.type === 'withdrawal')
            .reduce((sum, p) => sum + Number(p.amount), 0)

        // get all expenses for this contract
        const contractExpenses = await db.query.expenses.findMany({
            where: and(
                eq(expenses.contractId, contractId),
                eq(expenses.organizationId, orgId)
            ),
            with: { expenseEntries: true },
        })

        let totalExpenses = 0
        for (const exp of contractExpenses) {
            if (exp.expenseEntries.length > 0) {
                let subtotal = 0
                for (const entry of exp.expenseEntries) {
                    subtotal +=
                        (Number(entry.quantity) || 0) *
                        (Number(entry.unitCost) || 0)
                }
                const taxRate = Number(exp.taxRate) || 0
                totalExpenses += subtotal * (1 + taxRate / 100)
            } else {
                totalExpenses += Number(exp.amount) || 0
            }
        }

        // get time entries for all jobs in this contract
        const contractJobs = await db.query.jobs.findMany({
            where: and(
                eq(jobs.contractId, contractId),
                eq(jobs.organizationId, orgId)
            ),
        })

        const jobIds = contractJobs.map((j) => j.id)
        let totalHours = 0
        let laborCost = 0

        if (jobIds.length > 0) {
            const entries = await db.query.timeEntries.findMany({
                where: eq(timeEntries.organizationId, orgId),
                with: { organizationMember: true },
            })

            const relevantEntries = entries.filter((e) =>
                jobIds.includes(e.jobId)
            )
            for (const entry of relevantEntries) {
                const hours = Number(entry.hours) || 0
                totalHours += hours
                const hourlyRate =
                    Number(entry.organizationMember?.hourlyRate) || 0
                laborCost += hours * hourlyRate
            }
        }

        const totalCosts = totalExpenses + laborCost
        const netProfit = totalInvoiced - totalCosts
        const margin = totalInvoiced > 0 ? (netProfit / totalInvoiced) * 100 : 0
        const outstanding = totalInvoiced - totalCollected

        return res.status(200).json(
            createSuccessResponse({
                contract: {
                    id: contract.id,
                    name: contract.name,
                    status: contract.status,
                    client: contract.client,
                },
                revenue: {
                    totalInvoiced: Math.round(totalInvoiced * 100) / 100,
                    totalCollected: Math.round(totalCollected * 100) / 100,
                    outstanding: Math.round(outstanding * 100) / 100,
                    invoiceCount: contractInvoices.length,
                },
                costs: {
                    totalExpenses: Math.round(totalExpenses * 100) / 100,
                    laborCost: Math.round(laborCost * 100) / 100,
                    totalCosts: Math.round(totalCosts * 100) / 100,
                    expenseCount: contractExpenses.length,
                    totalHours: Math.round(totalHours * 100) / 100,
                },
                profitability: {
                    netProfit: Math.round(netProfit * 100) / 100,
                    margin: Math.round(margin * 100) / 100,
                    profitable: netProfit > 0,
                },
            })
        )
    } catch (e: any) {
        return res
            .status(500)
            .json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}
