/******************************************************************************
 *  @Purpose        : share a note with another registered user (collaborators)
 *  @overview       : fundoo application
 *  @author         : Bhupendra Singh
 ******************************************************************************/
var { errorResponse } = require('../../services/errors');
var userModel = require('../../model/userSchema')
var noteModel = require('../../model/noteSchema')
var sendMail = require('../../sendMailer/sendMail')
var colModel = require('../../model/collabatorsSchema');
var tokenVerify = require('../../Authentication/authenticationUser')

var collaboratorMutation = function () { }

/**
 * Add `colabID` as a collaborator of one of the caller's own notes and notify them by mail.
 */
collaboratorMutation.prototype.addCollaboration = async (root, args, context) => {
    try {
        var payload = tokenVerify.requireUser(context)

        var note = await noteModel.findOne({ _id: args.noteID, userID: payload.userID })
        if (!note) {
            return { "message": "note not found" }
        }

        var collaborator = await userModel.findOne({ _id: args.colabID })
        if (!collaborator) {
            return { "message": "collaborator user not found" }
        }

        var existing = await colModel.findOne({ noteID: args.noteID, collaboratorID: args.colabID })
        if (existing) {
            return { "message": "user already colabrated" }
        }

        await new colModel({
            "userID": payload.userID,
            "noteID": args.noteID,
            "collaboratorID": args.colabID
        }).save()

        await sendMail.sendEmailFunction("You were added as a collaborator on a Fundoo note", collaborator.email)
        return { "message": "colabbed successfully" }
    } catch (err) {
        return errorResponse(err)
    }
}

/**
 * Remove a collaborator from one of the caller's own notes.
 */
collaboratorMutation.prototype.removeCollaboration = async (root, args, context) => {
    try {
        var payload = tokenVerify.requireUser(context)

        var findColab = await colModel.findOneAndDelete({
            userID: payload.userID,
            noteID: args.noteID,
            collaboratorID: args.colabID
        })
        if (findColab) {
            return { "message": "collaborator removed successfully" }
        }
        return { "message": "This collaborator is not present" }
    } catch (err) {
        return errorResponse(err)
    }
}

/**
 * @exports collaboratorMutation
 */
module.exports = new collaboratorMutation()
