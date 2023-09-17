const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../utils/response')
const prisma = require('../../prisma')
const { zOrganization } = require('../../validators/organization.zod')
const { zAddress } = require('../../validators/address.zod')
const {
    zOrganizationConfig,
} = require('../../validators/organizationConfig.zod')

// Updates an organization
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization id is required'))
        }

        const data = {
            ...zOrganization.partial().parse(req.body),
            updatedByUserId: req.auth.id,
        }
        const include = {}

        if (req.body.Address) {
            data.Address = {
                update: zAddress.partial().parse(req.body.Address),
            }
            include.Address = true
        }

        if (req.body.OrganizationConfig) {
            data.OrganizationConfig = {
                update: zOrganizationConfig
                    .partial()
                    .parse(req.body.OrganizationConfig),
            }
            include.OrganizationConfig = true
        }

        const org = await prisma.organization.update({
            where: {
                id: orgId,
            },
            data,
            include,
        })

        return res.status(200).json(createSuccessResponse(org))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}