
/************************************************************************
Replies to log messages valid request:
{
	"data":
	{
		"id":"test",
		"type":"test",
		"attributes":{
			"cmd":"log",
			"data":1
		}		
	}
}
*************************************************************************/
var name = "charts"
var path     = require("path")
var dirHTML  = path.join( require('app-root-path').path, "dist",name)
var dirBIN   = path.join( require('app-root-path').path, "bin")
var log      = require( path.join( dirBIN,"logger.js"  ))("chart")
var JSONData = require( path.join( dirBIN,'jsondata.js'));
var ioData = new JSONData();
var express = require('express');
var router = express.Router();
const Datalog = require('ucipass-chart')
var moment = require("moment")
var appRoot = require("app-root-path").path

let logname = "sensor"
let logdir = path.join (appRoot,"log")
let zipfile = path.join(appRoot,"datalog.zip")
let logSec = new Datalog({logdir:logdir,format:"seconds",name:logname+"_seconds",logEnabled:false})
let logMin = new Datalog({logdir:logdir,format:"minutes",name:logname+"_minutes"})
let logHour = new Datalog({logdir:logdir,format:"hours",name:logname+"_hours"})
let logDay = new Datalog({logdir:logdir,format:"days",name:logname+"_days"})
let logWeek = new Datalog({logdir:logdir,format:"weeks",name:logname+"_weeks"});
let logPromise = (async ()=>{
	await logMin.readFileLog()
	await logHour.readFileLog()
	await logDay.readFileLog()
	await logWeek.readFileLog()
	return true
})().catch((e)=>{console.log(e);return true});

router.get( '/'  , (req,res)=>{ res.sendFile(path.join(dirHTML,'index.html'))})

router.post("/", charts); 

function charts(req, res) {	// All data is posted here with the exception if login

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
	if (ioData.cmd() === "log") {
		log.info(ioData.att().data)
		let value = parseFloat(ioData.att().data)
		logSec.log(value)
		logMin.log(value)
		logHour.log(value)
		logDay.log(value)
		logWeek.log(value)
		ioData.json.error = null;
		ioData.json.data.type = ioData.json.data.type+'-reply';
		ioData.json.data.attributes.msg = "This is a reply message from the server";
		log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
		res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
	}
	else if (ioData.cmd() === "getdata") {
		let msg = {name:logname}
		log.info("GET DATA REQ",ioData.json.data)
		msg.sec = logSec.readMemLog()
		msg.min = logMin.readMemLog()
		msg.hour = logHour.readMemLog()
		msg.day = logDay.readMemLog()
		msg.week = logWeek.readMemLog()
		ioData.json.data.attributes.data = msg;
		ioData.json.data.type = ioData.json.data.type+'-reply';
		ioData.json.error = null;
		log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
		res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
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
