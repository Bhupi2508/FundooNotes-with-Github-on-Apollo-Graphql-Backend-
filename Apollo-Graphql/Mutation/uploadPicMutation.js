/********************************************************************************************************************
 *  @Execution      : default node          : cmd> uploadPicMutation.js
 *                      
 * 
 *  @Purpose        : upload pic on s3-aws storage using apollo-graphql 
 * 
 *  @description    : By mutation upload a pic on AWS-s3
 * 
 *  @overview       : fundoo application  
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 29-april-2019
 *
 *******************************************************************************************************************/
/**
 * @requires files
 */
var userModel = require('../../model/userSchema');
var verifyToken = require('../../Authentication/authenticationUser')



//create a empty function
var uploadPicMutation = function () { }



/**
 * @param {*} root
 * @param {*} args
 * @param {*} context
 */
uploadPicMutation.prototype.picUpload = async (root, args, context) => {
    if (context.token) {



        //verify token 
        var afterVerify = verifyToken.verification(context.token)
        if (!afterVerify > 0) {
            return { "message": "token is not verify" }
        }
        logger.info(context.req.file.location)



        //find in database and then update
        var updateurl = await userModel.findOneAndUpdate({ _id: afterVerify.userID }, { $set: { ProfilePicUrl: context.req.file.location } })
        if (updateurl) {
            return {
                "uploadURL": context.req.file.location,
                "message": "Upload pic successfully"
            }
        }
    }
    else {
        return { "uploadURL": "profile Pic is not set" }
    }
}


/**
* @exports uploadPicMutation
*/
module.exports = new uploadPicMutation()