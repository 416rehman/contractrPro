const { Organization, User } = require('../../db');

const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response');

// Gets the a user's organizations
module.exports = async (req, res) => {

    try {
        const userID = req.params.user_id;

        if (!userID) return res.status(400).json(createErrorResponse('User ID is required'));
        
        const userOrganizations = await User.findAll({
            where: {
                id: userID,
            },
            include: {
                model: Organization,
            }
        });
        
        return res.status(200).json(createSuccessResponse(userOrganizations));
    }
    catch (error) {
        res.status(500).json(createErrorResponse(error.message, error));
    }

}
