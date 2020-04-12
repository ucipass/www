const log1 = require("./index.js")("TEST-ERROR")
const log2 = require("./index.js")("TEST-INFO")
const log3 = require("./index.js")()
const log4 = require("./index.js")("TEST-SILLY")
log3.transports.console.level = 'debug'
log4.transports.file.level = 'silly'

for(let i = 1 ; i<10000; i++){
  log1.error(i)
  log2.info(i*2)  
  log3.debug(i*2)  
  log4.silly(i*2)  
}

