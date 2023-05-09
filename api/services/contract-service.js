module.exports.ping = function (req, res) {
    res.status(200).json({ message: 'Contract Working!' });
}