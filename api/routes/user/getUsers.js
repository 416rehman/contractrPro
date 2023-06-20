const { User } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

// Retrieves all users
module.exports = async (req, res) => {
    try {
        const users = await User.findAll();
        //if no user in organization at all, return empty array
        if (!users) {
            return [];
        }
        res.status(200).json(createSuccessResponse(users));
    } catch (err) {
        res.status(500).json(createErrorResponse(error.message, err));
    }
};



//Retrieve users by organization display their id, username,email,phone.
/**
 * 
 module.exports = async(req, res) => {
    try{
        const orgId = req.params.org_id;

        //check orgId input
        if (!orgId) {
            return res.status(400).json(createErrorResponse('Organization id is required'));
        }

        const users = await User.findByPk(orgId,{
            include: [
                {
                    model: User,
                    //user id ,username, email and phone has been retrieved and ready to be used by front-end
                    attributes: ['id', 'username', 'email', 'phone'], 
                },
            ], 
        });

        //if no user in organization at all, return empty array
        if (!users) {
            return [];
        }
        res.status(200).json(createSuccessResponse(users));

    }catch(err){
        res.status(500).json(createErrorResponse(error.message, err));
    }
}
 */
