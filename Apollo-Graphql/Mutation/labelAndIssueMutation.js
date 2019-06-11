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
const { createApolloFetch } = require('apollo-fetch')
var model = require('../../model/userSchema')
var tokenVerify = require('../../Authentication/authenticationUser')
var issueModel = require('../../model/gitIssueSchema')


//create a empty function
var userAddLabelMutation = function () { }




/*******************************************************************************************************************/
/**
 * @description : createIssueForGit APIs create issue for github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddLabelMutation.prototype.createIssueForGit = async (root, params, context) => {
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

        //fetch github data from github
        const fetch = createApolloFetch({
            uri: `${process.env.GIT_FETCH_REPO}${access_token}`
        });


        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {createIssue(input:{repositoryId:"${params.repositoryId}" title:"${params.title}" body:"${params.description}" assigneeIds:[${params.assigneeId}]}){ issue{number id assignees(first:10){nodes{ login }}}}}`,
        })

        console.log("res", res.data)
        var assignees = [];

        //pass params in issueModel
        for (var i = 0; i < res.data.createIssue.issue.assignees.nodes.length; i++) {
            assignees.push(res.data.createIssue.issue.assignees.nodes[i].login)
        }
        var issueSave = new issueModel({
            issueID: res.data.createIssue.issue.id,
            issueNumber: res.data.createIssue.issue.number,
            assignees: assignees
        })

        //issue saved in database
        var savedIssues = await issueSave.save()
        console.log(savedIssues)
        return {
            "message": "issue created successfully",
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": "issue not created" }
    }
}





/*******************************************************************************************************************/
/**
 * @description : deleteIssueForGit APIs delete issue for github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddLabelMutation.prototype.deleteIssueForGit = async (root, params, context) => {
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

        //fetch github data from github
        const fetch = createApolloFetch({
            uri: `${process.env.GIT_FETCH_REPO}${access_token}`
        });


        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {deleteIssue(input:{issueId:"${params.issueId}"}){ clientMutationId}}`,
        })

        return {
            "message": "issue deleted successfully",
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": "issue not deleted" }
    }
}





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
 * @description : deleteLabelInGit APIs delete label in github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddLabelMutation.prototype.deleteLabelInGit = async (root, params, context) => {
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
            url: `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/labels/${params.labelName}`,
            headers: {
                Authorization: `Bearer ${access_token}`
            },
        })

        console.log("res", res)

        return {
            "message": "Label delete successfully",
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": "Label is not deleted" }
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






/*******************************************************************************************************************/
/**
 * @description : addLabelInIssue APIs add label in issue github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddLabelMutation.prototype.addLabelInIssue = async (root, params, context) => {
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
            method: 'POST',
            url: `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/issues/${params.issueNumber}/labels`,
            headers: {
                Authorization: `Bearer ${access_token}`
            },
            data: JSON.stringify(
                {
                    "labels": params.labelName
                }
            )
        })

        console.log("res", res.data)

        /**
         * @purpose : find labelName that is present in database or not
         * @return {String} message
         */
        var labelFind = await issueModel.find({ labelName: params.labelName[0] })

        if (labelFind.length > 0) {
            return { "message": "label is already present in database" }
        }


        // label update in mongodb
        var updateLabel = await issueModel.findOneAndUpdate({ issueNumber: params.issueNumber },
            {
                $push: {
                    labelName: params.labelName
                }
            })
        if (!updateLabel) {
            return { "message": "label not added in issue" }
        }

        return {
            "message": "add label in issue successfully",
            "data": res.data
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": "label not added in issue" }
    }
}






/*******************************************************************************************************************/
/**
 * @description : removeLabelInIssue APIs remove label from issue github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddLabelMutation.prototype.removeLabelFromIssue = async (root, params, context) => {
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
            url: `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/issues/${params.issueNumber}/labels/${params.labelName}`,
            headers: {
                Authorization: `Bearer ${access_token}`
            },
        })

        return {
            "message": "remove label from issue successfully",
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": "label not removed from issue" }
    }
}







/**
* @exports userAddLabelMutation
*/
module.exports = new userAddLabelMutation()
