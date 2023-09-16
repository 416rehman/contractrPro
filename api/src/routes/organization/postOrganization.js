const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const prisma = require('../../prisma')
const { zOrganization } = require('../../validators/organization.zod')
const { zAddress } = require('../../validators/address.zod')
const { zOrganizationConfig } = require('../../validators/organizationConfig.zod')

// Creates an organization
module.exports = async (req, res) => {
    try {
        const data = zOrganization.parse(req.body)
        if (req.body?.Address) {
            data.Address = {
                create: [
                    zAddress.parse(req.body?.Address),
                ],
            }
        }
        if (req.body?.OrganizationConfig) {
            data.OrganizationConfig = {
                create: [
                    zOrganizationConfig.parse(req.body?.OrganizationConfig),
                ],
            }
        }

        // await sequelize.transaction(async (transaction) => {
        //     // create the new organization
        //     const org = await Organization.create(body, {
        //         include: req.body.Address && [Address],
        //         transaction,
        //     })
        //
        //     // add the owner to the organization
        //     await OrganizationMember.create(
        //         {
        //             OrganizationId: org.id,
        //             UserId: req.auth.id,
        //             name: req.auth.name || req.auth.username || 'Member',
        //             email: req.auth.email,
        //             phone: req.auth.phone || null,
        //         },
        //         { transaction }
        //     )
        //
        //     // create the organizationSetting
        //     org.dataValues.settings = await org.createOrganizationSetting(
        //         {
        //             OrganizationId: org.id,
        //             UpdatedByUserId: req.auth.id,
        //         },
        //         { transaction }
        //     )
        //
        //     return res.status(201).json(createSuccessResponse(org))
        // })

        const org = await prisma.organization.create({
                data,
            include: {
                Address: true,
                OrganizationConfig: true,
            },
        })

        // add the owner to the organization
        await prisma.organizationMember.create({
            data: {
                OrganizationId: org.id,
                UserId: req.auth.id,
                name: req.auth.name || req.auth.username || 'Member',
                email: req.auth.email,
                phone: req.auth.phone || null,
            },
        })

        return res.status(201).json(createSuccessResponse(org))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
