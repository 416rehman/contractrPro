const { sequelize, JobExpense, Job } = require('../../../db')
const { createSuccessResponse, createErrorResponse } = require('../../../utils/response')
const { validator } = require('../../../utils/validator')

// Deletes the organization's contract job expense
module.exports = async (req, res) => {
            
try {
            
    const jobExpenseID = req.params.job_expense_id;
            
    if (!jobExpenseID || !validator(jobExpenseID)) {
        return res
            .status(400)
            .json(createErrorResponse('Job Expense ID required'))
    }
            
    await sequelize.transaction(async (transaction) => {
            
        const jobExpense = await JobExpense.findOne({
            where: {
                id: jobExpenseID,
            },
            transaction,
        })
            
        if (!jobExpense) {
            return res
            .status(400)
            .json(createErrorResponse('Job Expense not found'))
            }
            
            await jobExpense.destroy({
                transaction,
            })
            
            return res.status(201).json(createSuccessResponse('Job Expense deleted successfully'))
        })
            
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
            
}
