const { User } = require('../../db');
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response');

// Retrieves all users with pagination
module.exports = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const options = {
            attributes: [
                'id',
                'username',
                'email',
                'name',
                'createdAt',
                'updatedAt',
                'phone',
                'avatarUrl',
            ],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        };

        const users = await User.findAndCountAll(options);

        const totalPages = Math.ceil(users.count / parseInt(limit));
        const response = {
            users: users.rows,
            currentPage: parseInt(page),
            totalPages,
        };

        res.status(200).json(createSuccessResponse(response));
    } catch (err) {
        res.status(500).json(createErrorResponse(err.message));
    }
};
