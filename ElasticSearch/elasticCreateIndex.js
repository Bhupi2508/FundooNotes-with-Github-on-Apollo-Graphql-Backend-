/******************************************************************************
 *  @Execution      : default node          : cmd> nodemon elasticCreate.js
 *                      
 * 
 *  @Purpose        : Elastic search create a new data 
 * 
 *  @description    : Using ElasticSearch we can search anything from DataBase 
 * 
 *  @overview       : ElasticSearch connections
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 08-jun-2019
 *
 ******************************************************************************/
/**
 * @requires files
 */
var client = require('./elastic');

client.indices.create({
    index: 'project'
}, function (err, resp, status) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("create", resp);
    }
});