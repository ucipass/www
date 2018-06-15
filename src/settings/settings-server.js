
/************************************************************************
Replies to echo messages valid request:
{
	"data":
	{
		"id":"test",
		"type":"test",
		"attributes":{
			"cmd":"echo"
		}		
	}
}
*************************************************************************/
var name = "settings"
var path     = require("path")
var appRoot = require('app-root-path').path
var dirHTML  = path.join( appRoot, "dist",name)
var dirBIN   = path.join( appRoot, "bin")
var fileConfig   = path.join( appRoot, "config", "default.json")
var log      = require("ucipass-logger")(name)
var JSONData = require( path.join(dirBIN, "jsondata.js"))
var ioData = new JSONData();
var express = require('express');
var router = express.Router();
var File = require("ucipass-file")
var flatten = require("flat")
var unflatten = require("flat").unflatten

router.get( '/'  , (req,res)=>{ res.sendFile(path.join(dirHTML,'index.html'))})
router.post("/", settings); 

function settings(req, res) {	// All data is posted here with the exception if login

	if (req.body.data){
		ioData.setjson(req.body);
		log.info("RECV:",ioData.id(),ioData.att().cmd);
		log.debug("RECV ATT:",ioData.att());
	}
	else{
		log.error("POST INVALID: ",req.body);
		res.end("INVALID POST received by Nodejs!\n");
		return;
	}
	if (ioData.cmd() === "loadSettings") {
		let file = new File(fileConfig)
		file.readString()
		.then((s)=>{
			ioData.json.error = null;
			ioData.json.data.type = ioData.json.data.type+'-reply';
			let json = JSON.parse(s)
			let jsonflat = flatten(json)
			ioData.json.data.attributes.form = JSON.stringify(jsonflat);
			log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
			res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
		})
		.catch((e)=>{
			let form ={"error" : "error reading config file"}
			log.error("ERROR READING CONFIG FILE:",fileConfig)
			ioData.json.error = "ERROR READING CONFIG FILE:";
			ioData.json.data.type = ioData.json.data.type+'-error';
			log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
			res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
		})	
	}
	else if (ioData.cmd() === "saveSettings") {
		ioData.json.error = null;
		ioData.json.data.type = ioData.json.data.type+'-reply';
		let form =ioData.json.data.attributes.form
		let json = JSON.parse(form)
		let settings = unflatten(json)
		let file = new File(fileConfig)
		file.read()
		.then(()=>{	
			var now = new Date();
			var dt = now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDate()+ "-" + now.getHours()+ "-" + now.getMinutes()+ "-" + now.getSeconds()
			var filename = fileConfig + "_" + dt +'.txt'	
			return file.write( filename ) //making a backup
		})
		.then(()=>{
			return file.writeString(JSON.stringify(settings, null, 2)) // writing the new
		})
		.then(()=>{
			log.debug("Settings",settings)
			log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
			res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
			return true
		})
		.catch((e)=>{
			let form ={"error" : "error writing config file"}
			log.error("ERROR READING CONFIG FILE:",fileConfig,e)
			ioData.json.error = "ERROR READING CONFIG FILE:";
			ioData.json.data.type = ioData.json.data.type+'-error';
			log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
			res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
		})	
	}
	else {
		ioData.json.error = "no matching command";
		ioData.json.data.type = ioData.json.data.type+'-nomatch';
		ioData.json.data.attributes.data = null;
		log.error('SEND:', ioData.type(),'ID:',ioData.id()+" ATT:"+ ioData.attributes());
		res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
		return;	
	}

}

module.exports = router;
