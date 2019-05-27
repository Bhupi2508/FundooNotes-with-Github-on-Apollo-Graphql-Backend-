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
const { ApolloServer } = require('apollo-server');
require('dotenv').config();
const express = require('express')
const { typeDefs } = require('./Apollo-Graphql/Types/types');
const resolvers = require('./Apollo-Graphql/Resolver/resolver').resolvers
const mongoose = require('./Mongoconfig/mongoose')
const upload = require('./services/s3-services')
const db = mongoose()
var app = express()


//create a middleware using apollo-graphql
var server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
        origin: req.headers.origin,
        token: req.query.token,
        code: req.query.code,
        req: req
    })
});


//middleware for s3 APIs
// app.use('/graphql', upload.single('picture'))
// server.applyMiddleware({ app })


//listen the given port
var userPort = (process.env.PORT)
server.listen(userPort, () => {
    console.log('#####################################################################################');
    console.log('##############          STARTING SERVER at port : ', userPort, '               ##############');
    console.log('#####################################################################################');
});


/**
 * @exports server
 */
module.exports = server