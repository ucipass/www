
/************************************************************************
Replies to valid JSON requests:
{	"data": // LOG
	{
		"id":"test",
		"type":"test",
		"attributes":{
			"cmd":"log",
			"name":"mylog",
			"data":1
		}
	}
}
*************************************************************************/
const appRoot = require('app-root-path').path
const MODULE_NAME = "charts"
const DEBUG_LEVEL = "error"
const fs = require('fs');
const path     = require("path")
const dirHTML  = path.join( appRoot , "dist" , MODULE_NAME)
const dirBIN   = path.join( appRoot , "bin")
const dirLog   = path.join( appRoot , "log")
const router = require('express').Router();
const moment = require("moment")
const winston = require('winston')
const JSONData = require( path.join( dirBIN,'jsondata.js'));
const Datalog = require('ucipass-chart')
const {promisify} = require('util');
const readdirAsync = promisify(fs.readdir);
const log = new (winston.Logger)({transports: [ new (winston.transports.Console)({level:DEBUG_LEVEL}) ]});
const logList = []  // Array of all logs tracked

router.get( '/'  , (req,res)=>{ res.sendFile(path.join(dirHTML,'index.html'))})

router.post("/", charts); 

function charts(req, res) {	// All data is posted here with the exception if login
	let ioData = new JSONData();
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
		let logname = ioData.att().logname ? ioData.att().logname : "default"
		let value = parseFloat(ioData.att().data)
		let curLog = logList.find((item)=> item.logname == logname)
		if (curLog){
			curLog.logSec.log(value)
			curLog.logMin.log(value)
			curLog.logHour.log(value)
			curLog.logDay.log(value)
			curLog.logWeek.log(value)
		}else{
			let newLog = {logname:logname}
			newLog.logSec = new Datalog({logdir:dirLog,format:"seconds",name:logname,logEnabled:false})
			newLog.logMin = new Datalog({logdir:dirLog,format:"minutes",name:logname})
			newLog.logHour = new Datalog({logdir:dirLog,format:"hours",name:logname})
			newLog.logDay = new Datalog({logdir:dirLog,format:"days",name:logname})
			newLog.logWeek = new Datalog({logdir:dirLog,format:"weeks",name:logname});
			curLog = newLog
			logList.push(curLog)
		}
		ioData.json.error = null;
		ioData.json.data.type = ioData.json.data.type+'-reply';
		ioData.json.data.attributes.msg = "This is a reply message from the server";
		log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
		res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
	}
	else if (ioData.cmd() === "getdata") {
		log.debug("CHART: Start GETDATA", new Date())
		let logname = ioData.att().logname ? ioData.att().logname : "default"
		let curLog = logList.find((item)=> item.logname == logname)
		let msg = {logname:logname}
		if (curLog){
			msg.sec = curLog.logSec.readMemLog()
			msg.min = curLog.logMin.readMemLog()
			msg.hour = curLog.logHour.readMemLog()
			msg.day = curLog.logDay.readMemLog()
			msg.week = curLog.logWeek.readMemLog()
			log.debug("CHART: Finish all memory read", new Date())
			ioData.json.data.attributes.data = msg;
			ioData.json.data.type = ioData.json.data.type+'-reply';
			ioData.json.error = null;
			log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
			res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
			log.debug("CHART: Finish Send", new Date())
		}else{
			let newLog = {logname:logname}
			log.debug("CHART: Start Object Init for",logname, new Date())
			newLog.logSec = new Datalog({logdir:dirLog,format:"seconds",name:logname,logEnabled:false})
			newLog.logMin = new Datalog({logdir:dirLog,format:"minutes",name:logname})
			newLog.logHour = new Datalog({logdir:dirLog,format:"hours",name:logname})
			newLog.logDay = new Datalog({logdir:dirLog,format:"days",name:logname})
			newLog.logWeek = new Datalog({logdir:dirLog,format:"weeks",name:logname});
			newLog.logMin.init()
			.then( ()=>newLog.logHour.init())
			.then( ()=>newLog.logDay.init())
			.then( ()=>newLog.logWeek.init())
			.then( ()=>{
				log.debug("CHART: Finish Object Init for",logname, new Date())
				curLog = newLog
				logList.push(curLog)
			})
			//Promise.all([newLog.logSec.init(),newLog.logMin.init(),newLog.logHour.init(),newLog.logDay.init(),newLog.logWeek.init()])
			.then(()=>{
				log.debug("CHART: Finish all promises", new Date())
				let msg = {name:logname}
				log.info("GET DATA REQ",ioData.json.data)
				msg.sec = newLog.logSec.readMemLog()
				msg.min = newLog.logMin.readMemLog()
				msg.hour = newLog.logHour.readMemLog()
				msg.day = newLog.logDay.readMemLog()
				msg.week = newLog.logWeek.readMemLog()
				log.debug("CHART: Finish all memory read", new Date())
				ioData.json.data.attributes.data = msg;
				ioData.json.data.type = ioData.json.data.type+'-reply';
				ioData.json.error = null;
				log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
				res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
				log.debug("CHART: Finish Send", new Date())
			})
			.catch((e)=>{
				console.log("CHART ERROR",e)
			})
		}
	}
	else if (ioData.cmd() === "getcharts") {
		log.info("GET DATA REQ",ioData.json.data);
		(async()=>{
			let dirlist = await readdirAsync(dirLog)
			let loglist = dirlist
			.filter( (item)=> item.startsWith("datalog_") )  //filter just with datalog
			.map(    (item)=> item.split("_")[1] )			 // get lognames
			.filter( (item, index, self)=> index == self.indexOf(item) ) // filter duplicates
			.map(    (item)=> {return { text: item, id: item } })	// format for select2	
			ioData.json.data.attributes.data = loglist;
			ioData.json.data.type = ioData.json.data.type+'-reply';
			ioData.json.error = null;
			log.info('SEND:', ioData.id(),  ioData.cmd(), "reply");
			res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT				
		})();
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
