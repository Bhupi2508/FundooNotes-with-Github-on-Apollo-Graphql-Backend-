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


//error message
var errorMessage = {
    "message": "Something bad happend",
}


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
        //console.log("\nRepository collaborators Details : ", res);

        return { "message": "user collaborators added successfully" }

    } catch (err) {
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
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
        //console.log("\nRepository collaborators Details : ", res);

        return { "message": "collborators remove successfully" }

    } catch (err) {
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
    }
}





/*******************************************************************************************************************/
/**
 * @description : gitCollaboratorsList APIs for show all the collaborators list using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddInCollaborator.prototype.gitCollaboratorsList = async (root, params, context) => {
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


        /**
         * @function (Axios), which is used to handle http request
         * @method (GET), GET data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'GET',
            url: `${process.env.GIT_COMMITS}${params.ownerName}/${params.repoName}/collaborators`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })

        console.log("res", res.data);

        //create a array
        var array = [];
        for (var i = 0; i < res.data.length; i++) {
            console.log("\nRepository collaborators Details : ", res.data[i].login);
            array.push(res.data[i].login)
        }

        return {
            "message": "Collaborators list fetch successfully",
            "data": res.data
        }

    } catch (err) {
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
    }
}





/**
* @exports userAddInCollaborator
*/
module.exports = new userAddInCollaborator()

