module.exports.comment = (sequelize, DataTypes) => {
    return sequelize.define("Comment", {
        comment_text: DataTypes.STRING(1024),
        attachments: DataTypes.STRING(512),
        created_by: DataTypes.INTEGER(),
    });
}