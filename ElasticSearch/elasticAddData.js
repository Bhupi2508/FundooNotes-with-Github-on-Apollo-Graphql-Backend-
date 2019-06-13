/******************************************************************************
 *  @Execution      : default node          : cmd> nodemon elasticAddData.js
 *                      
 * 
 *  @Purpose        : Elastic search add a new data 
 * 
 *  @description    : Using ElasticSearch we can search anything from DataBase 
 * 
 *  @overview       : ElasticSearch connections
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 13-jun-2019
 *
 ******************************************************************************/
/**
 * @requires files
 */
var client = require('./elastic');

// add a data to the index that has already been created
client.index(
    {
        index: 'details',
        id: '3',
        type: 'constituencies',
        body: {
            "First Name": "Bhupendra",
            "Last Name": "Singh",
            "Email": "bhupi@gmail.com",
            "City": "Jaipur",
            "Company": "JP Morgan",
        }
    },
    function (err, resp, status) {
        console.log("Add new data : ", resp);
    });