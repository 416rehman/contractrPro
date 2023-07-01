//*******************************************TODO******************* */
const { sequelize, Expense } = require('../../../db');
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response');
const { pick } = require('../../../utils');

module.exports = async(req, res) => {
    try{
        const orgId = req.params.org_id;
        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }
        const body = {
            ...pick(req.body, [
                'description',
                'date',
            ]),
            OrganizationId: orgId,
            ContractId:req.params.org_id,
            JobId:req.params.job_id,
            VendorId:req.params.vendor_id,
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
