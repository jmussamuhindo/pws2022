const db = require('./db')

const auth = module.exports = {
    checkCredentials: (username, password, nextTick) => {
        db.authData.findOne({ email: username, password: password }, (err, user) => {
            if(err || !user) {
                return nextTick(null, false)
            } else {
                return nextTick(null, user)
            }
        })
    },
    checkAuthenticated: (req, res, nextTick) => {
        if(req.isAuthenticated()) return nextTick()
        res.status(401).json({ error: 'not authorized' })
    },
    serialize: (user, nextTick) => { nextTick(null, user.email) },
    deserialize: (username, nextTick) => {
        db.authData.findOne({ email: username }, (err, user) => {
            if(err || !user) {
                nextTick('No such user', null)
            } else {
                nextTick(null, user)
            }
        })
    },
    login: (req, res) => {
        auth.whoami(req, res)
    },
    logout: (req, res) => {
        req.logout(() => {
            res.json({ username: null })        
        })
    },
    whoami: (req, res) => {
        if(req.user) {
            res.json({ username: req.user.email, _id: req.user._id })
        } else {
            res.json({ username: null })
        }
    },
    errorHandler: (err, req, res, nextTick) => {
        res.json({ error: err.message })
    }
}