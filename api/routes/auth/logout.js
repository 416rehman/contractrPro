// Clears the cookie if it exists
module.exports = function logout(req, res) {
  try {
    res.clearCookie("cpAccessToken");
    return res.status(200).json({ message: "Cookie cleared successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};