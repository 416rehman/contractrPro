const prisma = require('../../prisma')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../utils/response')
const { z } = require('zod')
const searchQuerySchema = z.object({
    q: z.string().min(3),
    type: z
        .enum([
            'organizationMember',
            'invoice',
            'job',
            'expense',
            'client',
            'contract',
            'attachment',
            'vendor',
        ])
        .optional(),
})

const queryTypes = {
    organizationMember: (searchQuery, orgId) =>
        prisma.organizationMember.findMany({
            where: {
                organizationId: orgId,
                OR: [
                    { name: { search: searchQuery } },
                    { email: { search: searchQuery } },
                    { phone: { search: searchQuery } },
                    { id: { search: searchQuery } },
                ],
            },
        }),
    invoice: (searchQuery, orgId) =>
        prisma.invoice.findMany({
            where: {
                organizationId: orgId,
                OR: [
                    { invoiceNumber: { search: searchQuery } },
                    { poNumber: { search: searchQuery } },
                    { note: { search: searchQuery } },
                    { id: { search: searchQuery } },
                ],
            },
        }),
    job: (searchQuery, orgId) =>
        prisma.job.findMany({
            where: {
                OR: [
                    { reference: { search: searchQuery } },
                    { name: { search: searchQuery } },
                    { description: { search: searchQuery } },
                    { id: { search: searchQuery } },
                ],
                Contract: {
                    organizationId: orgId,
                },
            },
        }),
    expense: (searchQuery, orgId) =>
        prisma.expense.findMany({
            where: {
                organizationId: orgId,
                OR: [
                    { expenseNumber: { search: searchQuery } },
                    { description: { search: searchQuery } },
                    { id: { search: searchQuery } },
                ],
            },
        }),
    client: (searchQuery, orgId) =>
        prisma.client.findMany({
            where: {
                organizationId: orgId,
                OR: [
                    { name: { search: searchQuery } },
                    { email: { search: searchQuery } },
                    { phone: { search: searchQuery } },
                    { website: { search: searchQuery } },
                    { description: { search: searchQuery } },
                    { id: { search: searchQuery } },
                ],
            },
        }),
    contract: (searchQuery, orgId) =>
        prisma.contract.findMany({
            where: {
                organizationId: orgId,
                OR: [
                    { name: { search: searchQuery } },
                    { description: { search: searchQuery } },
                    { id: { search: searchQuery } },
                ],
            },
        }),
    attachment: (searchQuery, orgId) =>
        prisma.attachment.findMany({
            where: {
                Comment: {
                    organizationId: orgId,
                },
                OR: [
                    { name: { search: searchQuery } },
                    { type: { search: searchQuery } },
                    { commentId: { search: searchQuery } },
                    { id: { search: searchQuery } },
                ],
            },
        }),
    vendor: (searchQuery, orgId) =>
        prisma.vendor.findMany({
            where: {
                organizationId: orgId,
                OR: [
                    { name: { search: searchQuery } },
                    { email: { search: searchQuery } },
                    { phone: { search: searchQuery } },
                    { website: { search: searchQuery } },
                    { description: { search: searchQuery } },
                    { id: { search: searchQuery } },
                ],
            },
        }),
}

module.exports = async (req, res) => {
    try {
        const organizationId = req.params.org_id
        const search = searchQuerySchema.parse(req.query)

        if (!search?.q) {
            return res
                .status(400)
                .json(createErrorResponse('Missing search query parameter (q)'))
        }

        const searchFunction = queryTypes[search?.type]

        if (searchFunction) {
            // If the search type is specified, search only that type, returns an object with key of the type and value of the results
            const results = await searchFunction(search.q, organizationId)
            return res
                .status(200)
                .json(createSuccessResponse({ [search.type]: results }))
        } else {
            // Using async all to run all queries in parallel
            const results = await Promise.all(
                Object.keys(queryTypes).map((type) =>
                    queryTypes[type](search.q, organizationId)
                )
            ).then((results) =>
                // modify final result to be an object with keys of the types and values of the results
                results.reduce((acc, cur, i) => {
                    acc[Object.keys(queryTypes)[i]] = cur
                    return acc
                }, {})
            )

            return res.status(200).json(createSuccessResponse(results))
        }
    } catch (err) {
        return res.status(500).json(createErrorResponse(err))
    }
}