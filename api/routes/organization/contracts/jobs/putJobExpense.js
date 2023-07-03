const { sequelize, JobExpense, Job } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')

//Update a job expense for a specific job
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const contractID = req.params.contract_id;
        const jobID = req.params.job_id;
        const jobExpenseID = req.params.job_expense_id;

        if (!orgID || !validator(orgID) || !contractID || !validator(contractID) || !jobID || !validator(jobID) || !jobExpenseID || !validator(jobExpenseID)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization, contract, job, or job expense ID'))
        }

        const { name, description, amount } = req.body;

        if (!name || !validator(name) || !description || !validator(description) || !amount || !validator(amount)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid name, description, or amount'))
        }

        const jobExpense = await JobExpense.update({
            name,
            description,
            amount
        }, {
            where: {
                organizationId: orgID,
                contractId: contractID,
                jobId: jobID,
                id: jobExpenseID
            }
        })

        return res.status(200).json(createSuccessResponse(jobExpense))
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
}
