const { OrganizationSettings, sequelize } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')

//update organizationSettings by id
module.exports = async (req, res) => {
    const orgId = req.params.org_id

    //check orgId input
    if (!orgId) {
        return res
            .status(400)
            .json(createErrorResponse('Organization id is required'))
    }

    const body = pick(req.body, [
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

    try {
        await sequelize.transaction(async (t) => {
            const orgSettings = await OrganizationSettings.findOne({
                where: { OrganizationId: orgId },
                transaction: t,
            })

            if (!orgSettings) {
                return res
                    .status(404)
                    .json(
                        createErrorResponse('Organization settings not found')
                    )
            }

            await orgSettings.update(body, { transaction: t })

            return res.status(200).json(createSuccessResponse(orgSettings))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
