const auth_service = require("../../utils/authHelpers");
const { signJWT } = require("../../utils");

module.exports = (req, res) => {
  if (!req.query.refresh_token && !req.body.refresh_token)
    res.status(400).json({ error: "Missing refresh token" });
  else {
    auth_service
      .verifyRefreshToken(req.query.refresh_token || req.body.refresh_token)
      .then((user) => {
        signJWT(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET
        )
          .then((token) => res.json(token))
          .catch((err) => res.status(500).json(err.message));
      })
      .catch((err) => {
        res.status(401).json(err.message);
      });
  }
};
