const {
    sequelize,
    Organization,
    Address,
    OrganizationMember,
} = require('../../db')
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

        console.log('Creating organization')

        await sequelize.transaction(async (transaction) => {
            // create the new organization
            const org = await Organization.create(body, {
                include: req.body.Address && [Address],
                transaction,
            })

            // add the owner to the organization
            await OrganizationMember.create(
                {
                    OrganizationId: org.id,
                    UserId: req.auth.id,
                    name: req.auth.name,
                    email: req.auth.email,
                    phone: req.auth.phone || null,
                },
                { transaction }
            )

            return res.status(201).json(createSuccessResponse(org))
        })
    } catch (error) {
        console.log('Error: ', error)
        return res.status(400).json(createErrorResponse('', error))
    }
}
