const { Organization } = require('../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
//retrieve all organization
module.exports = async (req, res) => {
    try{
        const ownerId = req.auth.id;

        const organizations = await Organization.findAll({
            where: { ownerId },
        });

        res.status(200).json(createSuccessResponse(organizations));
    }catch(err){
        res.status(500).json(createErrorResponse(error.message, error));
    }
}