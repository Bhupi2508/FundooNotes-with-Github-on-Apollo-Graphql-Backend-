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
var axios_data = require('../../services/axios-services').axiosService
var logger = require('../../services/logger');


//create a empty function
var userAddLabelMutation = function () { }




/*******************************************************  createIssueForGit  ************************************************************/
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
        logger.info("access_token", access_token)



        //fetch github data from github
        const fetch = createApolloFetch({
            uri: `${process.env.GIT_FETCH_REPO}${access_token}`
        });



        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {createIssue(input:{repositoryId:"${params.repositoryId}" title:"${params.title}" body:"${params.description}" assigneeIds:[${params.assigneeId}]}){ issue{number title body id assignees(first:10){nodes{ login }}}}}`,
        })


        logger.info("res", res.data)
        var assignees = [];



        //pass params in issueModel
        for (var i = 0; i < res.data.createIssue.issue.assignees.nodes.length; i++) {
            assignees.push(res.data.createIssue.issue.assignees.nodes[i].login)
        }



        //pass those arguments
        var issueSave = new issueModel({
            title: res.data.createIssue.issue.title,
            description: res.data.createIssue.issue.body,
            issueID: res.data.createIssue.issue.id,
            issueNumber: res.data.createIssue.issue.number,
            assignees: assignees
        })



        //issue saved in database
        var savedIssues = await issueSave.save()
        logger.info("savedIssues: ", savedIssues)

        //return the response
        return {
            "message": "issue created successfully",
        }

    } catch (err) {
        logger.error("savedIssues: ", savedIssues)
        console.log("!Error", err)
        return { "message": "issue not created" }
    }
}







/***********************************************************  updateIssueForGit  ********************************************************/
/**
 * @description : updateIssueForGit APIs update issue for github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddLabelMutation.prototype.updateIssueForGit = async (root, params, context) => {
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
        logger.info("access_token", access_token)



        //fetch github data from github
        const fetch = createApolloFetch({
            uri: `${process.env.GIT_FETCH_REPO}${access_token}`
        });



        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {updateIssue(input:{id:"${params.issueId}" title:"${params.title}" body:"${params.description}"}){ issue { title body }}}`,
        })


        logger.info("res", res.data)


        /**
      * @purpose : update title that is present in database or not
      * @return {String} message
      */
        var issueFind = await issueModel.find({ issueID: params.issueId })
        logger.info("data", issueFind)
        if (!issueFind.length > 0) {
            return { "message": "issue is not present in database" }
        }


        // issue update in mongodb
        var updateIssue = await issueModel.findOneAndUpdate({ issueID: params.issueId },
            {
                $set: {
                    title: params.title,
                    description: params.description
                }
            })
        if (!updateIssue) {
            return { "message": "issue not added in issue" }
        }


        //return the response
        return {
            "message": "issue created successfully",
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "issue not created" }
    }
}







/*******************************************************  deleteIssueForGit  ************************************************************/
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
        logger.info("access_token", access_token)



        //fetch github data from github
        const fetch = createApolloFetch({
            uri: `${process.env.GIT_FETCH_REPO}${access_token}`
        });



        //pass the query mutation for data fetching
        await fetch({
            query: `mutation {deleteIssue(input:{issueId:"${params.issueId}"}){ clientMutationId}}`,
        })


        //return the response
        return {
            "message": "issue deleted successfully",
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "issue not deleted" }
    }
}







/********************************************************  addIssueCommentForGit  ***********************************************************/
/**
 * @description : addIssueCommentForGit APIs create issue comments for github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddLabelMutation.prototype.addIssueCommentForGit = async (root, params, context) => {
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
        logger.info("access_token", access_token)



        //fetch github data from github
        const fetch = createApolloFetch({
            uri: `${process.env.GIT_FETCH_REPO}${access_token}`
        });



        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {addComment(input:{subjectId:"${params.issueId}" body:"${params.comment}"}){ subject { id } commentEdge { node {id body issue { title }}}}}`,
        })


        logger.info("res", res.data)


        // label update in mongodb
        var updateComment = await issueModel.findOneAndUpdate({ issueID: params.issueId },
            {
                $push: {
                    issueComment: {
                        commentId: res.data.addComment.commentEdge.node.id,
                        commentIssue: res.data.addComment.commentEdge.node.body
                    }
                }
            })
        if (!updateComment) {
            return { "message": "comment not added in issue" }
        }


        //return the response
        return {
            "message": "comment added successfully",
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "comment not added" }
    }
}








/********************************************************  deleteIssueCommentForGit  ********************************************************/
/**
 * @description : deleteIssueCommentForGit APIs delete issue comments for github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
userAddLabelMutation.prototype.deleteIssueCommentForGit = async (root, params, context) => {
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
        logger.info("access_token", access_token)



        //fetch github data from github
        const fetch = createApolloFetch({
            uri: `${process.env.GIT_FETCH_REPO}${access_token}`
        });


        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {deleteIssueComment(input:{id:"${params.commentId}" clientMutationId:"${params.clientMutationId}"}){ clientMutationId}}`,
        })


        logger.info("res", res.data)


        //comments deleted from mongodb
        var updateComment = await issueModel.find({ "issueComment.commentId": params.commentId })

        for (let i = 0; i < updateComment[0].issueComment.length; i++) {
            if (updateComment[0].issueComment[i].commentId === params.commentId) {
                var index = updateComment[0].issueComment.indexOf(updateComment[0].issueComment[i]);
            }
        }



        //slice the index
        updateComment[0].issueComment.splice(index, 1);


        //after slice update your database
        var new12 = await issueModel.findOneAndUpdate({ "issueComment.commentId": params.commentId },
            {
                $set: {
                    issueComment: updateComment[0].issueComment
                }
            })


        //check whether update or not
        if (!new12) {
            return { "message": "comment not deleted from issue" }
        }

        //return the response
        return {
            "message": "comment delete successfully",
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "comment not deleted" }
    }
}








/**********************************************************   createLabelInGit   *********************************************************/
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



        //for color validation
        var colorValidation = (/^#([A - Fa - f0 - 9]{ 6 }| [A - Fa - f0 - 9]{ 3 }) $/);
        if (!colorValidation.test(params.color)) {
            //throw new AuthenticationError('not valid email');
            return { "message": "Invalid color", }
        }




        // Access_token
        var access_token = user[0].access_Token
        logger.info("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (POST), POST data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var url = `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/labels`
        var data =
        {
            "name": `${params.labelName}`,
            "description": `${params.description}`,
            "color": `${params.color}`
        }


        //send to axios_services and take response from it
        var res = await axios_data('POST', url, access_token, data)

        logger.info("res", res)


        //return the response
        return {
            "message": "Label Created successfully",
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "label is not created+" }
    }
}






