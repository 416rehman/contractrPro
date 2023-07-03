const { sequelize, JobExpense, Job } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')

//Create a new job expense for a specific job
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

        const { name, description, amount } = req.body;

        if (!name || !validator(name) || !description || !validator(description) || !amount || !validator(amount)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid name, description, or amount'))
        }

        const jobExpense = await JobExpense.create({
            name,
            description,
            amount,
            organizationId: orgID,
            contractId: contractID,
            jobId: jobID
        })

        return res.status(200).json(createSuccessResponse(jobExpense))
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
