module.exports = (req, res) => {
    res.json({
        file: __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0],
        message: 'TODO',
    })
}