/**********************************************************   updateLabelInGit   *********************************************************/
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


        //for color validation
        var colorValidation = (/^#([A - Fa - f0 - 9]{ 6 }| [A - Fa - f0 - 9]{ 3 }) $/);
        if (!colorValidation.test(params.color)) {
            //throw new AuthenticationError('not valid email');
            return { "message": "Invalid color", }
        }


        // Access_token
        var access_token = user[0].access_Token
        logger.info("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (PATCH), PATCH data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var url = `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/labels/${params.currentLabelName}`
        var data =
        {
            "name": `${params.labelName}`,
            "description": `${params.description}`,
            "color": `${params.color}`
        }



        //send to axios_services and take response from it
        var res = await axios_data('PATCH', url, access_token, data)


        logger.info("res", res.data)


        /**
        * @purpose : update labelName that is present in database or not
        * @return {String} message
        */
        var labelFind = await issueModel.find({ label: params.labelName[0] })

        if (labelFind.length > 0) {
            return { "message": "label is already present in database" }
        }


        // label update in mongodb
        var updateLabel = await issueModel.findOneAndUpdate({ issueNumber: params.issueNumber },
            {
                $set: {
                    label: params.labelName
                }
            })
        if (!updateLabel) {
            return { "message": "label not added in issue" }
        }

        //return the response
        return {
            "message": "Label Updated successfully",
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "Label is not updated" }
    }
}







/***********************************************************  deleteLabelInGit  ********************************************************/
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
        logger.info("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (DELETE), DELETE data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var url = `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/labels/${params.labelName}`


        //send to axios_services and take response from it
        var res = await axios_data('DELETE', url, access_token)

        logger.info("res", res)

        //return the response
        return {
            "message": "Label delete successfully",
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "Label is not deleted" }
    }
}








/**********************************************************   GetLabelList   *********************************************************/
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
        logger.info("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (GET), GET data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var url = `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/labels`


        //send to axios_services and take response from it
        var res = await axios_data('GET', url, access_token)

        logger.info("res", res)

        //return the response
        return {
            "message": "Label Data Fetch successfully",
            "data": res.data
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "Label data not fetch successfully" }
    }
}






/************************************************************   addLabelInIssue   *******************************************************/
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
        logger.info("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (GET), GET data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var url = `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/issues/${params.issueNumber}/labels`
        var data =
        {
            "labels": params.labelName
        }



        //send to axios_services and take response from it
        var res = await axios_data('POST', url, access_token, data)

        //print
        logger.info("res", res.data)


        /**
         * @purpose : find labelName that is present in database or not
         * @return {String} message
         */
        var labelFind = await issueModel.find({ label: params.labelName[0], issueNumber: params.issueNumber })
        logger.info("findLabel : ",labelFind)
        if (labelFind.length > 0) {
            return { "message": "label is already present in database" }
        }


        // label update in mongodb
        var updateLabel = await issueModel.findOneAndUpdate({ issueNumber: params.issueNumber },
            {
                $push: {
                    label: params.labelName
                }
            })
        if (!updateLabel) {
            return { "message": "label not added in issue" }
        }


        //return the response
        return {
            "message": "add label in issue successfully",
            "data": res.data
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "label not added in issue" }
    }
}






/*********************************************************  removeLabelFromIssue  **********************************************************/
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
        logger.info("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (DELETE), DELETE data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var url = `${process.env.DELETE_BRANCH}${params.OwnerName}/${params.repoName}/issues/${params.issueNumber}/labels/${params.labelName}`


        //send to axios_services and take response from it
        await axios_data('DELETE', url, access_token)


        //return the response
        return {
            "message": "remove label from issue successfully",
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "label not removed from issue" }
    }
}







/**
* @exports userAddLabelMutation
*/
module.exports = new userAddLabelMutation()
