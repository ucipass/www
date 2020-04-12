var winston = require("winston")
var fs = require("fs")
var appRoot = require('app-root-path').path;
var path = require("path")
var logRoot = path.join( appRoot, "log" )
var logFile = path.join(logRoot,"all-log.log")
if (!fs.existsSync(logRoot)){  console.log("Creating log directory",logRoot) ; fs.mkdirSync(logRoot); }


function getNewLogger(fileName){
    var options = {
        console: {
            level: "info",
            handleExceptions: true,
            json: false,
            colorize: true,
            },
        file: {
            level: "info",
            filename: fileName ? path.join(logRoot,fileName+".log") : logFile,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            colorize: false,
        }
    };
    var logger =  new winston.Logger({
        transports: [
            new winston.transports.File(options.file),
            new winston.transports.Console(options.console)
        ],
        exitOnError: true, // do not exit on handled exceptions
    });
    //log.transports.console.level = "debug"
    return logger
}
module.exports = getNewLogger

