const {
    sequelize,
    Job,
    Contract,
    Organization,
    JobMember,
} = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')
const { isValidUUID } = require('../../../utils/isValidUUID')
const { Op } = require('sequelize')

// Creates an organization's contract
module.exports = async (req, res) => {
    let error = null,
        statusCode = null,
        createdContract = null

    try {
        const orgID = req.params.org_id
        const clientId = req.body.ClientId

        if (!orgID || !isValidUUID(orgID)) {
            statusCode = 400
            throw new Error('Valid Organization ID required')
        }

        if (!clientId || !isValidUUID(clientId)) {
            statusCode = 400
            throw new Error('Valid Client ID required')
        }

        await sequelize.transaction(async (transaction) => {
            const org = await Organization.findOne({
                where: {
                    id: orgID,
                },
                transaction,
            })

            if (!org) {
                statusCode = 400
                throw new Error('Organization not found')
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

            const include = [
                {
                    model: Organization,
                    where: {
                        id: orgID,
                    },
                },
            ]

            if (req.body?.Jobs?.length) {
                body.Jobs =
                    req.body?.Jobs?.map((job) =>
                        pick(job, [
                            'reference',
                            'name',
                            'description',
                            'status',
                            'startDate',
                            'dueDate',
                            'payout',
                            'assignedTo',
                        ])
                    ) || []

                include.push({
                    model: Job,
                })
            }

            createdContract = await Contract.create(body, {
                include: include,
                transaction,
            })

            for (let i = 0; i < createdContract?.Jobs?.length; i++) {
                const job = createdContract.Jobs[i]
                const memberIds = job.assignedTo
                if (!memberIds?.length) {
                    continue
                }

                // remove any job members that are not defined in the request
                await JobMember.destroy({
                    where: {
                        JobId: job.id,
                        OrganizationMemberId: {
                            [Op.notIn]: memberIds,
                        },
                    },
                })

                const result = await JobMember.bulkCreate(
                    memberIds.map((memberId) => ({
                        JobId: job.id,
                        OrganizationMemberId: memberId,
                    }))
                )

                createdContract.dataValues.Jobs[i].dataValues.assignedTo =
                    result.map((m) => m.OrganizationMemberId)
            }
        })
    } catch (err) {
        error = err
        statusCode = statusCode || 500
    }

    if (error) {
        return res.status(statusCode).json(createErrorResponse('', error))
    } else {
        return res.status(201).json(createSuccessResponse(createdContract))
    }
}