/**
 * const { Organization,User } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
*/

//Retrieve user by id of user from the same organization
/**
 *module.exports = async(req, res) => {
    try{
        const userId = req.params.user_id;
        const orgId = req.params.org_id;

        //check orgId and userId input
        if (!orgId) {
            return res.status(400).json(createErrorResponse('Organization id is required'));
        }
        if (!userId) {
            return res.status(400).json(createErrorResponse('user id is required'));
        }

        //since user has unique id, it only return 1 user object
        const user = await User.findAll({
            where: { id: userId },
            include: [
                {
                    model: Organization,
                    where: { id: orgId },

                    //if any attributes need to be used by front-end ,specify them here
                    attributes: ['id', 'username', 'email', 'phone'],
                },
            ],
        });

        //if no user in such organization, return empty array
        if (!user) {
            return [];
        }

        res.status(200).json(createSuccessResponse(user));

    }catch(err){
        res.status(500).json(createErrorResponse(error.message, err));
    }
}
 */
