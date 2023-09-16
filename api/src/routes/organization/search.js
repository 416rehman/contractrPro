const { Op } = require('sequelize')
const {
    OrganizationMember,
    Invoice,
    Job,
    Expense,
    Client,
    Contract,
    Attachment,
    Comment,
    Vendor,
} = require('../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../utils/response')

const queryTypes = {
    organizationMember: (searchQuery, orgId) =>
        OrganizationMember.findAll({
            where: {
                OrganizationId: orgId,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchQuery}%` } },
                    { email: { [Op.iLike]: `%${searchQuery}%` } },
                    { phone: { [Op.iLike]: `%${searchQuery}%` } },
                ],
            },
        }),
    invoice: (searchQuery, orgId) =>
        Invoice.findAll({
            where: {
                OrganizationId: orgId,
                [Op.or]: [
                    {
                        invoiceNumber: {
                            [Op.iLike]: `%${searchQuery}%`,
                        },
                    },
                    { poNumber: { [Op.iLike]: `%${searchQuery}%` } },
                    { note: { [Op.iLike]: `%${searchQuery}%` } },
                ],
            },
        }),
    job: (searchQuery, orgId) =>
        Job.findAll({
            where: {
                [Op.or]: [
                    { reference: { [Op.iLike]: `%${searchQuery}%` } },
                    { name: { [Op.iLike]: `%${searchQuery}%` } },
                    {
                        description: {
                            [Op.iLike]: `%${searchQuery}%`,
                        },
                    },
                ],
            },
            include: [
                {
                    model: Contract,
                    where: {
                        OrganizationId: orgId,
                    },
                },
            ],
        }),
    expense: (searchQuery, orgId) =>
        Expense.findAll({
            where: {
                OrganizationId: orgId,
                [Op.or]: [
                    {
                        expenseNumber: {
                            [Op.iLike]: `%${searchQuery}%`,
                        },
                    },
                    {
                        description: {
                            [Op.iLike]: `%${searchQuery}%`,
                        },
                    },
                ],
            },
        }),
    client: (searchQuery, orgId) =>
        Client.findAll({
            where: {
                OrganizationId: orgId,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchQuery}%` } },
                    { email: { [Op.iLike]: `%${searchQuery}%` } },
                    { phone: { [Op.iLike]: `%${searchQuery}%` } },
                    { website: { [Op.iLike]: `%${searchQuery}%` } },
                    {
                        description: {
                            [Op.iLike]: `%${searchQuery}%`,
                        },
                    },
                ],
            },
        }),
    contract: (searchQuery, orgId) =>
        Contract.findAll({
            where: {
                OrganizationId: orgId,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchQuery}%` } },
                    {
                        description: {
                            [Op.iLike]: `%${searchQuery}%`,
                        },
                    },
                ],
            },
        }),
    attachment: (searchQuery, orgId) =>
        Attachment.findAll({
            where: {
                [Op.or]: [{ name: { [Op.iLike]: `%${searchQuery}%` } }],
            },
            include: [
                {
                    model: Comment,
                    where: {
                        OrganizationId: orgId,
                    },
                },
            ],
        }),
    vendor: (searchQuery, orgId) =>
        Vendor.findAll({
            where: {
                OrganizationId: orgId,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchQuery}%` } },
                    { email: { [Op.iLike]: `%${searchQuery}%` } },
                    { phone: { [Op.iLike]: `%${searchQuery}%` } },
                    { website: { [Op.iLike]: `%${searchQuery}%` } },
                    {
                        description: {
                            [Op.iLike]: `%${searchQuery}%`,
                        },
                    },
                ],
            },
        }),
}

module.exports = async (req, res) => {
    const organizationId = req.params.org_id
    //Search route
    const searchQuery = req.query.q
    const searchType = req.query.type

    if (!searchQuery) {
        return res
            .status(400)
            .json(createErrorResponse('Missing search query parameter (q)'))
    }

    const searchFunction = queryTypes[searchType]
    try {
        if (searchFunction) {
            // If the search type is specified, search only that type, returns an object with key of the type and value of the results
            const results = await searchFunction(searchQuery, organizationId)
            return res
                .status(200)
                .json(createSuccessResponse({ [searchType]: results }))
        } else {
            // If the search type is not specified, search all types, returns an object with keys of the types and values of the results
            const results = {}
            for (const type in queryTypes) {
                results[type] = await queryTypes[type](
                    searchQuery,
                    organizationId
                )
            }
            return res.status(200).json(createSuccessResponse(results))
        }
    } catch (err) {
        console.error(err)
        return res.status(500).json(createErrorResponse(err))
    }
}
