const { sequelize, Job, Contract, Organization } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Creates an organization's contract
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            const org = await Organization.findOne({
                where: {
                    id: orgID,
                },
                transaction,
            })

            if (!org) {
                return res
                    .status(400)
                    .json(createErrorResponse('Organization not found'))
            }

            const body = {
                ...pick(req.body, [
                    'name',
                    'description',
                    'startDate',
                    'dueDate',
                    'completionDate',
                    'status',
                    'ClientId',
                ]),
                OrganizationId: orgID,
                UpdatedByUserId: req.auth.id,
            }

            if (req.body.Jobs) {
                body.Jobs = req.body.Jobs
            }

            const include = [
                {
                    model: Organization,
                    where: {
                        id: orgID,
                    },
                },
            ]

            if (req.body?.Jobs?.length) {
                include.push({
                    model: Job,
                })
            }

            const createOrganizationContract = await Contract.create(body, {
                include: include,
                transaction,
            })

            return res
                .status(201)
                .json(createSuccessResponse(createOrganizationContract))
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse('', error))
    }
}