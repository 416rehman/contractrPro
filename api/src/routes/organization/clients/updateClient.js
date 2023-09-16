const { Client, sequelize } = require('../../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
const { pick } = require('../../../utils')

// Update organization client
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const clientId = req.params.client_id
        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }
        if (!clientId || !isValidUUID(clientId)) {
            return res
                .status(400)
                .json(createErrorResponse('Client ID is required'))
        }

        const body = {
            ...pick(req.body, [
                'name',
                'email',
                'phone',
                'website',
                'description',
            ]),
            OrganizationId: orgId,
            UpdatedByUserId: req.auth.id,
        }

        await sequelize.transaction(async (transaction) => {
            // return updated client
            const queryResult = await Client.update(body, {
                where: {
                    OrganizationId: orgId,
                    id: clientId,
                },
                transaction,
                returning: true,
            })

            if (!queryResult[0]) {
                throw new Error('Client not found')
            }

            //queryResult returns:
            // [
            //     <number of rows updated>,
            //     [<array of updated rows>]
            // ]
            const updatedClient = queryResult[1][0]

            // return updated client
            res.status(200).json(createSuccessResponse(updatedClient))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
