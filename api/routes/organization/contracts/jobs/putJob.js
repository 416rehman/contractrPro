const { sequelize, Job, Contract } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')

// Update a job for a specific contract
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

        const { name, description, startDate, endDate } = req.body;

        if (!name || !validator(name) || !description || !validator(description) || !startDate || !validator(startDate) || !endDate || !validator(endDate)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid name, description, start date, or end date'))
        }

        const job = await Job.update({
            name,
            description,
            startDate,
            endDate
        }, {
            where: {
                organizationId: orgID,
                contractId: contractID,
                id: jobID
            }
        })

        return res.status(200).json(createSuccessResponse(job))
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
}
