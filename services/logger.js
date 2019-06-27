/********************************************************************************************************************
 *  @Execution      : default node          : cmd> logger.js
 *                      
 * 
 *  @Purpose        :  A Simple and Universal Logger. ... Winston is a logger for just about everything. 
 *                     It is designed to be a simple and universal logging library with support for multiple transports.
 *                     Transport is a storage device for your logs.
 * 
 *  @description    : using logger instance we can show or print the value
 * 
 *  @overview       : fundoo application  
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 27-june-2019
 *
 *******************************************************************************************************************/
/**
 * @requires files
 */
var winston = require('winston');


//create a winston logger
var logger = new (winston.createLogger)({
    transports: [
        new (winston.transports.Console)({ json: false, timestamps: true }),
        new winston.transports.File({ filename: __dirname + '/debug.log', json: false })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ json: false, timestamps: true }),
        new winston.transports.File({ filename: __dirname + '/exceptions.log', json: false })
    ],
    exitOnError: false
});

/**
 * @exports logger
 */
module.exports = logger;