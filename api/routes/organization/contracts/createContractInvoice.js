//*******************************************TODO******************* */
//POST route: /organizations/:org_id/contracts/:contract_id/invoices
const { sequelize, Invoice } = require('../../../db');
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response');
const { pick } = require('../../../utils');

module.exports = async(req, res) => {
    const orgId = req.params.org_id;
    const contractId = req.params.contract_id;
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
        const body = {
            ...pick(req.body, [
                'invoiceNumber',
                'invoiceDate',
                'dueDate',
                'poNumber',
                'note',
                'taxRate',
                'JobId',
                'ClientId',
            ]),
            OrganizationId: orgId,
            ContractId:contractId,
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
