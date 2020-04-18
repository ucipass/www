"use strict";
var log = require("ucipass-logger")("mongooseclient")
log.transports.console.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info"
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true);
const DATABASE_URL      = process.env.DATABASE_URL ? process.env.DATABASE_URL : "mongodb://localhost:27017/rp"
const DATABASE_USERNAME = process.env.DATABASE_USERNAME ? process.env.DATABASE_USERNAME : "admin"
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ? process.env.DATABASE_USERNAME : "admin"
log.info("path:", DATABASE_URL)

const CollectionUsers = 'Users'

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    expiration: { type: Date, required: true, default: Date.now },
});


let options ={
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 3000,
    useNewUrlParser: true,
    useFindAndModify: false,
    user: DATABASE_USERNAME,
    pass: DATABASE_PASSWORD,                  
    auth:{
        authSource: 'admin'                    
    }
}


module.exports = function(){
    log.debug("Connecting to:", DATABASE_URL)
    const connection  = mongoose.createConnection( DATABASE_URL, options)
    const User = connection.model( CollectionUsers, UserSchema)

    connection.getUser = async (username)=>{
        let json = await User.findOne({ "username" : username}).lean(true)
        if(json) delete json._id
        if(json) delete json.__v  
        return json       
    }
    connection.getUsers = async ()=>{
        let reply = await User.find({}).lean(true)
        reply = reply.map(json => {
            if(json) delete json._id
            if(json) delete json.__v
            return json
        })
        return reply       
    }
    connection.deleteUser = async (username)=>{
        if(username && username.username){
            return User.deleteOne({ username : username.username}) 
        }
        else{
            return User.deleteOne({ username : username}) 
        }
                        
    }
    connection.updateUser = async (user)=>{
        var query = { username: user.username };
        let newclientobj = await User.findOneAndUpdate(query, user)
        return newclientobj;            
    }
    connection.createUser = async (username,password)=>{
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
                let doc = new User (username)
                return doc.save()              
                }
            else{
                let doc = new User ({username: username, password: password})
                return doc.save()
                }            
        })                

    }

    return connection
}

