const { Vendor, Comment, Attachment, sequelize } = require('../../../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../../utils/response')

module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const vendorId = req.params.vendor_id

        const { page = 1, limit = 10 } = req.query

        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        }

        await sequelize.transaction(async (transaction) => {
            // make sure the vendor belongs to the org
            const vendor = await Vendor.findOne({
                where: { id: vendorId, OrganizationId: orgId },
                transaction,
            })
            if (!vendor) {
                return res
                    .status(400)
                    .json(createErrorResponse('Vendor not found.'))
            }

            // Get the comments
            const comments = await Comment.findAndCountAll({
                where: {
                    VendorId: vendorId,
                },
                include: [
                    {
                        model: Attachment,
                    },
                ],
                transaction,
                ...options,
            })
            const totalPages = Math.ceil(comments.count / parseInt(limit))
            const response = {
                comments: comments.rows,
                currentPage: parseInt(page),
                totalPages,
            }

            return res.status(200).json(createSuccessResponse(response))
        })
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', err))
    }
}
