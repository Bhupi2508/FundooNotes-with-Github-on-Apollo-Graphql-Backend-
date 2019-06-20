/******************************************************************************
 *  @Execution      : default node          : cmd> redis.js
 *                      
 * 
 *  @Purpose        : connect server to redis
 * 
 *  @description    : Connected with mongoDB database
 * 
 *  @overview       : Redis connections
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 03-june-2019
 *
 ******************************************************************************/
/**
 * @requires files
 */
const redis = require("async-redis");
const client = redis.createClient({
    host: 'redis',
    port: process.env.REDIS_PORT
})

/**
 * @param{} create a empty function and export
 * @retutn connectivity
 * @exports function{}
 */
module.exports = function () {

    client.on('connect', function () {
        //console.log('#####################################################################################');
        console.log('##############                 connected with redis                    ##############');
        //console.log('#####################################################################################');
    });

    client.on('error', function (err) {
        console.log('Something went wrong ' + err);
    });
};