const { Organization } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')

//retrieve all organization
module.exports = async (req, res) => {
    try{
        const ownerId = req.auth.id;

        //since organization has unique ids, it only return 1 organization object
        const organizations = await Organization.findAll({
            where: { id: ownerId },
        });

        res.status(200).json(createSuccessResponse(organizations));
    }catch(err){
        res.status(500).json(createErrorResponse(error.message, error));
    }
}
