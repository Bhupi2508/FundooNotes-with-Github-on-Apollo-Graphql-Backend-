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


/***********************************************************************************/
/**
 * @purpose : for user Query
 * @param {args}
 * @param {context}
 */
userQueries.prototype.user = async (root, args) => {
    var user = await userModel.find().exec()
    console.log(user);
    return user
}


/***********************************************************************************/
/**
 * @purpose : for labelUser Query
 * @param {args}
 * @param {context}
 */
userQueries.prototype.labelUser = async (root, args) => {
    var label_User = await labelModel.find().sort({ "labelName": 1 })
    console.log(label_User);
    return label_User
}


/***********************************************************************************/
/**
 * @purpose : for notesUser Query
 * @param {args}
 * @param {context}
 */
userQueries.prototype.notesUser = async (root, args) => {
    var notes_User = await notesModel.find().exec()
    console.log(notes_User[0]);
    return notes_User
}


/***********************************************************************************/
/**
 * @purpose : for gituser Query
 * @param {args}
 * @param {context}
 */
userQueries.prototype.gitUser = async (root, args) => {
    var git_User = await userModel.find().exec()
    console.log(git_User[0]);
    return git_User
}



/**
 * @exports userQueries
 */
module.exports = new userQueries()