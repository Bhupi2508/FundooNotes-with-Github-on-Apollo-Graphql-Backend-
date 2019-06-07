/******************************************************************************
 *  @Execution      : default node          : cmd> nodemon elastic.js
 *                      
 * 
 *  @Purpose        : Elastic search 
 * 
 *  @description    : Using ElasticSearch we can search anything from DataBase 
 * 
 *  @overview       : ElasticSearch connections
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 07-jun-2019
 *
 ******************************************************************************/
/**
 * @requires files
 */
// var elasticsearch = require('elasticsearch');

// //create elastic search client
// var client = new elasticsearch.Client({
//     hosts: 'localhost:9200',
//     log: 'trace'
// });

// //for elastic search connections
// client.ping({
//     requestTimeout: 1000,
// }, function (error) {
//     if (error) {
//         console.error('elasticsearch cluster is down!');
//     } else {
//         console.log('Everything is ok');
//     }
// });

// //create a index for elastic search
// client.indices.create({
//     index: 'blog'
// }, function (err, resp, status) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("create", resp);
//     }
// });

// //post a index
// client.index({
//     index: 'blog',
//     id: '1',
//     type: 'posts',
//     body: {
//         "PostName": "Integrating Elasticsearch Into Your Node.js Application",
//         "PostType": "Tutorial",
//         "PostBody": "This is the text of our tutorial about using Elasticsearch in your Node.js application.",
//     }
// }, function (err, resp, status) {
//     console.log(resp);
// });

// try {
//     const response = client.search({
//       q: 'pants'
//     });
//     console.log(response.hits.hits)
//   } catch (error) {
//     console.trace(error.message)
//   }

//   const response = client.search({
//     index: 'twitter',
//     type: 'tweets',
//     body: {
//       query: {
//         match: {
//           body: 'elasticsearch'
//         }
//       }
//     }
//   })

//   for (const tweet of response.hits.hits) {
//     console.log('tweet:', tweet);
//   }

var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    // host: '127.0.0.1:4000',
    // log: 'error',
    host: 'localhost:9200',
    log: 'trace',
    keepAlive: false

});

module.exports = client;  