const jwt = require("jsonwebtoken");
if (process.env.NODE_ENV === "development") {
    // default export
    module.exports = function (req, res, next) {
        // add a fake auth object to the request to indicate that the user is authenticated in development mode
        req.auth = {
            id: 0,
            username: "dev",
        }

        return next();
    }
} else {
    /**
     * Checks the token and if it is valid, sets the auth field on the request object.
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    module.exports.tokenAuthHandler = function (req, res, next) {
        let token =
            req.headers["authorization"] || req.body.token || req.query.token || req.headers["x-access-token"];

        if (!token) {
            return res.status(403).send("Access token is missing - Use Authorization header or token in body or query");
        }
        try {
            token = token.replace("Bearer ", "");
            jwt.verify(token, process.env.JWT_SECRET, {}, function (err, decoded) {
                if (err) {
                    return res.status(401).send("Access token is invalid");
                }
                req.auth = decoded;
                return next();
            });
        } catch (err) {
            return res.status(401).send("Access token is invalid");
        }
    };
}
