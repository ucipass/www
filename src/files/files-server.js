
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
// GLOBAL VARIABLES
var name = "files"
var dirBIN   = path.join( appRoot, "bin")
var dirHTML  = path.join( appRoot, "dist", name)
var dirPrefix = config.get(name+".directory")
var dirUPLOAD   = path.join( appRoot,dirPrefix )
var dirFiles = path.join( appRoot, dirPrefix)  // full path of files directory
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
router.use("/upload",fileUpload());

router.post('/upload', function(req, res) {
	if (!req.files){
		return res.status(400).send('Error No files were uploaded.');
	}
	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	let currentFile = req.files.sampleFile;
	// Use the mv() method to place the file somewhere on your server
	currentFile.mv( path.join(dirUPLOAD,currentFile.name), function(err) {
		if (err){
			return res.status(500).send(err);
		}else{
			res.redirect('/files'); // Success
		}
	})
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
