//*******************************************TODO******************* */
const { sequelize, Expense } = require('../../../db');
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response');
module.exports = async(req, res) => {
    try{
        if (!req.params.org_id) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'));
        }
        if (!req.params.contract_id) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID is required'));
        }
        if (!req.params.job_id) {
            return res
                .status(400)
                .json(createErrorResponse('Job ID is required'));
        }
        if (!req.params.vendor_id) {
            return res
                .status(400)
                .json(createErrorResponse('Vendor ID is required'));
        }
        if (!req.params.expense_id) {
            return res
                .status(400)
                .json(createErrorResponse('Expense ID is required'));
        }

        await sequelize.transaction(async (transaction) => {
            const expense = await Expense.findOne({
                where: {
                    OrganizationId: req.params.org_id,
                    ContractId: req.params.contract_id,
                    JobId: req.params.job_id,
                    VendorId: req.params.vendor_id,
                    id: req.params.expense_id,
                },
                transaction,
            });

            if (!expense) {
                throw new Error('contract not exist');
            }

            await expense.destroy({
                transaction,
            });

            return res.status(200).json(createSuccessResponse(expense));
        });

    }catch(err){
         return res.status(500).json(createErrorResponse(err.message));

    }
}
