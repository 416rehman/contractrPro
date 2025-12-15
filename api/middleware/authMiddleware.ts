import jwt from 'jsonwebtoken';
import { createErrorResponse } from '../utils/response';
import { ErrorCode } from '../utils/errorCodes';
import { db, users } from '../db';
import { eq } from 'drizzle-orm';

// dev mode: fake auth for testing
const devAuthMiddleware = async (req: any, res: any, next: any) => {
    req.auth = {
        id: process.env.DEV_USER_UUID,
        username: process.env.DEV_USER_USERNAME,
    };

    const userData = await db.query.users.findFirst({
        where: eq(users.id, req.auth.id),
        with: {
            organizationMemberships: {
                with: {
                    organization: true
                }
            }
        }
    });

    if (!userData) {
        return res.status(401).send(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND));
    }

    req.auth = userData;
    return next();
};

// prod mode: verify JWT
const prodAuthMiddleware = (req: any, res: any, next: any) => {
    let token =
        req.headers['authorization'] ||
        req.body.token ||
        req.query.token ||
        req.headers['x-access-token'] ||
        req.cookies.accessToken;

    if (!token) {
        return res
            .status(403)
            .send(createErrorResponse(ErrorCode.AUTH_ACCESS_TOKEN_MISSING));
    }
    try {
        token = token.replace('Bearer ', '');
        jwt.verify(
            token,
            process.env.JWT_SECRET!,
            {},
            async function (err: any, decoded: any) {
                if (err) {
                    return res
                        .status(401)
                        .send(createErrorResponse(ErrorCode.AUTH_ACCESS_TOKEN_INVALID));
                }

                req.auth = decoded;

                const userData = await db.query.users.findFirst({
                    where: eq(users.id, req.auth.id),
                    with: {
                        organizationMemberships: {
                            with: {
                                organization: true
                            }
                        }
                    }
                });

                if (!userData) {
                    return res
                        .status(401)
                        .send(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND));
                }

                req.auth = userData;

                // TODO: check banned flag if needed
                // if (req.auth.flags & 2) {
                //     return res.status(403).send(createErrorResponse(ErrorCode.AUTH_USER_BANNED));
                // }

                return next();
            }
        );
    } catch (err: any) {
        return res.status(401).send(createErrorResponse(ErrorCode.AUTH_ACCESS_TOKEN_INVALID, err));
    }
};

let authMiddleware: any;
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    authMiddleware = devAuthMiddleware;
} else {
    authMiddleware = prodAuthMiddleware;
}

export default authMiddleware;

