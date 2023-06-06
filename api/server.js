/**
 * Model: https://www.figma.com/file/oXjOLhFELvDrGkTz8BIJUI/Untitled
 */

require('dotenv').config()
const cors = require('cors');
const express = require('express');
const multer = require("multer");
const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");

const routes = require('./routes');
const {sequelize} = require('./models');
const {tokenAuthHandler} = require("./middleware/auth-middleware");

const s3Client = new S3Client({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_SECRET,
    region: "us-east-1",
});

const port = process.env.PORT || 3000
const app = express()

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(multer().array("attachments", 10)); // a comment can have up to 10 attachments

// if development.
if (process.env.NODE_ENV === 'development') {
    // middleware to see the router path in the "Router" header for debugging
    app.use((req, res, next) => {
        const path = (__filename.split('/').slice(-1)[0]).split('\\').slice(-1)[0]
        res.set('Router', path)
        next()
    })
}

app.get('/', (req, res) => {
    res.send('Connected!')
})

app.use('/auth', routes.auth)
app.use(tokenAuthHandler)   // security middleware, uses tokenAuthHandler to authenticate via access tokens in the authorization header
app.use('/users/', routes.user)
app.use('/organizations/', routes.organization)

// TODO: Move this so this is part of each resource, i.e /users/:id/comments, /users/:id/organizations, etc.
app.post('/comments', async (req, res) => {
    const commentContent = req.body.content;
    const commentAttachments = req.files;
    const commentUserId = req.auth.id;

    let filesUploaded = 0;
    for (const attachment of commentAttachments) {
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: attachment.originalname,
            Body: attachment.buffer,
        };

        try {
            await s3Client.send(new PutObjectCommand(uploadParams));
            filesUploaded++;
        } catch (err) {
            console.log(err);
        }
    }

    res.json({
        content: commentContent,
        attachments: commentAttachments.map(attachment => attachment.originalname),
        userId: commentUserId,
        filesUploaded: filesUploaded,
    });
});

sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`listening at http://localhost:${port}/`)
    })
}).catch(err => {
    console.log(err)
})
