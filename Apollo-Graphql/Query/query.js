/******************************************************************************
 *  @Execution      : default node          : cmd> query.js
 *                      
 * 
 *  @Purpose        : Generate a queries for users types
 * 
 *  @description    : GraphQL query for specific fields on object and result will come exactly 
 *                    the same shape as request.
 * 
 *  @overview       : fundoo application 
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 28-april-2019
 *
 ******************************************************************************/
/**
 * @requires files
 */
var userModel = require('../../model/userSchema')
var labelModel = require('../../model/labelSchema')
var notesModel = require('../../model/noteSchema')

//create a empty function
var userQueries = function () { }


/*******************************************************************************************************************/
/**
 * @param {args}
 * @param {context}
 */
//for user Queries
userQueries.prototype.user = async (parent, args) => {
    var user = await userModel.find({ "_id": args.userID }).exec()
    console.log(user[0]);
    return user
}

//for label quries
userQueries.prototype.labelUser = async (parent, args) => {
    var label_User = await labelModel.find({ "userID": args.userID }).exec()
    console.log(label_User[0]);
    return label_User
}

//for label quries
userQueries.prototype.notesUser = async (parent, args) => {
    var notes_User = await notesModel.find({ "userID": args.userID }).exec()
    console.log(notes_User[0]);
    return notes_User
}

//for gitAuth quries
userQueries.prototype.gitUser = async (parent, args) => {
    var gitUser = await userModel.find().exec()
    console.log(gitUser[0]);
    return gitUser
}

/**
 * @exports userQueries
 */
module.exports = new userQueries()