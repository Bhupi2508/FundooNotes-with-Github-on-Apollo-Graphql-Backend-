/********************************************************************************************************************
 *  @Execution      : default node          : cmd> gitAuthMutation.js
 *                      
 * 
 *  @Purpose        : socail OAuth login for github by apollo-graphql 
 * 
 *  @description    : By mutation give path for github server a new files
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
const { createApolloFetch } = require('apollo-fetch')
var sendMail = require('../../sendMailer/sendMail')
var model = require('../../model/userSchema')
var noteModel = require('../../model/noteSchema')
var axios = require('axios')
var jwt = require('jsonwebtoken')
var tokenVerify = require('../../Authentication/authenticationUser')

//create a empty function
var gitAuthMutation = function () { }


/*******************************************************************************************************************/
/**
 * @description : social auth2.0 for github login using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {*} root
 * @param {*} params
 */
gitAuthMutation.prototype.GithubAuth = async (root, params) => {
    try {

        /**
         * @param {String}, create a code, which is redirect in graphiql
         * @returns {String} message
         */
        var url = `${process.env.gitCode}?client_id=${process.env.ClientID}&redirect_uri=${process.env.Git_Link}`

        //sent mail to the mail id
        var mail = sendMail.sendEmailFunction(url, params.email)
        if (!mail) {
            return { "message": "mail not sent" }
        }
        return { "message": "Mail sent to your mail ID" }

    } catch (err) {
        console.log("!Error")
    }
}






/*******************************************************************************************************************/
/**
 * @description : code verify for auth2.0 for github login using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {*} root
 */
gitAuthMutation.prototype.codeVerify = async (root, params, context) => {

    /**
     * @param {String}, post a url and then response will given token
     * @headers : application/json
     * @function getToken, has token
     */
    axios({
        method: 'post',
        url: `${process.env.gitAccess}client_id=${process.env.ClientID}&client_secret=${process.env.ClientSecret}&code=${context.code}`,
        headers: {
            accept: 'application/json',
        }
    }).then(response => {

        // Once we get the response, extract the access token from
        const access_token = response.data.access_token

        //function for access token
        getToken(access_token)
        console.log("Access token : ", access_token)

    })
        .catch(error => {
            console.log(error)
        })


    /**
     * @param {*} access_token 
     * @headers : application/json
     */
    function getToken(access_token) {
        axios({
            method: 'get',
            url: `${process.env.getResponse}access_token=${access_token}`,
            headers: {
                accept: 'application/json',
            }
        })
            .then(async response => {
                console.log("\nResponse.Data : \n", response.data)
                console.log("\nRepository details", response.data.repos_url);


                //save those data in user database
                var gituser = new model({
                    loginName: response.data.login,
                    gitID: response.data.id,
                    gitNodeID: response.data.node_id,
                    access_Token: access_token

                });

                //save data into database
                var saveuser = await gituser.save();
                console.log("\nData : ", saveuser)



                //token created for gitAuth login verification and send to git mail
                var token = await jwt.sign({ "userID": saveuser.id, "id": response.data.id, "login": response.data.login }, process.env.secretKey, { expiresIn: 86400000 })

                //send mail to the given mail id
                var url = `http://localhost:4000?token=${token}`
                sendMail.sendEmailFunction(url, response.data.email)


                if (!saveuser.id.length > 0) {
                    return { "message": "data not save successfully" }
                }
                return { "message": "Data save successfully" }
            })
            .catch(error => {
                console.log(error)
            })
    }

    return { "message": "Data save successfully" }
}






