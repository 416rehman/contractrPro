//*******************************************TODO******************* */
const { sequelize, Contract } = require('../../../db');
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
        if (!req.params.client_id) {
            return res
                .status(400)
                .json(createErrorResponse('Member ID is required'));
        }
        if (!req.params.contract_id) {
            return res
                .status(400)
                .json(createErrorResponse('Member ID is required'));
        }

        await sequelize.transaction(async (transaction) => {
            const contract = await Contract.findOne({
                where: {
                    OrganizationId: req.params.org_id,
                    ClientId: req.params.client_id,
                    id: req.params.member_id,
                },
                transaction,
            });

            if (!contract) {
                throw new Error('contract not exist')
            }

            await contract.destroy({
                transaction,
            });

            return res.status(200).json(createSuccessResponse(contract));
        });

    }catch(err){
         return res.status(500).json(createErrorResponse(err.message));

    }
}
