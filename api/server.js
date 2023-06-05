/**
 * Model: https://www.figma.com/file/oXjOLhFELvDrGkTz8BIJUI/Untitled
 */

require('dotenv').config();
const cors = require('cors');
const express = require('express'),
      
routes = require('./routes'),
{sequelize} = require('./models')
const helmet = require('helmet')
const cookieSession = require('cookie-session')
const {tokenAuthHandler} = require("./middleware/auth-middleware");
const port = process.env.PORT || 3000
const app = express()

const expiryDate = new Date(Date.now() + 60 * 60 * 1000)


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(helmet())

app.disable('x-powered-by')

app.use(cookieSession({
    name: 'contractrPro',
    keys: [process.env.SECRET_SESSION_KEY_1, process.env.SECRET_SESSION_KEY_2],
    cookie: {
        secure: true,
        httpOnly: true,
        domain: 'contractr.pro',
        expires: expiryDate,
    }
}))

// Use logging middleware
const logger = require('./logger');
const pino = require('pino-http')({
  // Use our default logger instance, which is already configured
  logger,
});
app.use(pino);

app.use((req, res, next) => {
  const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0];
  res.set('Router', path);
  next();
});

app.get('/', (req, res) => {
  res.send('Connected!');
});

app.use('/auth', routes.auth);
app.use(tokenAuthHandler); // security middleware, uses tokenAuthHandler to authenticate via access tokens in the authorization header
app.use('/users/', routes.user);
app.use('/organizations/', routes.organization);

app.use((req, res, next) => {
    res.status(404).send("Cannot find this route.")
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send("An unexpected problem has occured.")
})

sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`listening at http://localhost:${port}/`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