/*******************************************************************************************************************/
/**
@description : tokenverification APIs for verify a eamil that is valid or not using apollo-graphql
@purpose : For gitAuth verification by using CURD operation
*/
gitAuthMutation.prototype.GitAuthTokenVerify = async (root, params, context) => {
    try {

        /**
         * @param {token}, send token for verify
         * @returns {String} message, token verification 
         */
        var afterVerify = tokenVerify.verification(context.token)
        if (!afterVerify > 0) {
            return { "message": "token is not verify" }
        }

        /**
         * @param {String} email
         * @returns {String} message
         * @param {$set}, for verification
         */
        var saveData = await model.updateOne({ "gitID": afterVerify.id }, { $set: { "isGitVerify": true } })
        if (!saveData) {
            return { "message": "verification unsuccessfull" }
        } else {

            //find data from model that is present or not
            var login = await model.find({ "gitID": afterVerify.id, "loginName": afterVerify.login })
            console.log(afterVerify.id);

            if (!login) {
                return { "message": "Login unsucessful" }
            }
            return { "message": "login & verification successfull" }
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": err }
    }

}





/*******************************************************************************************************************/
/**
 * @description : pullGitRepository APIs for fetching repository Details using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.pullGitRepository = async (root, params, context) => {
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
        var access_token = user[0].access_Token;


        /**
        * @function (Axios), which is used to handle http request
        * @method (get), Get data from response when hit the url
        * @param {headers}
        * @purpose : get response from given url
        */
        axios({
            method: 'get',
            url: `${process.env.gitRepository}access_token=${access_token}`,
            headers: {
                accept: 'application/json'
            }

        }).then(async (res) => {


            //for loop for save the repository in database
            for (var i = 0; i < res.data.length; i++) {
                console.log("\n", i, ". Repository Names : ", res.data[i].name)
                console.log(i, ". Repository Description : ", res.data[i].description)
                console.log(i, ". Repository watchers : ", res.data[i].watchers)

                //find title from database
                var findRepo = await noteModel.find({ title: res.data[i].name })
                if (!findRepo.length > 0) {

                    //save those data in user database
                    var model = new noteModel({
                        title: res.data[i].name,
                        description: res.data[i].description,
                        userID: afterVerify.userID
                    });

                    //save data in database
                    const note = model.save()
                }
            }
        })

        return { "message": "git  repository fetch Successfully" }

    } catch (err) {
        console.log("!Error", err)
        return { "message": err }
    }
}







/*******************************************************************************************************************/
/**
 * @description : watchGitBranch APIs for watch repository branch Details using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.watchGitBranch = async (root, params, context) => {
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
        var access_token = user[0].access_Token;
        console.log("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (get), Get data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        axios({
            method: 'get',
            url: `${process.env.gitBranch}access_token=${access_token}`,
            headers: {
                accept: 'application/json'
            }

        }).then((res) => {
            console.log("Repository Branch Name : ", res.data[0].name);
        })

        return { "message": "git branch fetch Successfully" }

    } catch (err) {
        console.log("!Error", err)
        return { "message": err }
    }
}





/*******************************************************************************************************************/
/**
 * @description : createGitBranch APIs for create Branch in github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.createGitBranch = async (root, params, context) => {
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
        var access_token = process.env.gitCreateBranchToken;
        console.log("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (get), Get data in response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'get',
            url: `${process.env.getCreateBranch}${params.gitUsername}/${params.repoName}/git/refs/heads?access_token=${access_token}`,
            headers: {
                accept: 'application/json'
            },

        })
        // .then((res) => {
        console.log("\nRepository Branch Response Data : ", res.data);
        console.log("\nRepository Branch Object Data : ", res.data[0].object.sha);

        /**
         * @function (Axios), which is used to handle http request
         * @method (post), DELETE data from response when hit the url
         * @param {headers}
         * @Data : send the given data depend on what you doing
         * @purpose : get response from given url
         */
        var branchResponse = await axios({
            method: 'post',
            url: `${process.env.postCreateBranch}${params.gitUsername}/${params.repoName}/git/refs?access_token=${access_token}`,
            headers: {
                accept: 'application/json'
            },
            data: JSON.stringify({
                'ref': `refs/heads/${params.newBranch}`,
                'sha': `${res.data[0].object.sha}`
            }),

        })
        console.log("\nRepository Branch after post Data : ", branchResponse.data);

        return { "message": "git branch create Successfully" }

    } catch (err) {
        console.log("!Error in catch : ", err)
        return { "message": "This branch already exists in Repository" }
    }
}






