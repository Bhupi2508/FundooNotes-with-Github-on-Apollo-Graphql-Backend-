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
const user = require('../Query/query').user;   //user queries
const labelUser = require('../Query/query').labelUser;   //labelUser queries
const signUp = require('../Mutation/UserMutation').signup  //signUp mutation
const emailVerify = require('../Mutation/UserMutation').emailVerify  //emailVerify mutation
const login = require('../Mutation/UserMutation').login   //login mutation
const forgotPassword = require('../Mutation/UserMutation').forgotPassword   //forgotPassword mutation
const resetPassword = require('../Mutation/UserMutation').resetPassword   //resetPassword mutation

//create a empty function
var userMutation = function () { }

/*******************************************************************************************************************/
/**
 * @param {Query}
 * @param {Mutation}
 */
userMutation.prototype.resolvers = {
    Query: {
        user,
        labelUser
    },
    Mutation: {
        signUp,
        emailVerify,
        login,
        forgotPassword,
        resetPassword
    }
}


/**
* @exports userMutation
*/
module.exports = new userMutation()