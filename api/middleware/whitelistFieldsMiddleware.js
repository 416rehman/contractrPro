// Removes all fields from the request body that are not in the fields array
// i.e if someone sends the following data to app.post('/comments', whitelistFieldsMiddleware(['content', 'attachments']), routeHandler)
// {
//     content: 'Hello world!',
//     attachments: ['file1.txt', 'file2.txt'],
//     username: 'johndoe',
// }
//
// The request body will be modified to:
// {
//     content: 'Hello world!',
//     attachments: ['file1.txt', 'file2.txt'],
// }
//
// This is useful for preventing users from sending data that they shouldn't be able to send

module.exports = (fields) => {
    return (req, res, next) => {
        const body = req.body;
        const data = {};

        fields.forEach(field => {
            if (body[field]) {
                data[field] = body[field];
            }
        });

        req.body = data;

        next();
    }
}
