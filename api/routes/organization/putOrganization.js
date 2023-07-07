const { Organization, sequelize } = require('../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../utils/response')
const { pick } = require('../../utils')

// Updates an organization
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
            ]),
            UpdatedByUserId: req.auth.id,
        }

        const orgId = req.params.org_id
        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization id is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const queryResult = await Organization.update(body, {
                where: {
                    id: orgId,
                },
                transaction,
                returning: true,
            })

            if (!queryResult[0]) {
                throw new Error('Organization not found')
            }

            //queryResult returns:
            // [
            //     <number of rows updated>,
            //     [<array of updated rows>]
            // ]
            const updatedOrg = queryResult[1][0]

            return res.status(200).json(createSuccessResponse(updatedOrg))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
