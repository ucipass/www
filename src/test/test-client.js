import * as sio from '../sioclient.js';
import * as navbar from '../navbar.js';
import JSONData from '../jsondata.js'
import * as moment from "moment"

window.onload = async function(){
  let alreadyLoggedIn = await sio.init(window.location.hostname+":"+window.location.port)
  navbar.setup(alreadyLoggedIn)
  let format = ("h:mm:ss.SSS A")

  setInterval(async()=>{
    let start = moment()
    let msg = await restecho("REST TEST")
    let end = moment()
    let delay = moment.duration(end.diff(start)).asMilliseconds()
    document.getElementById("rest-delay").innerHTML = delay
    document.getElementById("rest-sent").innerHTML = start.format(format)
    document.getElementById("rest-received").innerHTML = end.format(format)
  },1000)

  setInterval(async()=>{
    let start = moment()
    let msg = await sioecho("SIO TEST")
    let end = moment()
    let delay = moment.duration(end.diff(start)).asMilliseconds()
    document.getElementById("sio-delay").innerHTML = delay
    document.getElementById("sio-sent").innerHTML = start.format(format)
    document.getElementById("sio-received").innerHTML = end.format(format)
  },1000)

}

async function restecho(msg){
  return new Promise((resolve,reject)=>{
    var ioData = new JSONData("test","test",{cmd:"echo"});
    //console.log("Sent REST ECHO REPLY")
    ioData.post(function(msg){
      //console.log("Received REST ECHO REPLY")
      resolve(msg)
    })
  })
}

async function sioecho(msg){
  return new Promise((resolve,reject)=>{
    //console.log("Sent SIO ECHO REPLY")
    sio.socket.emit('echo', msg, (reply)=>{
      //console.log("Received SIO ECHO REPLY")
      resolve(msg)
    });
  })
}

