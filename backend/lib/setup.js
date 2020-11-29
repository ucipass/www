const httpserver = require("./httpserver.js")
const express = require('express')
const cors = require('cors')
const log = require("ucipass-logger")("setup")
log.transports.console.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "debug"
const sleep = require('util').promisify(setTimeout)
const DATABASE_USERNAME = process.env.DATABASE_USERNAME ? process.env.DATABASE_USERNAME : "admin"
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ? process.env.DATABASE_USERNAME : "admin"
let dbcon = null



// Wait for database to come up and provide database connection
async function databaseCheck(){
    let waitForDataBase = true
    let timeout = 1 //seconds
    let maxTimeout = 600
    let dbcon

    const app = express()
    const whitelist = ['http://localhost:3000', 'http://localhost:8080'];
    const corsOptions = {
      credentials: true, // This is important.
      origin: (origin, callback) => {
        if(whitelist.includes(origin))
          return callback(null, true)
    
          callback(new Error('Not allowed by CORS'));
      }
    }    
    app.use(cors(corsOptions))
    const port = 3000
    app.all('*', (req, res) => { res.send('System is under maintenance...') })
    const server = new httpserver( {app:app, port:port})   
    await server.start()

    while (waitForDataBase) {
        try {
            let mongooseclient = require("./mongooseclient.js")
            dbcon = await mongooseclient()
            waitForDataBase = false
            log.info("Database connection success!")
        } catch (error) {
            log.error(`Database connection error! Waiting for ${timeout} seconds to retry...`)
            await sleep(timeout *1000)
            timeout = 2*timeout > maxTimeout ? maxTimeout : 2*timeout
        }
    }
    await server.stop()
    return dbcon
}

// CHECK IF ADMIN USER EXISTS IF NOT CREATE admin/admin
async function adminUserCheck(dbcon){

    return dbcon.getUser(DATABASE_USERNAME)
    .then( user => {
        if ( ! user ) {
            log.info(`creating database user ${DATABASE_USERNAME}`)
            return dbcon.createUser(DATABASE_USERNAME,DATABASE_PASSWORD)
        }
        else{
            return true
        }
    })
    .catch( error => {
        log.debug("adminUserCheck error:",error)
        return Promise.reject(error)
    })
}


module.exports = async function(){

     

    let dbcon = await databaseCheck()
    
    return adminUserCheck(dbcon)
    .then(() => dbcon.close() )
    .then(() => {
        log.debug("Setup success!")
    })
    .catch( error => {
        log.debug("Setup error:",error)
        return Promise.reject(error)
    })


}