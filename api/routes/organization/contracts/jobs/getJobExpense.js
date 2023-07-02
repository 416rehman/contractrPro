const { sequelize, JobExpense, Job } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')

//Gets a specific expense for a specific job
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const contractID = req.params.contract_id;
        const jobID = req.params.job_id;
        const expenseID = req.params.expense_id;

        if (!orgID || !validator(orgID) || !contractID || !validator(contractID) || !jobID || !validator(jobID) || !expenseID || !validator(expenseID)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization, contract, job, or expense ID'))
        }

        const expense = await JobExpense.findOne({
            where: {
                organizationId: orgID,
                contractId: contractID,
                jobId: jobID,
                id: expenseID
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

        return res.status(200).json(createSuccessResponse(expense))
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
}
