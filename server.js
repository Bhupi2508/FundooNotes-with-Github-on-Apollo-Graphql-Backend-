/******************************************************************************
 *  @Execution      : default node          : cmd> server.js
 *                      
 * 
 *  @Purpose        : Create APIs and connect server using apollo-graphql
 * 
 *  @description    : set middleware and connect all the server mechanism(path)
 * 
 *  @overview       : fundoo application
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 27-april-2019
 *
 ******************************************************************************/
/**
 * @requires files
 */
const { ApolloServer, gql } = require('apollo-server');
var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')
const { typeDefs } = require('./Apollo-Graphql/Types/types');
const resolvers = require('./Apollo-Graphql/Resolver/resolver').resolvers
const mongoose = require('./Mongoconfig/mongoose')
const db = mongoose()
require('dotenv').config();


//for s3 upload a pic in S# bucket
var s3 = new aws.S3({
    bucketName: 'myfundoo',
    region: 'ap-south-1',
    accessKeyId: process.env.awsID,
    secretAccessKey: process.env.awsSecret,
    s3Url: 'https://my-s3-url.com/.jpg',
})

//create a uplaod file for given aws information
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'myfundoo',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
})

//create a middleware using apollo-graphql
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
        origin: req.headers.origin,
        token: req.query.token,
        code: req.query.code,
        req: req
    }),
    upload: {
        // upload.single('picture')
    }
});

//listen the given port
var userPort = (process.env.port)
server.listen(userPort, () => {
    console.log('#####################################################################################');
    console.log('##############          STARTING SERVER at port : ', userPort, '               ##############');
    console.log('#####################################################################################');
});