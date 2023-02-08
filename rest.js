const db = require('./db')
const dataConfig = require('./dataConfig')

const getAggregation = (collectionName) => {
    if(dataConfig[collectionName] && dataConfig[collectionName].aggregation) {
        return dataConfig[collectionName].aggregation
    }
    return []
}

const getFiltering = (collectionName, filter) => {
    if(dataConfig[collectionName] && dataConfig[collectionName].filtering) {
        return dataConfig[collectionName].filtering(filter)
    }
    return null
}

const alterInputData = (collectionName, body) => {
    if(dataConfig[collectionName] && dataConfig[collectionName].prepareData) {
        let err = dataConfig[collectionName].prepareData(body)
        return err
    }
    return null
}

module.exports = (req, res) => {
    let collectionName = req.params.collection
    let collection = db.connection.collection(collectionName)
    let _id = null
    try { 
        _id = req.query._id ? db.ObjectId(req.query._id) : null
    } catch(ex) {}
    let err = null, aggr = []
    switch(req.method) {
        case 'GET':
            aggr.length = 0
            if(_id) {
                aggr.push({ $match: { _id }})
            }

            aggr = aggr.concat(getAggregation(collectionName))

            let filter = req.query.filter
            let matching = null
            if(filter) {
                matching = getFiltering(collectionName, filter)
                if(matching) aggr.push(matching)
            }

            let limit = req.query.limit
            if(limit) {
                limit = parseInt(limit)
                if(limit > 0) {
                    aggr.push({ $limit: limit })
                }
            }

            let facet = {
                all: [ { $count: 'count' }],
                filtered: filter ? [ matching, { $count: 'count' } ] : [ { $count: 'count' } ],
                records: aggr
            }

            collection.aggregate([
                { $facet: facet },
                { $unwind: { path: '$all', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$filtered', preserveNullAndEmptyArrays: true } }
            ]).toArray((err, data) => {
                if(!err) {
                    res.json({
                        all: data.length > 0 && data[0].all ? data[0].all.count : 0,
                        filtered: data.length > 0 && data[0].filtered ? data[0].filtered.count : 0,
                        records: data.length > 0 && data[0].records ? data[0].records : []
                    })
                } else {
                    res.status(400).json({ error: 'Error retrieving data' })
                }
            })        
            break
        case 'POST':
            err = alterInputData(collectionName, req.body)
            if(err) {
                res.status(422).json(err)
                break
            }
            collection.insertOne(req.body, (err, data) => {
                if(!err) {
                    res.json(data)
                } else {
                    res.status(400).json({ error: 'Error inserting data' })
                }
            })
            break
        case 'PUT':
            err = alterInputData(collectionName, req.body)
            if(err) {
                res.status(422).json(err)
                break
            }
            collection.findOneAndUpdate({ _id: _id }, { $set: req.body }, { returnDocument: 'after' }, (err, data) => {
                if(!err) {
                    delete data.value
                    // without the code below the result contains complete data of updated object,
                    // maybe with sensible information
                    res.json(data)    
                } else {
                    res.status(400).json({ error: 'Error updating data' })                    
                }
            })
            break
        case 'DELETE':
            collection.deleteOne({ _id: _id }, (err, data) => {
                if(!err) {
                    res.json(data)
                } else {
                    res.status(400).json({ error: 'Error deleting data' })
                }
            })
            break
        default:
            res.status(405).json({ error: 'Method not implemented' })
            break
    }
}