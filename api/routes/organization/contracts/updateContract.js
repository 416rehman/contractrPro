const { sequelize, Contract, Job, JobMember } = require('../../../db')
const { Op } = require('sequelize')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')
const { isValidUUID } = require('../../../utils/isValidUUID')
module.exports = async (req, res) => {
    let updatedContract
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID is required'))
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
            UpdatedByUserId: req.auth.id,
            OrganizationId: orgId,
        }

        const Jobs =
            req.body?.Jobs?.map((entry) =>
                pick(entry, [
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

        await sequelize.transaction(async (transaction) => {
            const queryResult = await Contract.update(body, {
                where: {
                    OrganizationId: orgId,
                    id: contractId,
                },
                transaction,
                returning: true,
            })

            if (!queryResult[0]) {
                throw new Error('Contract not found')
            }

            updatedContract = queryResult[1][0]?.dataValues

            if (Jobs.length > 0) {
                // Update or create jobs
                const newJobs = await Promise.all(
                    Jobs.map(async (job) => {
                        const [updatedJob] = await Job.upsert(
                            {
                                ...job,
                                ContractId: contractId,
                                OrganizationId: orgId,
                                UpdatedByUserId: req.auth.id,
                            },
                            {
                                returning: true,
                                transaction,
                            }
                        )
                        return updatedJob
                    })
                )

                // Delete the jobs that were not updated
                const jobIds = newJobs.map((job) => job.id)
                await Job.destroy({
                    where: {
                        id: {
                            [Op.notIn]: jobIds,
                        },
                        ContractId: contractId,
                    },
                    transaction,
                })

                updatedContract.Jobs = newJobs
            }
        })

        for (let i = 0; i < updatedContract?.Jobs?.length; i++) {
            const job = updatedContract.Jobs[i]
            const memberIds = job.assignedTo
            if (!memberIds) {
                continue
            }

            await JobMember.destroy({
                where: {
                    JobId: job.id,
                    OrganizationMemberId: {
                        [Op.notIn]: memberIds,
                    },
                },
            })

            updatedContract.Jobs[i].dataValues.JobMembers =
                await JobMember.bulkCreate(
                    memberIds.map((memberId) => ({
                        JobId: job.id,
                        OrganizationMemberId: memberId,
                    }))
                )
            updatedContract.Jobs[i].dataValues.assignedTo = memberIds
        }

        return res.status(200).json(createSuccessResponse(updatedContract))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}