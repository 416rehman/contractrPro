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
const checkAuth = require("./middleware/auth-middleware");

const s3Client = new S3Client({
    region: "ca-central-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_ACCESS_SECRET,
    }
});

const port = process.env.PORT || 3000
const app = express()

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(multer({
    limits: {
        fileSize: 10 * 1024 * 1024, // limit filesize
    }
}).array("attachments", 10)); // a comment can have up to 10 attachments

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
app.use(checkAuth)   // authentication middleware
app.use('/users/', routes.user)
app.use('/organizations/', routes.organization)

// TODO: Move this so this is part of each resource, i.e /users/:id/comments, /users/:id/organizations, etc.
app.post('/comments', async (req, res) => {
    const commentContent = req.body.content;
    const commentAttachments = req.files || [];
    const commentUsername = req.auth.username;
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
        username: commentUsername,
        filesUploaded: filesUploaded,
    });
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        return sequelize.sync();
    })
    .then(() => {
        console.log('Synced successfully.');
        return app.listen(port);
    })
    .then(() => {
        console.log(`listening at http://localhost:${port}/`);
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

