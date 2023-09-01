const {
    Organization,
    Address,
    OrganizationSettings,
    sequelize,
} = require('../../db')
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
                'OrganizationSetting',
                'Address',
            ]),
            UpdatedByUserId: req.auth.id,
        }

        const include = []

        if (body.Address) {
            body.Address = pick(req.body?.Address, [
                'country',
                'postalCode',
                'province',
                'city',
                'addressLine1',
                'addressLine2',
            ])
            include.push(Address)
        }

        if (body.OrganizationSetting) {
            body.OrganizationSetting = pick(body.OrganizationSetting, [
                'currencyCode',
                'currencySymbol',
                'invoiceUseDateForNumber',
                'invoiceDefaultTaxRate',
                'invoiceDefaultTerms',
                'invoiceFooterLine1',
                'invoiceFooterLine2',
                'invoiceBoldFooterLine1',
                'invoiceBoldFooterLine2',
            ])
            include.push(OrganizationSettings)
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
                include: include,
                transaction,
                returning: true,
            })

            if (!queryResult[0]) {
                throw new Error('Organization not found')
            }

            if (body?.Address) {
                // if an address exists, update it, otherwise create it
                const res = await Address.upsert(
                    { ...body.Address, OrganizationId: orgId },
                    {
                        transaction,
                        returning: true,
                    }
                )

                queryResult[1][0].Address = res[0].dataValues
            }

            if (body?.OrganizationSetting) {
                // if an organization setting exists, update it, otherwise create it
                const res = await OrganizationSettings.upsert(
                    { ...body.OrganizationSetting, OrganizationId: orgId },
                    {
                        transaction,
                        returning: true,
                    }
                )

                queryResult[1][0].OrganizationSetting = res[0].dataValues
            }

            const updatedOrg = queryResult[1][0]

            return res.status(200).json(createSuccessResponse(updatedOrg))
        })
    } catch (err) {
        console.log(err)
        return res.status(400).json(createErrorResponse('', err))
    }
}
