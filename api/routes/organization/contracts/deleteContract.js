//*******************************************TODO******************* */
//DELETE /organizations/:org_id/contracts/:contact_id 
const { sequelize, Contract, Expense, Invoice, Job } = require('../../../db');
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response');
module.exports = async(req, res) => {
    const contractId=req.params.contract_id;
    const orgId=req.params.org_id;
    try{
        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'));
        }
        
        if (!contractId) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID required'));
        }

        await sequelize.transaction(async (transaction) => {
            const contract = await Contract.findOne({
                where: {
                    OrganizationId: orgId,
                    id: contractId,
                },
                transaction,
            });

            if (!contract) {
                throw new Error(`contract ${contractId} not exist`);
            }

            await Promise.all([
                Expense.destroy({ where: { ContractId: contractId }, transaction }),
                Invoice.destroy({ where: { ContractId: contractId }, transaction }),
                Job.destroy({ where: { ContractId: contractId }, transaction }),
                //Comment.destroy({ where: { ContractId: contractId }, transaction }), if there is a comment??
            ]);

            // Delete the contract
            await contract.destroy({ transaction });

            return res.status(200).json(createSuccessResponse(`Contract ${contractId} and related data has been deleted successfully`));
        });

    }catch(err){
         return res.status(500).json(createErrorResponse(err.message));

    }
}
