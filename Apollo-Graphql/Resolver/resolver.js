/******************************************************************************
 *  @Execution      : default node          : cmd> resolver.js
 * 
 *  @Purpose        : Generate a resolver for type users
 * 
 *  @description    : GraphQL query for specific fields on object and result will come exactly 
 *                    the same shape as request.
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
const signUp = require('../Mutation/UserMutation').signup
const user = require('../Query/query').user;
const emailVerify = require('../Mutation/UserMutation').emailVerify

//create a empty function
var userMutation = function () { }

/*******************************************************************************************************************/
/**
 * @param {Query}
 * @param {Mutation}
 */
userMutation.prototype.resolvers = {
    Query: {
        user
    },
    Mutation: {
        signUp,
        emailVerify
    }
}


/**
* @exports userMutation
*/
module.exports = new userMutation()