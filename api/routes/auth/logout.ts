// Clears the cookie if it exists
import { createSuccessResponse,
    createErrorResponse,
 } from '../../utils/response';
export default function logout(req, res) {
    try {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        return res.status(200).json(createSuccessResponse('Logged out'))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
