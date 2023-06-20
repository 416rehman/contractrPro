const { User } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

//Retrieve user by id 
module.exports = async(req, res) => {
    try{
        const userId = req.params.user_id;

        //since organization has unique ids, it only return 1 organization object
        const user = await User.findAll({
            where: { id:userId },
        });

        res.status(200).json(createSuccessResponse(organizations));

    }catch{
        res.status(500).json(createErrorResponse(error.message, error));
    }
}