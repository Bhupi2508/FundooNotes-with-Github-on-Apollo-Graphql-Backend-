/******************************************************************************
 *  @Execution      : default node          : cmd> server.js
 *                      
 * 
 *  @Purpose        : Create APIs and connect server using apollo-graphql
 * 
 *  @description    : set middleware and connect all the server mechanism(path)
 * 
 *  @overview       : fundoo application
 *  @author         : Bhupendra Singh
 *  @version        : 1.0
 *  @since          : 27-april-2019
 *
 ******************************************************************************/
/**
 * @requires files
 */
require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const { typeDefs } = require('./Apollo-Graphql/Types/types');
const resolvers = require('./Apollo-Graphql/Resolver/resolver').resolvers
const mongoose = require('./Mongoconfig/mongoose')
const redis = require('./Mongoconfig/redis')

// Fail fast when the essentials are missing instead of crashing later at request time.
const required = ['PORT', 'MONGO_PORT', 'SECRET_KEY']
const missing = required.filter((name) => !process.env[name])
if (missing.length) {
    console.error('Missing required environment variables: ' + missing.join(', ') + ' (see .env.example)')
    process.exit(1)
}

mongoose()
redis()

//create the GraphQL server; token / code are read from the URL query string (?token=...&code=...)
var server = new ApolloServer({
    typeDefs,
    resolvers,
    // never send stack traces to clients; set DEBUG=true locally to get them
    debug: process.env.DEBUG === 'true',
    context: ({ req }) => ({
        origin: req.headers.origin,
        token: req.query.token,
        code: req.query.code,
    })
});

//listen the given port
var userPort = process.env.PORT
server.listen(userPort).then(({ url }) => {
    console.log('Server running at ' + url);
});


/**
 * @exports server
 */
module.exports = server