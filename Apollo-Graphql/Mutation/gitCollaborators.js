/********************************************************************************************************************
 *  @Execution      : default node          : cmd> addCollaboratorsInGithub.js
 *
 *  @Purpose        : add collaborators in github with another collaborators
 *
 *  @description    : By using mutation we can manipulate the data (CURD)
 *
 *  @overview       : fundoo application
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 04-june-2019
 *
 *******************************************************************************************************************/
/**
 * @requires files
 */
var model = require('../../model/userSchema')
var axios = require('axios')
var jwt = require('jsonwebtoken')
var tokenVerify = require('../../Authentication/authenticationUser')

//create a empty function
var userAddInCollaborator = function () { }


/*******************************************************************************************************************/
/**
 * @description : addCollaboratorGithub APIs for add collaborators in github repository using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddInCollaborator.prototype.addCollaboratorGithub = async (root, params, context) => {
    try {


        /**
        * @param {token}, send token for verify
        * @returns {String} message, token verification 
        */
        var afterVerify = tokenVerify.verification(context.token)
        if (!afterVerify > 0) {
            return { "message": "token is not verify" }
        }

        //find token from dataBase
        var user = await model.find({ _id: afterVerify.userID })
        if (!user) {
            return { "message": "user not verified" }
        }

        // Access_token
        var access_token = user[0].access_Token
        console.log("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (PUT), PUT data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'PUT',
            url: `${process.env.GIT_COLAB}${params.ownerName}/${params.repoName}/collaborators/${params.colabUserName}`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        console.log("\nRepository collaborators Details : ", res);

        return { "message": "user collaborators added successfully" }

    } catch (err) {
        return { "message": "user collaborators added unsuccessfully" }
    }
}






/*******************************************************************************************************************/
/**
 * @description : removeCollaboratorGithub APIs for delete collaborators in github repository using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddInCollaborator.prototype.removeCollaboratorGithub = async (root, params, context) => {
    try {


        /**
        * @param {token}, send token for verify
        * @returns {String} message, token verification 
        */
        var afterVerify = tokenVerify.verification(context.token)
        if (!afterVerify > 0) {
            return { "message": "token is not verify" }
        }

        //find token from dataBase
        var user = await model.find({ _id: afterVerify.userID })
        if (!user) {
            return { "message": "user not verified" }
        }

        // Access_token
        var access_token = user[0].access_Token
        console.log("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (DELETE), DELETE data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'DELETE',
            url: `${process.env.GIT_COLAB}${params.ownerName}/${params.repoName}/collaborators/${params.colabUserName}`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        console.log("\nRepository collaborators Details : ", res);

        return { "message": "collborators remove successfully" }

    } catch (err) {
        return { "message": "collborators alredy removed " }
    }
}



/**
* @exports userAddInCollaborator
*/
module.exports = new userAddInCollaborator()

