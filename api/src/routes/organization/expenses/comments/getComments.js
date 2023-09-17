const prisma = require('../../../../prisma')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../../utils/response')

module.exports = async (req, res) => {
    try {
        const expenseId = req.params.expense_id
        const orgId = req.params.org_id

        if (!expenseId) throw new Error('Expense ID is required.')

        const { page = 1, perPage = 10 } = req.query

        const where = {
            Expense: {
                id: expenseId,
                organizationId: orgId,
            },
        }

        // final response should contain the total number of comments, the current page, and the total number of pages
        const comments = await prisma.comment.findMany({
            where,
            include: { Attachment: true },
            skip: (page - 1) * perPage,
            take: perPage,
        })

        const totalComments = await prisma.comment.count({
            where,
        })

        return res.status(200).json(
            createSuccessResponse({
                comments,
                totalComments,
                page,
                totalPages: Math.ceil(totalComments / perPage),
            })
        )
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', err))
    }
}