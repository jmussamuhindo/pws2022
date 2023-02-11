const fs = require('fs')
const fetch = require('node-fetch')

const db = require('./db')

// config
let config = {}
try {
    config = JSON.parse(fs.readFileSync('config.json'))
} catch(ex) {
    console.error('Cannot read configuration!', ex.message)
    process.exit(0)
}

const fetchUrl = async (url) => {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        return response.json()
    } catch (ex) {
        console.error('Unable to fetch data:', ex)
    }
}

const pickRandom = (list) => {
    return list[Math.floor(Math.random() * list.length)]
}

const generatePersons = (amount, nextTick) => {
    Promise.all([
        fetchUrl('https://www.randomlists.com/data/names-female.json'),
        fetchUrl('https://www.randomlists.com/data/names-male.json'),
        fetchUrl('https://www.randomlists.com/data/names-surnames.json')
    ]).then(([ females, males, surnames ]) => {
        let firstNames = females.data.concat(males.data)
        let lastNames = surnames.data

        let persons = []

        for(let i = 0; i < amount; i++) {
            const firstName = pickRandom(firstNames)
            const lastName = pickRandom(lastNames)
            const yearOfBirth = 1920 + Math.floor(80 * Math.random())
            const email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + '@pws2022.edu'  
            persons.push({ firstName, lastName, yearOfBirth, email })
        }

        nextTick(persons)
    })
}

db.init(config, () => {

    generatePersons(99, (persons) => {
        persons.unshift({
            firstName: 'Admin',
            lastName: 'Istrator',
            yearOfBirth: 2022,
            email: 'admin',
            password: 'admin'
        })
        db.connection.collection('persons').deleteMany((err, ok) => {
            db.connection.collection('persons').insertMany(persons, (err, ok) => {
                if(ok) {
                    console.log(persons.length, 'persons created')
                }
                process.exit(0)
            })
        })        
    })
})