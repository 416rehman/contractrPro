const { sequelize, JobExpense, Job } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')

// Gets all the organization's contract expenses for a specific job
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const contractID = req.params.contract_id;
        const jobID = req.params.job_id;

        if (!orgID || !validator(orgID) || !contractID || !validator(contractID) || !jobID || !validator(jobID)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization, contract, or job ID'))
        }

        const expenses = await JobExpense.findAll({
            where: {
                organizationId: orgID,
                contractId: contractID,
                jobId: jobID
            },
            include: [
                {
                    model: Job,
                    where: {
                        organizationId: orgID,
                        contractId: contractID,
                        id: jobID
                    }
                }
            ]
        })

        return res.status(200).json(createSuccessResponse(expenses))
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
}