/*******************************************************************************************************************/
/**
 * @description : deleteGitBranch APIs for delete branch from github repository using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.deleteGitBranch = async (root, params, context) => {
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
        var access_token = process.env.gitCreateBranchToken;
        console.log("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (DELETE), DELETE data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'DELETE',
            url: `${process.env.deleteBranch}${params.gitUsername}/${params.repoName}/git/refs/heads/${params.DeleteBranch}?access_token=${access_token}`,
            headers: {
                accept: 'application/json'
            },
        })
        console.log("\nRepository Branch Response Data : ", res);

        return { "message": "git branch delete Successfully" }

    } catch (err) {
        console.log("!Error", err)
        return { "message": "This branch not present in Repository" }
    }
}






/*******************************************************************************************************************/
/**
 * @description : fetchRepository APIs for fetching repository Details using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.fetchRepository = async (root, params, context) => {
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
        var access_token = user[0].access_Token;


        //get response from given url
        const fetch = createApolloFetch({
            uri: `https://api.github.com/graphql?access_token=${access_token}`
        });

        const res = await fetch({
            query: '{ repositoryOwner(login: Bhupi2508) { id login avatarUrl repositories(first:10){ nodes{ isPrivate name description} } } }',
        })

        //for loop for save the repository in database
        for (var i = 0; i < res.data.repositoryOwner.repositories.nodes.length; i++) {
            console.log("\n", i, ". Repository Names : ", res.data.repositoryOwner.repositories.nodes[i].name)
            console.log(i, ". Repository Description : ", res.data.repositoryOwner.repositories.nodes[i].description)
            // console.log(i, ". Repository watchers : ", res.data.repositoryOwner.repositories.nodes[i].watchers)

            //find title from database
            var findRepo = await noteModel.find({ title: res.data.repositoryOwner.repositories.nodes[i].name })
            if (!findRepo.length > 0) {

                //save those data in user database
                var notesmodel = new noteModel({
                    title: res.data.repositoryOwner.repositories.nodes[i].name,
                    description: res.data.repositoryOwner.repositories.nodes[i].description,
                    userID: afterVerify.userID
                });

                //save data in database
                const note = notesmodel.save()
            }
        }

        return {
            "message": "git  repository fetch Successfully",
            "repo": res.data.repositoryOwner.repositories.nodes
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": err }
    }
}






/*******************************************************************************************************************/
/**
 * @description : starRepository APIs for give the star for selected repository Details using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.starRepository = async (root, params, context) => {
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

        // Access_token and Git Node ID
        var gitNodeID = user[0].gitNodeID;
        var access_token = user[0].access_Token;


        //fetch repository data from github
        const fetch = createApolloFetch({
            uri: `https://api.github.com/graphql?access_token=${access_token}`
        });


        //pass the query mutation for data fetching
        const res = await fetch({
            query: 'mutation {addStar(input: {starrableId: "MDEwOlJlcG9zaXRvcnkxODU1NDM1ODk=", clientMutationId:"MDQ6VXNlcjQ3NjM5NjM2"}) { clientMutationId}}',
        })

        console.log(res)

        return {
            "message": "Star the repository Successfully",
            // "clientMutationId": res.data.addStar.clientMutationId
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": err }
    }
}






/*******************************************************************************************************************/
/**
 * @description : removeStarRepository APIs for remove star from git repository using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.removeStarRepository = async (root, params, context) => {
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

        // Access_token and Git Node ID
        var gitNodeID = user[0].gitNodeID;
        var access_token = user[0].access_Token;


        //fetch repository data from github
        const fetch = createApolloFetch({
            uri: `https://api.github.com/graphql?access_token=${access_token}`
        });

        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {addStar(input: {starrableId: "MDEwOlJlcG9zaXRvcnkxODU1NDM1ODk=", clientMutationId:${gitNodeID}}) { clientMutationId}}`,
        })

        console.log(res)
        return {
            "message": "remove Star from repository Successfully",
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": err }
    }
}



/**
* @exports gitAuthMutation
*/
module.exports = new gitAuthMutation()