//*******************************************TODO******************* */
const { sequelize, Invoice } = require('../../db');
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
                'invoiceNumber',
                'invoiceDate',
                'dueDate',
                'poNumber',
                'note',
                'taxRate',
            ]),
            OrganizationId: orgId,
            ContractId:req.params.org_id,
            JobId:req.params.job_id,
            ClientId:req.params.client_id,
            updatedByUserId: req.auth.id,
        };
        await sequelize.transaction(async (transaction) => {
            const invoice = Invoice.build(body);
            await invoice.save({ transaction });

            res.status(200).json(createSuccessResponse(invoice));
        })
        
    }catch(err){
        res.status(500).json(createErrorResponse(err.message));
    }
}
