/******************************************************************************
 *  @Purpose        : profile picture upload (AWS S3)
 *  @overview       : fundoo application
 *  @author         : Bhupendra Singh
 *
 *  NOTE: this resolver needs the multer-s3 middleware from services/s3-services.js to run
 *  *before* GraphQL so that `req.file.location` exists. That middleware is currently commented
 *  out in server.js (Apollo Server 2's `listen()` has no Express hook), so the mutation reports
 *  that uploads are not enabled instead of crashing.
 ******************************************************************************/
var userModel = require('../../model/userSchema');
var verifyToken = require('../../Authentication/authenticationUser')
var { errorResponse } = require('../../services/errors');

var uploadPicMutation = function () { }

uploadPicMutation.prototype.picUpload = async (root, args, context) => {
    try {
        var payload = verifyToken.requireUser(context)
        var file = context.req && context.req.file
        if (!file || !file.location) {
            return { "uploadURL": "profile Pic is not set" }
        }
        await userModel.findOneAndUpdate({ _id: payload.userID }, { $set: { ProfilePicUrl: file.location } })
        return { "uploadURL": file.location, "Key": file.key }
    } catch (err) {
        return errorResponse(err)
    }
}

module.exports = new uploadPicMutation()
