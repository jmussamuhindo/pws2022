const ajv = require('ajv')
const ajvFormats = require('ajv-formats')

const db = require('./db')

const dataConfig = module.exports = {

    persons: {
        aggregation: [
            { $project: { password: false } },
            { $sort: { firstName: 1, lastName: 1  } }
        ],
        filtering: (filter) => { return {
            $match: { $or: [
                { firstName: { $regex: '.*' + filter + '.*', $options: 'i' }},
                { lastName: { $regex: '.*' + filter + '.*', $options: 'i' }}
            ]}}
        },
        schema: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              yearOfBirth: { type: 'integer' },
              email: { type: 'string', format: 'email' }
            },
            required: [ 'firstName', 'lastName', 'yearOfBirth' ],
            additionalProperties: false
        },
        prepareData: (body) => {
            initValidator('persons')
            if(!dataConfig.persons._validate(body)) return { error: 'data does not match the person schema' }

            if(body.yearOfBirth < 100) {
                body.yearOfBirth = 1900 + body.yearOfBirth
            }
            return null
        }
    },

    projects: {
        aggregation: [
            { $sort: { name: 1 } },
            { $lookup: { from: "persons", localField: "manager", foreignField: "_id", as: "manager" } },
            { $unwind: { path: "$manager", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "persons", localField: "members", foreignField: "_id", as: "members" } },
            { $project: { "manager.password": false } }
          ],
          filtering: (filter) => {
            return { $match: 
                { name: { $regex: '.*' + filter + '.*', $options: 'i' }}
            }
        },
        schema: {
            type: 'object',
            properties: {
              name: { type: 'string' }
            },
            required: [ 'name' ],
            additionalProperties: true
        },
        prepareData: (body) => {
            initValidator('projects')
            if(!dataConfig.projects._validate(body)) return { error: 'data does not match the project schema' }
            try {
                if(body.manager) body.manager = db.ObjectId(body.manager)
                body.members.forEach(function(el, index, arr) {
                    arr[index] = db.ObjectId(el)
                })
            } catch(ex) {
                return { error: 'data does not include proper _ids' }
            }
            return null
        }
    },

    tasks: {
        aggregation: [
            { $sort: { name: 1  } }
            //{ $sort: { creationTime: -1 } }
        ],
        filtering: (filter) => {
            let newFilter = {}
            try {
                newFilter = JSON.parse(filter)
                 
            } 
            catch(ex) { newFilter = {} }    
            return { 
                $match: { 
                    $or: [
                        {
                          project: newFilter.project ? db.ObjectId(newFilter.project) : null,
                          $or: [
                            {name: { $regex: '.*' + newFilter.name + '.*', $options: 'i' }},
                            {firstName: { $regex: '.*' + newFilter.firstName + '.*', $options: 'i' }},
                            {lastName: { $regex: '.*' + newFilter.lastName + '.*', $options: 'i' }},
                          ],
                          status: { $regex: '.*' + newFilter.status + '.*', $options: 'i' },
                        },
                        {
                            $or: [
                                {name: { $regex: '.*' + newFilter.name + '.*', $options: 'i' }},
                                {firstName: { $regex: '.*' + newFilter.firstName + '.*', $options: 'i' }},
                                {lastName: { $regex: '.*' + newFilter.lastName + '.*', $options: 'i' }},
                              ],
                            status: { $regex: '.*' + newFilter.status + '.*', $options: 'i' },
                            category: newFilter.category,
                        }
                      ],
                } 
            } 
            
            
        },
        prepareData: (body) => {
            initValidator('tasks')
            try {
                if(body.project) body.project = db.ObjectId(body.project)
                if(body.category) body.category = body.category
                if(body.creationTime) body.creationTime = Date.now()
                if(body.responsible) body.responsible = db.ObjectId(body.responsible)
                if(body.done) body.done = body.done
            } catch(ex) {
                return { error: 'task does not include a proper project id' }
            }
            return null
        }
   },
}

let _ajv = null

const initValidator = (collectionName) => {
    if(!_ajv) {
        _ajv = new ajv()
        ajvFormats(_ajv)
    }
    if(collectionName && !dataConfig[collectionName]._validate && dataConfig[collectionName].schema) {
        dataConfig[collectionName]._validate = _ajv.compile(dataConfig[collectionName].schema)
    }
}