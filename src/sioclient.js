import io from 'socket.io-client';
import axios from 'axios'
import * as moment from 'moment' ;
var socket = null;
async function init(url){
    let resolve,reject
    let p = new Promise((res,rej)=>{resolve = res; reject = rej})
    let lastSocketID = null
    socket = io.connect(url, {reconnect: true});
    socket.on('connect', async function () {
        let authenticated = await checkLogin()
        console.log("socket.io auth status", authenticated ? true :false , lastSocketID=socket.id);
        if (document && document.body){
            document.body.setAttribute("data-sio", "connected");
        }
        resolve(authenticated)
    });
    socket.on('disconnect', function () { 
        console.log("socket.io client disconnected", lastSocketID);
        if (document && document.body){ 
            document.body.setAttribute("data-sio", "disconnected");
        }
    });
    //postauth("test","test")
    return p
}

async function echo(msg){
    return new Promise((resolve,reject)=>{
        msg = msg ? msg : "echo"
        console.log("Sent SIO Echo with message:",msg,"on:",new Date().toISOString())
        let start = moment()
        socket.emit('echo', msg, (reply)=>{
            console.log("Received SIO Echo reply message:",reply,"on:",new Date().toISOString())
            let end = moment()
            let delay = moment.duration(end.diff(start)).asMilliseconds()
            resolve({reply:reply, delay:delay, start:start.format("h:mm:ss.SSS A"), end:end.format("h:mm:ss.SSS A") })
        });
    })
}

async function login(username,password){
    let resolve,reject
    let p = new Promise((res,rej)=>{resolve = res; reject = rej})
    /*
    socket.emit('auth', {username:username,password:password}, (reply)=>{
        if (reply){
            console.log("Authentication Successful!",new Date().toISOString())
            resolve(true)
        }else{
            console.log("Authentication Failed!",new Date().toISOString())
            resolve(false)
        }
    });
    */
    axios.post('/login', {
        username: username,
        password: password
    },{withCredentials: false})
    .then(function (response) {
        let rurl = response.request.responseURL
        if (rurl.startsWith(document.location.origin+"/login")){
            console.log("Authentication Failure!",new Date().toISOString())
            resolve(false)
        }else{
            console.log("Authentication Successful!",new Date().toISOString())
            resolve(true)
        }
    })
    .catch(function (error) {
        console.log(error);
        console.log("Authentication Failed!",new Date().toISOString())
        resolve(false)
    }); 
    return p
    
}

async function logout(username,password){
    let resolve,reject
    let p = new Promise((res,rej)=>{resolve = res; reject = rej})
    axios.post('/logout', {
        username: username,
        password: password
    },{withCredentials: false})
    .then(function (response) {
        let rurl = response.request.responseURL
        if (! rurl.startsWith(document.location.origin+"/login")){
            console.log("Logout Failure!",new Date().toISOString())
            resolve(false)
        }else{
            console.log("Logout Successful!",new Date().toISOString())
            resolve(true)
        }
    })
    .catch(function (error) {
        console.log(error);
        console.log("Logout Failed!",new Date().toISOString())
        resolve(false)
    }); 
    return p
}

async function checkLogin(){
    let resolve,reject
    let p = new Promise((res,rej)=>{resolve=res;reject=rej})
    socket.emit('auth', { cookie: true}, (msg)=>{
        //console.log("Socket.io authenticated:",msg)
        resolve(msg)
    });
    return p
}

function postauth(username,password){
    return axios.post('/login', {
        username: username,
        password: password
      },{withCredentials: false})
      .then(function (response) {
        console.log("COOKIE",document.cookie);
      })
      .catch(function (error) {
        console.log(error);
      });    
}
export { init, login, logout, checkLogin, echo, socket}