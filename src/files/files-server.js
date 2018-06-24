
/************************************************************************
FILES MANAGEMENT 
*************************************************************************/
// IMPORTS
const fs       = require("fs")
const util     = require("util")
const express  = require('express');
const router   = express.Router();
const path     = require("path")
const config   = require("config")
const appRoot  = require('app-root-path').path
const logger   = require("ucipass-logger")
const fileUpload = require('express-fileupload');
const multer  = require('multer')


// GLOBAL VARIABLES
var name = "files"
var dirBIN   = path.join( appRoot, "bin")
var dirHTML  = path.join( appRoot, "dist", name)
var dirPrefix = config.get(name+".directory")
var dirUPLOAD   = path.join( appRoot,dirPrefix )
var dirFiles = path.join( appRoot, dirPrefix)  // full path of files directory
var upload = multer({ dest: dirUPLOAD })
const uploadName = "clientuploads"
var log      = logger(name)
var JSONData = require( path.join(dirBIN, "jsondata.js"))
var ioData   = new JSONData
var readir = util.promisify(fs.readdir)
var stat = util.promisify(fs.stat)
var unlink = util.promisify(fs.unlink)
// SETUP
if (!fs.existsSync(dirFiles)){ fs.mkdirSync(dirFiles);}

router.get( "/"    , (req,res)=>{ 
	res.sendFile(path.join(dirHTML,'index.html'))
})

router.post('/upload', upload.array(uploadName,500), function (req, res, next) {
	let files = req.files
	let body = req.body

	for( let index in files){
		let file = files[index]
		let tmpfile = path.join(file.destination,file.filename)
		let newfile = path.join(file.destination,file.originalname)
		fs.rename(tmpfile,newfile, (err)=> {
			if (err) {
				return res.status(500).send(err);
			}
			res.redirect('/files'); // Success
		  });
	}
	/*
	destination:"/tmp/"
	encoding:"7bit"
	fieldname:"clientuploads"
	filename:"15d5649f4cd9ab2cac73f3b4d07886cf"
	mimetype:"application/pdf"
	originalname:"2601863389_841801330779_20180528_164018.pdf"
	path:"/tmp/15d5649f4cd9ab2cac73f3b4d07886cf"
	size:231766
	*/
  })

router.post( '/'  , async (req,res)=>{ 
	let ioData = new JSONData();
	if (req.body.data){
		ioData.setjson(req.body);
		log.debug("RECV:",ioData.id(),ioData.att().cmd);
		log.debug("RECV ATT:",ioData.att());
	}
	else{
		log.error("POST INVALID: ",req.body);
		res.end("INVALID POST received by Nodejs!\n");
		return;
	}
	if (ioData.cmd() === "dirlist") {
		let dirlist = []
		let dir =  await readir(dirFiles)
		for ( let i = 0 ; i< dir.length; i++){
			let file = dir[i]
			let fpath = path.join(dirFiles, file )
			let s =  await stat( fpath)
			if (s.isFile()){
				dirlist.push({ name:dirPrefix+"/"+file, mtime:s.mtime, size:s.size })
			}
		}
		ioData.att().dirlist = dirlist
		res.json(JSON.stringify(ioData))
	}
	else if (ioData.cmd() === "delete") {
		let filename = path.basename( ioData.att().file)
		let fpath = path.join(dirFiles, filename)
		await unlink(fpath).catch((err)=>{log.error("DELETE UNSUCCESSFUL")})
		res.json("SUCCESS DELETING")
	}
	else {
		ioData.json.error = "no matching command";
		ioData.json.data.type = ioData.json.data.type+'-nomatch';
		ioData.json.data.attributes.data = null;
		log.error('SEND:', ioData.type(),'ID:',ioData.id()+" ATT:"+ ioData.attributes());
		res.json(ioData.getjson()); //THIS IS WHERE THE RESPONSE IS SENT
		return;	
	}
})
	
module.exports = router;
