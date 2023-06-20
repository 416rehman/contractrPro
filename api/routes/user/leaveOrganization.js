const { sequelize, Organization, User } = require('../../db');
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response');

// Removes a user from an organization
module.exports = async (req, res) => {
    try {

        const body = {
            ...req.body,
            updatedByUserId: req.auth.id,
        }

        const orgId = req.params.org_id;
        const userId = req.params.user_id;

        //check orgId and userId input
        if (!orgId) {
            return res.status(400).json(createErrorResponse('Organization id is required'));
        }
        if (!userId) {
            return res.status(400).json(createErrorResponse('user id is required'));
        }

        await sequelize.transaction(async (transaction) => {
            const organization = await Organization.findByPk(orgId);

            if (!organization) {
                return res.status(404).json(createErrorResponse('Organization not found'));
            }

            const user = await User.findByPk(user_Id);

            if (!user) {
                return [];//if no such user id in organization, return empty array
            }

            await organization.removeUser(user);//!!!Attention!!!: double check relationship between user and organization to see if removeUser work in test

            res.status(200).json(createSuccessResponse('User removed from the organization'));
        });

        

       
    } catch (error) {
        res.status(500).json(createErrorResponse(error.message, error));
    }
};