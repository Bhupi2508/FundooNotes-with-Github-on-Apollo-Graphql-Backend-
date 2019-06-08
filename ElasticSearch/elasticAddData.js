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

client.index({
    index: 'data',
    id: '1',
    type: 'constituencies',
    body: {
        "DataName": "Ipswich",
        "DataID": "E14000761",
        "DataType": "Borough",
        "Efficiency": 100,
        "Storage": 4000,
    }
}, function (err, resp, status) {
    console.log(resp);
});