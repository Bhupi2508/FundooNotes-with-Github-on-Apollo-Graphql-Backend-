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
 *  @author         : Bhupendra Singh
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
var escapeRegex = tokenVerify.escapeRegex

//create a empty function
var userQueries = function () { }


/***********************************************************************************/
/**
 * Every query below requires a login token and only ever returns the caller's own data.
 * `first` / `offset` paginate; they are clamped so a client cannot request unbounded pages.
 */
const page = (params) => ({
    limit: Math.min(Math.max(params.first || 50, 1), 100),
    skip: Math.max(params.offset || 0, 0)
})

/** @purpose : the logged-in user (password hash is never part of the GraphQL schema) */
userQueries.prototype.user = async (root, params, context) => {
    var payload = tokenVerify.requireUser(context)
    var { limit, skip } = page(params)
    return userModel.find({ _id: payload.userID }).limit(limit).skip(skip)
}

/** @purpose : labels of the logged-in user */
userQueries.prototype.labelUser = async (root, params, context) => {
    var payload = tokenVerify.requireUser(context)
    var { limit, skip } = page(params)
    return labelModel.find({ userID: payload.userID }).sort({ "labelName": 1 }).limit(limit).skip(skip)
}

/** @purpose : notes of the logged-in user, optionally filtered by title / description (substring match) */
userQueries.prototype.notesUser = async (root, params, context) => {
    var payload = tokenVerify.requireUser(context)
    var { limit, skip } = page(params)
    var filter = { userID: payload.userID }
    if (params.title) filter.title = new RegExp(escapeRegex(params.title))
    if (params.description) filter.description = new RegExp(escapeRegex(params.description))
    return notesModel.find(filter).limit(limit).skip(skip)
}

/** @purpose : collaborations created by the logged-in user or that include them */
userQueries.prototype.colabUser = async (root, params, context) => {
    var payload = tokenVerify.requireUser(context)
    var { limit, skip } = page(params)
    return colabModel.find({ $or: [{ userID: payload.userID }, { collaboratorID: payload.userID }] }).limit(limit).skip(skip)
}

/** @purpose : notes that were imported from the user's GitHub repositories (see pullGitRepository) */
userQueries.prototype.gitRepo = async (root, params, context) => {
    var payload = tokenVerify.requireUser(context)
    return notesModel.find({ userID: payload.userID }).exec()
}

/** @purpose : search the caller's notes by title */
userQueries.prototype.searchNoteByTitle = async (root, params, context) => {
    var payload = tokenVerify.requireUser(context)
    return notesModel.find({ userID: payload.userID, title: new RegExp(escapeRegex(params.title), 'i') }).limit(100)
}

/** @purpose : search the caller's notes by description */
userQueries.prototype.searchNoteByDescription = async (root, params, context) => {
    var payload = tokenVerify.requireUser(context)
    return notesModel.find({ userID: payload.userID, description: new RegExp(escapeRegex(params.description), 'i') }).limit(100)
}


/**
 * @exports userQueries
 */
module.exports = new userQueries()
