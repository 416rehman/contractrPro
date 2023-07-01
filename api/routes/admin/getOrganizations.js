const { Organization } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

// Retrieves all organizations with pagination
module.exports = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query

        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        }

        const organizations = await Organization.findAndCountAll(options)

        const totalPages = Math.ceil(organizations.count / parseInt(limit))
        const response = {
            organizations: organizations.rows,
            currentPage: parseInt(page),
            totalPages,
        }

        return res.status(200).json(createSuccessResponse(response))
    } catch (err) {
        return res.status(500).json(createErrorResponse(err.message))
    }
}
