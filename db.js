const mongodb = require('mongodb')

const db = module.exports = {
    init: (config, nextTick) => {
        mongodb.MongoClient.connect(config.dbUrl, { useUnifiedTopology: true }, (err, connection) => {
            if(err) {
                console.error('Connection to database cannot be established')
                process.exit(0)
            }
            db.connection = connection.db(config.dbName)
            db.authData = db.connection.collection('persons')
            console.log('Connection to database', config.dbName, 'established')
            nextTick()
        })
    },
    ObjectId: mongodb.ObjectId,
    connection: null,
    authData: null 
}