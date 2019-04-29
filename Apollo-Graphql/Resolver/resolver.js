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
const notesUser = require('../Query/query').notesUser;   //notesUser queries
const signUp = require('../Mutation/UserMutation').signup  //signUp mutation
const emailVerify = require('../Mutation/UserMutation').emailVerify  //emailVerify mutation
const login = require('../Mutation/UserMutation').login   //login mutation
const forgotPassword = require('../Mutation/UserMutation').forgotPassword   //forgotPassword mutation
const resetPassword = require('../Mutation/UserMutation').resetPassword   //resetPassword mutation
const createLabel = require('../Mutation/labelMutation').createLabel   //createLabel mutation
const editLabel = require('../Mutation/labelMutation').editLabel  //editLabel mutation
const removeLabel = require('../Mutation/labelMutation').removeLabel   //removeLabel mutation
const createNote = require('../Mutation/noteMutation').createNote  //createNote mutation
const editNote = require('../Mutation/noteMutation').editNote  //editNote mutation
const removeNote = require('../Mutation/noteMutation').removeNote  //removeNote mutation
const saveLabelToNote = require('../Mutation/noteMutation').saveLabelToNote  //saveLabelToNote mutation
const removeLabelFromNote = require('../Mutation/noteMutation').removeLabelFromNote  //removeLabelFromNote mutation

//create a empty function
var userResolver = function () { }

/*******************************************************************************************************************/
/**
 * @param {Query}
 * @param {Mutation}
 */
userResolver.prototype.resolvers = {
    Query: {
        user,
        labelUser,
        notesUser
    },
    Mutation: {
        signUp,
        emailVerify,
        login,
        forgotPassword,
        resetPassword,
        createLabel,
        editLabel,
        removeLabel,
        createNote,
        editNote,
        removeNote,
        saveLabelToNote,
        removeLabelFromNote

    }
}


/**
* @exports userResolver
*/
module.exports = new userResolver()