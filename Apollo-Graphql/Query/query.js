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
var logger = require('../../services/logger');
var colabModel = require('../../model/collabatorsSchema')
var tokenVerify = require('../../Authentication/authenticationUser')

//create a empty function
var userQueries = function () { }


/***********************************************************************************/
/**
 * @purpose : for user Query
 * @param {args}
 * @param {context}
 */
userQueries.prototype.user = async (root, params, context) => {
    if (!context.token) {
        return {
            "message": "token not provided"
        }
    }
    var payload = tokenVerify.verification(context.token)
    var user = await userModel.find({ _id: payload.userID }).limit(params.first).skip(params.offset)
    logger.info("user", user)
    return user
}


/***********************************************************************************/
/**
 * @purpose : for labelUser Query
 * @param {args}
 * @param {context}
 */
userQueries.prototype.labelUser = async (root, params) => {
    var label_User = await labelModel.find().sort({ "labelName": 1 }).limit(params.first).skip(params.offset)
    logger.info("user", label_User)
    return label_User
}


/***********************************************************************************/
/**
 * @purpose : for notesUser Query
 * @param {args}
 * @param {context}
 */
userQueries.prototype.notesUser = async (root, params) => {
    var regex1 = new RegExp(params.title)
    var regex2 = new RegExp(params.description)
    var notes_User = await notesModel.find({ title: regex1, description: regex2 }).limit(params.first).skip(params.offset)
    logger.info("notes_User", notes_User[0]);
    return notes_User
}



/***********************************************************************************/
/**
 * @purpose : for colaborators Query
 * @param {args}
 * @param {context}
 */
userQueries.prototype.colabUser = async (root, params) => {
    var colab_User = await colabModel.find().exec()
    return colab_User
}



/***********************************************************************************/
/**
 * @purpose : for gituser Query
 * @param {args}
 * @param {context}
 */
userQueries.prototype.gitRepo = async (root, params) => {
    var git_User = await notesModel.find().exec()
    logger.info("git_User", git_User[0]);
    return git_User
}




/***********************************************************************************/
/**
 * @purpose : for searchNoteByTitle Query 
 * @param {args}
 * @param {context}
 */
userQueries.prototype.searchNoteByTitle = async (root, params) => {
    var regex1 = new RegExp(params.title)
    var notes_User = await notesModel.find({ title: regex1 }).limit(params.first).skip(params.offset)
    logger.info("notes_user", notes_User[0]);
    return notes_User
}




/***********************************************************************************/
/**
 * @purpose : for searchNoteByDescription Query 
 * @param {args}
 * @param {context}
 */
userQueries.prototype.searchNoteByDescription = async (root, params) => {
    var regex2 = new RegExp(params.description)
    var notes_User = await notesModel.find({ description: regex2 }).limit(params.first).skip(params.offset)
    logger.info("notes_user", notes_User[0]);
    return notes_User
}




/**
 * @exports userQueries
 */
module.exports = new userQueries()