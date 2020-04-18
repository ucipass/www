const log = require("ucipass-logger")("setup")
log.transports.console.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "debug"
const mongooseclient = require("./mongooseclient.js")
const DATABASE_USERNAME = process.env.DATABASE_USERNAME ? process.env.DATABASE_USERNAME : "admin"
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ? process.env.DATABASE_USERNAME : "admin"
let dbcon = null


// CHECK IF ADMIN USER EXISTS IF NOT CREATE admin/admin
async function adminUserCheck(){
    

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
    dbcon = await mongooseclient()

    return adminUserCheck()
    .then(() => dbcon.close() )
    .then(() => {
        log.debug("Setup success!")
    })
    .catch( error => {
        log.debug("Setup error:",error)
        return Promise.reject(error)
    })


}