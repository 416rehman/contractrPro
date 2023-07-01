//*******************************************TODO******************* */
//POST /organizations/:org_id/contracts/:contract_id/expenses

const { sequelize, Expense } = require('../../../db');
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response');
const { pick } = require('../../../utils');

module.exports = async(req, res) => {
    try{
        const orgId = req.params.org_id;
        const contractId = req.params.contract_id;
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
        const body = {
            ...pick(req.body, [
                'description',
                'date',
                'JobId',
                'VendorId',
            ]),
            OrganizationId: orgId,
            ContractId: contractId,
            updatedByUserId: req.auth.id,
        };
        await sequelize.transaction(async (transaction) => {
            const expense = Expense.build(body);
            await expense.save({ transaction });

            res.status(200).json(createSuccessResponse(expense));
        })
        
    }catch(err){
        res.status(500).json(createErrorResponse(err.message));
    }
}
