var io = require('socket.io-client')
var socket = io.connect('http://localhost:3000', {reconnect: true});
var json = {
	"data":
	{
		"id":"test",
		"type":"test",
		"attributes":{
			"cmd":"log",
			"data":4
		}		
	}
}


socket.on('connect', function () { 
    console.log("socket connected"); 
    sioLoop()
});

function sioLoop(){
    setInterval(()=>{
        var random = Math.floor(Math.random()*10);
        json.data.attributes.data = random
        console.log("Chart log sent:",random)
        socket.emit('charts', json, (msg)=>{
            //console.log("Received reply:",msg,new Date().toISOString())
            console.l0g("Charts reply received")
        });
    },1000)
}
