"use strict";
var log = require("ucipass-logger")("mongooseclient")
log.transports.console.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info"
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true);
const DATABASE_URL      = process.env.DATABASE_URL ? process.env.DATABASE_URL : "mongodb://localhost:27017/rp"
const DATABASE_USERNAME = process.env.DATABASE_USERNAME ? process.env.DATABASE_USERNAME : "admin"
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ? process.env.DATABASE_USERNAME : "admin"

const CollectionWebusers = 'Webusers'

const WebuserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    expiration: { type: Date, required: true, default: Date.now },
});


let options ={
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    user: DATABASE_USERNAME,
    pass: DATABASE_PASSWORD,                  
    auth:{
        authSource: 'admin'                    
    }
}

// CHECK IF ADMIN USER EXISTS IF NOT CREATE admin/admin
async function adminUserCheck(){
    const connection  = mongoose.createConnection( DATABASE_URL, options);
    const Webuser = connection.model( CollectionWebusers, WebuserSchema)
    Webuser.findOne({ "username" : "admin" })
    .then((user)=>{
        if(user){
            return true
        }else{
            let doc = new Webuser ({username: "admin", password: "admin"})
            log.info("Creating new admin user account!")
            return doc.save()  
        }
    })
    .then(()=>{
        return connection.close()
    })
    .catch((error)=>{
        log.error("Mongo DB error with admin user id",error)
    })    
}
adminUserCheck()

module.exports = function(){
    log.info("Connecting to:", DATABASE_URL)
    const connection  = mongoose.createConnection( DATABASE_URL, options);
    const Webuser = connection.model( CollectionWebusers, WebuserSchema)



    connection.getWebuser = async (username)=>{
        let reply = await Webuser.findOne({ "username" : username})  
        return reply       
    }
    connection.getWebusers = async ()=>{
        let reply = await Webuser.find({})  
        return reply       
    }
    connection.deleteWebuser = async (username)=>{
        if(username && username.username){
            return Webuser.deleteOne({ username : username.username}) 
        }
        else{
            return Webuser.deleteOne({ username : username}) 
        }
                        
    }
    connection.updateWebuser = async (webuser)=>{
        var query = { username: webuser.username };
        let newclientobj = await Webuser.findOneAndUpdate(query, webuser)
        return newclientobj;            
    }
    connection.createWebuser = async (username,password)=>{
        return new Promise((resolve, reject) => {
            require('crypto').randomBytes(24, function(err, buffer) {
                if(err){
                    return(reject(err))
                }else{
                    return(resolve(buffer.toString('hex')))
                }
            });            
        })
        .then((token)=>{
            if(username && username.username){
                let doc = new Webuser (username)
                return doc.save()              
                }
            else{
                let doc = new Webuser ({username: username, password: password})
                return doc.save()
                }            
        })                

    }

    return connection
}

