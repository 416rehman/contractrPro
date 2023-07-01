//*******************************************TODO******************* */
// DELETE /organizations/:org_id/contracts/:contract_id/expenses/:expense_id 
const { sequelize, Expense } = require('../../../db');
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response');
module.exports = async(req, res) => {
    const orgId=req.params.org_id;
    const contractId=req.params.contract_id;
    const expenseId=req.params.expense_id;
    try{
        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'));
        }
        if (!contractId) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID is required'));
        }
        if (!expenseId) {
            return res
                .status(400)
                .json(createErrorResponse('Expense ID is required'));
        }

        await sequelize.transaction(async (transaction) => {
            const expense = await Expense.findOne({
                where: {
                    OrganizationId: orgId,
                    ContractId: contractId,
                    id: expenseId,
                },
                transaction,
            });

            if (!expense) {
                throw new Error(`expense ${expenseId} not exist`);
            }

            await expense.destroy({
                transaction,
            });

            return res.status(200).json(createSuccessResponse(`Expense ${expenseId} and related data has been deleted successfully`));
        });

    }catch(err){
         return res.status(500).json(createErrorResponse(err.message));

    }
}
