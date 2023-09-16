const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const prisma = require('../../prisma')
module.exports = async (req, res) => {
    try {
        const deletedUser = await prisma.user.delete({
            where: {
                id: req.auth.id
            }
        })

        delete deletedUser?.password

        return res.status(200).json(createSuccessResponse(deletedUser))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
