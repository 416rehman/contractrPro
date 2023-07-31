const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { Vendor, Comment, sequelize } = require('../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// Deletes a comment
module.exports = async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const vendorId = req.params.vendor_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid comment id.'))
        }

        if (!vendorId || !isValidUUID(vendorId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid vendor id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
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

            // Delete the comment
            const comment = await Comment.destroy({
                where: {
                    id: commentId,
                    VendorId: vendorId,
                    OrganizationId: orgId,
                },
                transaction,
            })

            return res.status(200).json(createSuccessResponse(comment))
        })
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('Failed to delete comment.'))
    }
}