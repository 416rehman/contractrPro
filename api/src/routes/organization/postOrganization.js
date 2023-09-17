const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const prisma = require('../../prisma')
const { zOrganization } = require('../../validators/organization.zod')
const { zAddress } = require('../../validators/address.zod')
const {
    zOrganizationConfig,
} = require('../../validators/organizationConfig.zod')

// Creates an organization
module.exports = async (req, res) => {
    try {
        const data = zOrganization.parse(req.body)
        let include = {}

        // Organization's Address - Default values
        data.Address = {
            create: zAddress.parse(req.body?.Address) || {},
        }
        include.Address = true

        // Organization's Config - Default values
        data.OrganizationConfig = {
            create:
                zOrganizationConfig.parse(req.body?.OrganizationConfig) || {},
        }
        include.OrganizationConfig = true

        // Organization's Owner as initial member
        data.OrganizationMembers = {
            create: [
                {
                    User: {
                        connect: {
                            id: req.auth.id,
                        },
                    },
                    name: req.auth.name || req.auth.username || 'Member',
                    email: req.auth.email,
                    phoneCountry: req.auth.phoneCountry || null,
                    phoneNumber: req.auth.phoneNumber || null,
                },
            ],
        }
        include.OrganizationMembers = true

        data.ownerId = req.auth.id

        const org = await prisma.organization.create({
            data,
            include,
        })

        return res.status(201).json(createSuccessResponse(org))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}