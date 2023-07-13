const { sequelize, Organization, Address } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const { pick } = require('../../utils')

// Creates an organization
module.exports = async (req, res) => {
    try {
        const body = {
            ...pick(req.body, [
                'name',
                'description',
                'email',
                'phone',
                'website',
                'logoUrl',
                'Address',
            ]),
            OwnerId: req.auth.id,
            UpdatedByUserId: req.auth.id,
        }

        await sequelize.transaction(async (transaction) => {
            const org = await Organization.create(body, {
                include: req.body.Address && [Address],
                transaction,
            })

            return res.status(201).json(createSuccessResponse(org))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}