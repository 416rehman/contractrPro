//*******************************************TODO******************* */
// DELETE /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id 
const { sequelize, Invoice } = require('../../../db');
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response');
module.exports = async(req, res) => {
    const orgId=req.params.org_id;
    const contractId=req.params.contract_id;
    const invoiceId=req.params.invoice_id;

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
        if (!invoiceId) {
            return res
                .status(400)
                .json(createErrorResponse('Invoice ID is required'));
        }

        await sequelize.transaction(async (transaction) => {
            const invoice = await Invoice.findOne({
                where: {
                    OrganizationId: orgId,
                    ContractId: contractId,
                    id: invoiceId,
                },
                transaction,
            });

            if (!invoice) {
                throw new Error(`Invoice ${invoiceId} not exist`);
            }

            await invoice.destroy({
                transaction,
            });

            return res.status(200).json(createSuccessResponse(`Invoice ${invoiceId} and related data has been deleted successfully`));
        });

    }catch(err){
         return res.status(500).json(createErrorResponse(err.message));

    }
}
