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
        var url = `${process.env.GIT_CODE}?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.GIT_LINK}&scope=repo`

        //sent mail to the mail id
        var mail = sendMail.sendEmailFunction(url, params.email)
        if (!mail) {
            return { "message": "mail not sent" }
        }
        return {
            "message": "Mail sent to your mail ID"
        }

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
     * @function (Axios), which is used to handle http request
     * @method (get), Get data from response when hit the url
     * @param {String}, post a url and then response will given token
     * @headers : application/json
     * @function getToken, has token
     */
    axios({
        method: 'post',
        url: `${process.env.GIT_ACCESS}client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${context.code}`,
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

        /**
       * @function (Axios), which is used to handle http request
       * @method (get), Get data from response when hit the url
       * @param {headers}
       * @purpose : get response from given url
       */
        axios({
            method: 'get',
            url: `${process.env.GET_RESPONSE}access_token=${access_token}`,
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
                var token = await jwt.sign({ "userID": saveuser.id, "id": response.data.id, "login": response.data.login }, process.env.SECRET_KEY, { expiresIn: 86400000 })

                //send mail to the given mail id
                var url = `http://localhost:4000?token=${token}`
                sendMail.sendEmailFunction(url, response.data.email)


                if (!saveuser.id.length > 0) {
                    return { "message": "data not save successfully" }
                }
                return {
                    "message": "Data save successfully",
                    "token": token
                }
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
            url: `${process.env.GIT_REPOSITORY}access_token=${access_token}`,
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
                    model.save()
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
 * @description : addWatchInGitRepo APIs for add watch repository Details using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.addWatchInGitRepo = async (root, params, context) => {
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
         * @method (PUT), Get data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        axios({
            method: 'PUT',
            url: `${process.env.ADD_WATCH_IN_GIT}${params.gitUsername}/${params.repoName}`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }

        }).then((res) => {
            console.log("Repository Branch Name : ", res);
        })

        return { "message": "Watch add successfully in Git Repository" }

    } catch (err) {
        console.log("!Error", err)
        return { "message": "Watch is not added in Github" }
    }
}







/*******************************************************************************************************************/
/**
 * @description : deleteWatchInGitRepo APIs for delete watch from repository Details using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.deleteWatchInGitRepo = async (root, params, context) => {
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
         * @method (DELETE), Get data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        axios({
            method: 'DELETE',
            url: `${process.env.DELETE_WATCH_IN_GIT_REPO}${params.gitUsername}/${params.repoName}/subscription`,
            headers: {
                Authorization: `Bearer ${access_token}`
            },

        }).then((res) => {
            console.log("Repository Branch Name : ", res);
        })

        return { "message": "Watch Remove successfully from Git Repository" }

    } catch (err) {
        console.log("!Error", err)
        return { "message": "Watch is not removed from Github" }
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
        var access_token = user[0].access_Token
        //console.log("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (get), Get data in response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'get',
            url: `${process.env.GET_CREATE_BRANCH}${params.gitUsername}/${params.repoName}/git/refs/heads`,
            headers: {
                Authorization: `Bearer ${access_token}`
            },

        })

        //console.log("\nRepository Branch Response Data : ", res.data);
        //console.log("\nRepository Branch Object Data : ", res.data[0].object.sha);
        var access_token1 = user[0].access_Token

        /**
         * @function (Axios), which is used to handle http request
         * @method (post), DELETE data from response when hit the url
         * @param {headers}
         * @Data : send the given data depend on what you doing
         * @purpose : get response from given url
         */
        await axios({
            method: 'post',
            url: `${process.env.POST_CREATE_BRANCH}${params.gitUsername}/${params.repoName}/git/refs`,
            headers: {
                Authorization: `Bearer ${access_token1}`
            },
            data: JSON.stringify({
                'ref': `refs/heads/${params.newBranch}`,
                'sha': `${res.data[0].object.sha}`
            }),

        })
        // console.log("\nRepository Branch after post Data : ", branchResponse.data);

        return { "message": "git branch create Successfully" }

    } catch (err) {
        //console.log("!Error in catch : ", err)
        return { "message": "This branch is not created in Repository" }
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
        var access_token = user[0].access_Token
        console.log("access_token", access_token)


        /**
         * @function (Axios), which is used to handle http request
         * @method (DELETE), DELETE data from response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        await axios({
            method: 'DELETE',
            url: `${process.env.DELETE_BRANCH}${params.gitUsername}/${params.repoName}/git/refs/heads/${params.DeleteBranch}`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        // console.log("\nRepository Branch Response Data : ", res);

        return { "message": "git branch delete Successfully" }

    } catch (err) {
        //console.log("!Error", err)
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
        console.log("acccess_token", access_token);



        //get response from given url
        const fetch = createApolloFetch({
            uri: `${process.env.GIT_FETCH_REPO}${access_token}`
        });

        const res = await fetch({
            query: `{ repositoryOwner(login: ${params.login_Name}) { id login avatarUrl repositories(first:10){ nodes{ isPrivate name description} } } }`,
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
                notesmodel.save()
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
        console.log(typeof (process.env.GIT_ID));



        //fetch repository data from github
        const fetch = createApolloFetch({
            uri: `${process.env.GIT_FETCH_REPO}${access_token}`
        });


        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {addStar(input: {starrableId: "${process.env.GIT_ID}" clientMutationId:"${gitNodeID}"}) { clientMutationId}}`,
        })

        console.log("res", res)

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
            uri: `${process.env.APOLLO_REPO_FETCH}${access_token}`
        });



        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {removeStar(input: {starrableId: "${process.env.GIT_ID}" clientMutationId:"${gitNodeID}"}) { clientMutationId}}`,
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







/*******************************************************************************************************************/
/**
 * @description : createGitBranch APIs for create Branch in github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.createGitRepository = async (root, params, context) => {
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
         * @method (get), Get data in response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'POST',
            url: `${process.env.CREATE_REPO}`,
            headers: {
                Authorization: `Bearer ${access_token}`
            },
            data: JSON.stringify({
                'name': `${params.repoName}`,
            })

        })

        console.log("\nRepository Branch Response Data : ", res);
        console.log("\nRepository Branch Object Data : ", res.data[0]);

        return { "message": "Repository created Successfully" }

    } catch (err) {
        console.log("!Error in catch : ", err)
        return { "message": "This Repository is already present" }
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
gitAuthMutation.prototype.removeGitRepository = async (root, params, context) => {
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
         * @method (get), Get data in response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'DELETE',
            url: `${process.env.DELETE_REPO}${params.ownerName}/${params.repoName}`,
            headers: {
                Authorization: `Bearer ${process.env.DELETE_TOKEN}`
            }

        })

        console.log("\nRepository Branch Response Data : ", res);
        console.log("\nRepository Branch Object Data : ", res.data[0]);

        return { "message": "Repository deleted Successfully" }

    } catch (err) {
        console.log("!Error in catch : ", err)
        return { "message": "This Repository is not present" }
    }
}







/*******************************************************************************************************************/
/**
 * @description : Change Status APIs for change the status in github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.changeStatusInGithub = async (root, params, context) => {
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

        // Access_token from github
        var access_token = process.env.USER_TOKEN_FOR_STATUS

        //fetch github data from github
        const fetch = createApolloFetch({
            uri: `${process.env.GIT_FETCH_REPO}${access_token}`
        });


        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {changeUserStatus(input:{message:${params.status}}){status{message}}}`,
        })

        console.log("res", res)

        return {
            "message": "Status updated successfully",
        }

    } catch (err) {
        console.log("!Error", err)
        return { "message": err }
    }
}





/*******************************************************************************************************************/
/**
 * @description : gitRepoCommits APIs for fetch commits from github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.gitRepoCommits = async (root, params, context) => {
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
         * @method (get), Get data in response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'GET',
            url: `${process.env.DELETE_REPO}${params.ownerName}/${params.repoName}/commits`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }

        })

        console.log("res", res.data[0]);


        //create a for loop for seprate data
        for (var i = 0; i < res.data.length; i++) {
            console.log("\nRepository Commits Details  : ", res.data[i].commit.committer)
            console.log("Repository Commits message  : ", res.data[i].commit.message);
        }

        return {
            "message": "commits fetch successfully",
            "data": res.data
        }
    } catch (err) {
        console.log("!Error in catch : ", err)
        return { "message": "Repository commits fetch UnSuccessfully" }
    }
}







/*******************************************************************************************************************/
/**
 * @description : gitRepoWebhook APIs for create a webhook in github using apollo-graphql
 * @purpose : For gitAuth verification by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} token
 */
gitAuthMutation.prototype.gitRepoWebhook = async (root, params, context) => {
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
        var access_token = process.env.GIT_REPO_TOKEN
        console.log(access_token);


        /**
         * @function (Axios), which is used to handle http request
         * @method (POST), post  data in response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var res = await axios({
            method: 'POST',
            url: `${process.env.DELETE_REPO}${params.ownerName}/${params.repoName}/hooks`,
            headers: {
                Authorization: `Bearer ${access_token}`
            },
            data: JSON.stringify({
                "active": true,
                "events": [
                    "push",
                    "pull_request"
                ],
                "config": {
                    "url": `${params.url}`,
                    "content_type": "json",
                    "insecure_ssl": "0"
                }
            }),
        })

        console.log("\nGithub response : ", res)
        return {
            "message": "Repository webhook response successfully",
        }

    } catch (err) {
        console.log("!Error in catch : ", err)
        return { "message": "Repository webhook response Unsuccessfully" }
    }
}







/**
* @exports gitAuthMutation
*/
module.exports = new gitAuthMutation()