/********************************************************************************************************************
 *  @Execution      : default node          : cmd> labelAndIssueMutation.js
 *
 *  @Purpose        : create a label and updated your issue in github
 *  @description    : By using mutation we can manipulate the data (CURD)
 *
 *  @overview       : fundoo application
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 10-june-2019
 *
 *******************************************************************************************************************/
/**
 * @requires files
 */
var axios = require('axios')
var model = require('../../model/userSchema')
var tokenVerify = require('../../Authentication/authenticationUser')


//create a empty function
var userAddLabelMutation = function () { }



/*******************************************************************************************************************/
/**
 * @description : createLabelInGit APIs for create a label for Git in github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddLabelMutation.prototype.createLabelInGit = async (root, params, context) => {
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
         * @method (POST), POST data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'POST',
            url: `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/labels`,
            headers: {
                Authorization: `Bearer ${access_token}`
            },
            data: JSON.stringify({
                "name": `${params.labelName}`,
                "description": `${params.description}`,
                "color": `${params.color}`
            })
        })

        console.log("res", res)

        return {
            "message": "Label Created successfully",
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": "label is not created+" }
    }
}






/*******************************************************************************************************************/
/**
 * @description : updateLabelInGit APIs for update a label for Git in github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddLabelMutation.prototype.updateLabelInGit = async (root, params, context) => {
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
         * @method (PATCH), PATCH data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'PATCH',
            url: `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/labels/${params.currentLabelName}`,
            headers: {
                Authorization: `Bearer ${access_token}`
            },
            data: JSON.stringify({
                "name": `${params.labelName}`,
                "description": `${params.description}`,
                "color": `${params.color}`
            })
        })

        console.log("res", res)

        return {
            "message": "Label Updated successfully",
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": "Label is not updated" }
    }
}





/*******************************************************************************************************************/
/**
 * @description : GetLabelList APIs get list from github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddLabelMutation.prototype.GetLabelList = async (root, params, context) => {
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
         * @method (GET), GET data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'GET',
            url: `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/labels`,
            headers: {
                Authorization: `Bearer ${access_token}`
            },
        })

        console.log("res", res)

        return {
            "message": "Label Data Fetch successfully",
            "data": res.data
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": "Label data not fetch successfully" }
    }
}





/**
* @exports userAddLabelMutation
*/
module.exports = new userAddLabelMutation()



