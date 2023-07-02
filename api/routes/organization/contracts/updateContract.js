//*******************************************TODO******************* */
//PUT /organizations/:org_id/contracts/:contract_id 
const { sequelize, Contract } = require('../../../db');
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response');
const { pick } = require('../../../utils');
module.exports = async(req, res) => {
    const orgId = req.params.org_id;
    const contractId = req.params.contract_id;
    try{
        const body = {
            ...pick(req.body, [
                'name',
                'description',
                'startDate',
                'dueDate',
                'completionDate',
                'status'
            ]),
            updatedByUserId: req.auth.id,
        };

        await sequelize.transaction(async (transaction) => {
            const contract = await Contract.findOne({
                where: { 
                    id: contractId, 
                    OrganizationId: orgId,
                },
                transaction,
                returning: true,
            });

            if (!contract) {
                return res.status(404).json(createErrorResponse(`contract ${contractId} not exist`));
            }

            // Update the contract
            await contract.update(body, { transaction });

            return res.status(200).json(createSuccessResponse(`Contract ${contractId} updated successfully`));
        });

    }catch(err){
        return res.status(500).json(createErrorResponse(err.message));
    }
}
