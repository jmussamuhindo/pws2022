const fs = require('fs')

const express = require('express')
const morgan = require('morgan')
const expressSession = require('express-session')
const bodyParser = require('body-parser')
const passport = require('passport')
const passportJson = require('passport-json')

const db = require('./db')
const auth = require('./auth')
const rest = require('./rest')

// config
let config = {}
try {
    config = JSON.parse(fs.readFileSync('config.json'))
} catch(ex) {
    console.error('Cannot read configuration!', ex.message)
    process.exit(0)
}

// express initialization
const app = express()
app.use(morgan('tiny'))

// source of static content
app.use(express.static('frontend'))

// extra modules for express
app.use(bodyParser.json())

// authorization middleware
app.use(expressSession({ secret: config.appName, resave: false , saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportJson.Strategy(auth.checkCredentials))
passport.serializeUser(auth.serialize)
passport.deserializeUser(auth.deserialize)

// authentication endpoints
app.get('/auth', auth.whoami)
app.post('/auth', passport.authenticate('json', { failWithError: true }), auth.login, auth.errorHandler)
app.delete('/auth', auth.logout)

// handle errors on body parser
app.use((err, req, res, nextTick) => {
    if(err) {
        res.status(400).json({ error: err.type })
    } else {
        nextTick()
    }
})

// special endpoint for data
app.all('/api/:collection', auth.checkAuthenticated, rest)

// main process
db.init(config, () => {
    app.listen(config.port)        
    console.log('Backend is listening on port', config.port)
})