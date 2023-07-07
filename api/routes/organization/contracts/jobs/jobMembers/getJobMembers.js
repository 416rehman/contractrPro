const { Job, OrganizationMember } = require('../../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../../utils/response')
const { isValidUUID } = require('../../../../../utils/isValidUUID')

// Get jobMember
module.exports = async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json(createErrorResponse('Invalid job id.'))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
        }

        // Find jobMembers for the job
        const jobMembers = await OrganizationMember.findAll({
            where: {
                OrganizationId: orgId,
            },
            include: [
                {
                    model: Job,
                    where: {
                        id: jobId,
                        ContractId: contractId,
                    },
                    required: true,
                    // attributes: [], //excludes all attributes
                },
            ],
        })

        if (!jobMembers) {
            return res
                .status(404)
                .json(createErrorResponse('JobMembers not found.'))
        }

        return res.status(200).json(createSuccessResponse(jobMembers))
    } catch (err) {
        return res
            .status(500)
            .json(createErrorResponse('Server error.', err.message))
    }
}
