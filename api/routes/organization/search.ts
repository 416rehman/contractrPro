import {
    db, organizationMembers, invoices, jobs, expenses, clients, contracts, attachments, comments, vendors,
} from '../../db';
import { createErrorResponse, createSuccessResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { ilike, or, eq, and } from 'drizzle-orm';

const queryTypes = {
    organizationMember: (searchQuery: string, orgId: string) =>
        db.query.organizationMembers.findMany({
            where: and(
                eq(organizationMembers.organizationId, orgId),
                or(ilike(organizationMembers.name, `%${searchQuery}%`), ilike(organizationMembers.email, `%${searchQuery}%`), ilike(organizationMembers.phone, `%${searchQuery}%`))
            )
        }),
    invoice: (searchQuery: string, orgId: string) =>
        db.query.invoices.findMany({
            where: and(
                eq(invoices.organizationId, orgId),
                or(ilike(invoices.invoiceNumber, `%${searchQuery}%`), ilike(invoices.poNumber, `%${searchQuery}%`), ilike(invoices.note, `%${searchQuery}%`))
            )
        }),
    job: (searchQuery: string, orgId: string) =>
        db.query.jobs.findMany({
            where: and(
                eq(jobs.organizationId, orgId),
                or(ilike(jobs.reference, `%${searchQuery}%`), ilike(jobs.name, `%${searchQuery}%`), ilike(jobs.description, `%${searchQuery}%`))
            )
        }),
    expense: (searchQuery: string, orgId: string) =>
        db.query.expenses.findMany({
            where: and(eq(expenses.organizationId, orgId), or(ilike(expenses.reference, `%${searchQuery}%`), ilike(expenses.description, `%${searchQuery}%`)))
        }),
    client: (searchQuery: string, orgId: string) =>
        db.query.clients.findMany({
            where: and(
                eq(clients.organizationId, orgId),
                or(ilike(clients.name, `%${searchQuery}%`), ilike(clients.email, `%${searchQuery}%`), ilike(clients.phone, `%${searchQuery}%`), ilike(clients.website, `%${searchQuery}%`), ilike(clients.description, `%${searchQuery}%`))
            )
        }),
    contract: (searchQuery: string, orgId: string) =>
        db.query.contracts.findMany({
            where: and(eq(contracts.organizationId, orgId), or(ilike(contracts.name, `%${searchQuery}%`), ilike(contracts.description, `%${searchQuery}%`)))
        }),
    attachment: async (searchQuery: string, orgId: string) => {
        const results = await db.select({
            id: attachments.id, name: attachments.name, type: attachments.type, size: attachments.size,
            accessUrl: attachments.accessUrl, commentId: attachments.commentId, createdAt: attachments.createdAt, updatedAt: attachments.updatedAt,
        }).from(attachments).innerJoin(comments, eq(attachments.commentId, comments.id))
            .where(and(eq(comments.organizationId, orgId), ilike(attachments.name, `%${searchQuery}%`)));
        return results;
    },
    vendor: (searchQuery: string, orgId: string) =>
        db.query.vendors.findMany({
            where: and(
                eq(vendors.organizationId, orgId),
                or(ilike(vendors.name, `%${searchQuery}%`), ilike(vendors.email, `%${searchQuery}%`), ilike(vendors.phone, `%${searchQuery}%`), ilike(vendors.website, `%${searchQuery}%`), ilike(vendors.description, `%${searchQuery}%`))
            )
        }),
}

/**
 * @openapi
 * /organizations/{org_id}/search:
 *   get:
 *     summary: Search across organization entities
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: Search results
 */
export default async (req, res) => {
    const organizationId = req.params.org_id
    const searchQuery = req.query.q as string
    const searchType = req.query.type as string

    if (!searchQuery) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))

    const searchFunction = queryTypes[searchType]
    try {
        if (searchFunction) {
            const results = await searchFunction(searchQuery, organizationId)
            return res.status(200).json(createSuccessResponse({ [searchType]: results }))
        } else {
            const results: any = {}
            for (const type in queryTypes) {
                results[type] = await queryTypes[type](searchQuery, organizationId)
            }
            return res.status(200).json(createSuccessResponse(results))
        }
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err));
    }
}
