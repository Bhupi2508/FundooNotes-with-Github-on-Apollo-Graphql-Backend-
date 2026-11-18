/********************************************************************************************************************
 *  @Execution      : default node          : cmd> gitAuthMutation.js
 *                      
 * 
 *  @Purpose        : socail OAuth login for github by apollo-graphql 
 * 
 *  @description    : By mutation give path for github server a new files
 * 
 *  @overview       : fundoo application  
 *  @author         : Bhupendra Singh
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
var tokenVerify = require('../../Authentication/authenticationUser')
var axios_service = require('../../services/axios-services').axiosService
var logger = require('../../services/logger');
var { errorResponse } = require('../../services/errors');

//create a empty function
var gitAuthMutation = function () { }


/********************************************************    GithubAuth    ***********************************************************/
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
        var mail = await sendMail.sendEmailFunction(url, params.email)
        if (!mail.sent) {
            return { "message": "mail not sent" }
        }

        //return the response
        return {
            "message": "Mail sent to your mail ID"
        }

    } catch (err) {
        return errorResponse(err)
    }
}






/***********************************************************    codeVerify    ********************************************************/
/**
 * @description : code verify for auth2.0 for github login using apollo-graphql
 * @purpose : For fetch data by using CURD operation
 * @param {*} root
 */
gitAuthMutation.prototype.codeVerify = async (root, params, context) => {
    try {
        if (!context.code) {
            return { "message": "GitHub code not provided (?code=...)" }
        }

        // 1. exchange the one-time OAuth code for an access token
        var tokenResponse = await axios({
            method: 'post',
            url: process.env.GIT_ACCESS,
            headers: { accept: 'application/json' },
            data: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code: context.code
            }
        })
        var access_token = tokenResponse.data.access_token
        if (!access_token) {
            return { "message": "GitHub did not return an access token (code expired or invalid)" }
        }

        // 2. fetch the GitHub profile with that token (sent as a header, never in the URL)
        var profile = await axios({
            method: 'get',
            url: process.env.GET_RESPONSE,
            headers: { accept: 'application/json', Authorization: `Bearer ${access_token}` }
        })

        // 3. create the user on first login, refresh the token afterwards
        var saveuser = await model.findOneAndUpdate(
            { gitID: String(profile.data.id) },
            {
                $set: {
                    loginName: profile.data.login,
                    gitNodeID: profile.data.node_id,
                    access_Token: access_token
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        // 4. app token, mailed as a link; GitAuthTokenVerify marks the account as verified
        var token = tokenVerify.sign({ "userID": saveuser.id, "id": profile.data.id, "login": profile.data.login }, '1d')
        var url = `${process.env.APP_URL || 'http://localhost:' + process.env.PORT}?token=${token}`
        var recipient = profile.data.email || params.email
        if (recipient) {
            await sendMail.sendEmailFunction(url, recipient)
        }
        return {
            "message": "Data save successfully",
            "token": tokenVerify.tokenForResponse(token)
        }
    } catch (err) {
        return errorResponse(err)
    }
}





/*****************************************************   GitAuthTokenVerify  ************************************************************/
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
            logger.info("id after verification", afterVerify.id);

            //condition
            if (!login) {
                return { "message": "Login unsucessful" }
            }

            //return the response
            return { "message": "login & verification successfull" }
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return errorResponse(err)
    }

}





/*******************************************************   pullGitRepository   ***********************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
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
            url: process.env.GIT_REPOSITORY,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${access_token}`
            }

        }).then(async (res) => {


            //for loop for save the repository in database
            for (var i = 0; i < res.data.length; i++) {
                logger.info("\n", i, ". Repository Names : ", res.data[i].name)
                logger.info(i, ". Repository Description : ", res.data[i].description)
                logger.info(i, ". Repository watchers : ", res.data[i].watchers)

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

        //return the response
        return { "message": "git  repository fetch Successfully" }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return errorResponse(err)
    }
}





/********************************************************   addWatchInGitRepo   ***********************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
            return { "message": "user not verified" }
        }


        // Access_token
        var access_token = user[0].access_Token;


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
            logger.info("Repository Branch Name : ", res);
        })

        //return the response
        return { "message": "Watch add successfully in Git Repository" }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "Watch is not added in Github" }
    }
}






/********************************************************   deleteWatchInGitRepo   *******************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
            return { "message": "user not verified" }
        }


        // Access_token
        var access_token = user[0].access_Token


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
            logger.info("Repository Branch Name : ", res);
        })

        //return the response
        return { "message": "Watch Remove successfully from Git Repository" }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return { "message": "Watch is not removed from Github" }
    }
}






/*******************************************************   createGitBranch   ************************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
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
        var url = `${process.env.GET_CREATE_BRANCH}${params.gitUsername}/${params.repoName}/git/refs/heads`


        //send to axios_services and take response from it
        var res = await axios_service('GET', url, access_token)
        var access_token1 = user[0].access_Token

        /**
         * @function (Axios), which is used to handle http request
         * @method (post), DELETE data from response when hit the url
         * @param {headers}
         * @Data : send the given data depend on what you doing
         * @purpose : get response from given url
         */
        var url_data = `${process.env.POST_CREATE_BRANCH}${params.gitUsername}/${params.repoName}/git/refs`
        var data =
        {
            'ref': `refs/heads/${params.newBranch}`,
            'sha': `${res.data[0].object.sha}`
        }

        //send to axios_services and take response from it
        var res_Data_1 = await axios_service('POST', url_data, access_token1, data)

        logger.info("\nRepository Branch after post Data : ", res_Data_1);

        //return the response
        return { "message": "git branch create Successfully" }

    } catch (err) {
        logger.error("!Error", err)
        return { "message": "This branch is not created in Repository" }
    }
}






/**********************************************************   deleteGitBranch   *********************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
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
        var url = `${process.env.DELETE_BRANCH}${params.gitUsername}/${params.repoName}/git/refs/heads/${params.DeleteBranch}`

        //send to axios_services and take response from it
        await axios_service('DELETE', url, access_token)


        //return the response
        return { "message": "git branch delete Successfully" }

    } catch (err) {
        logger.error("!Error", err)
        return { "message": "This branch not present in Repository" }
    }
}






/*********************************************************   fetchRepository   **********************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
            return { "message": "user not verified" }
        }



        // Access_token
        var access_token = user[0].access_Token;



        //get response from given url
        const fetch = createApolloFetch({ uri: process.env.GIT_FETCH_REPO });
        fetch.use(({ options }, next) => {
            options.headers = Object.assign({}, options.headers, { Authorization: `Bearer ${access_token}` });
            next();
        });

        const res = await fetch({
            query: `{ repositoryOwner(login: ${params.login_Name}) { id login avatarUrl repositories(first:10){ nodes{ isPrivate name description} } } }`,
        })


        //for loop for save the repository in database
        for (var i = 0; i < res.data.repositoryOwner.repositories.nodes.length; i++) {
            logger.info("\n", i, ". Repository Names : ", res.data.repositoryOwner.repositories.nodes[i].name)

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


        //return the response
        return {
            "message": "git  repository fetch Successfully",
            "repo": res.data.repositoryOwner.repositories.nodes
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return errorResponse(err)
    }
}






/*********************************************************   starRepository   **********************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
            return { "message": "user not verified" }
        }



        // Access_token and Git Node ID
        var gitNodeID = user[0].gitNodeID;
        var access_token = user[0].access_Token;



        //fetch repository data from github
        const fetch = createApolloFetch({ uri: process.env.GIT_FETCH_REPO });
        fetch.use(({ options }, next) => {
            options.headers = Object.assign({}, options.headers, { Authorization: `Bearer ${access_token}` });
            next();
        });



        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {addStar(input: {starrableId: "${process.env.GIT_ID}" clientMutationId:"${gitNodeID}"}) { clientMutationId}}`,
        })

        logger.info("res", res)

        //return the response
        return {
            "message": "Star the repository Successfully",
            // "clientMutationId": res.data.addStar.clientMutationId
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return errorResponse(err)
    }
}






/********************************************************  removeStarRepository  ***********************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
            return { "message": "user not verified" }
        }



        // Access_token and Git Node ID
        var gitNodeID = user[0].gitNodeID;
        var access_token = user[0].access_Token;



        //fetch repository data from github
        const fetch = createApolloFetch({ uri: process.env.APOLLO_REPO_FETCH });
        fetch.use(({ options }, next) => {
            options.headers = Object.assign({}, options.headers, { Authorization: `Bearer ${access_token}` });
            next();
        });



        //pass the query mutation for data fetching
        await fetch({
            query: `mutation {removeStar(input: {starrableId: "${process.env.GIT_ID}" clientMutationId:"${gitNodeID}"}) { clientMutationId}}`,
        })


        //return the response
        return {
            "message": "remove Star from repository Successfully",
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return errorResponse(err)
    }
}







/******************************************************  createGitRepository  *************************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
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
        var url = `${process.env.CREATE_REPO}`
        var data =
        {
            'name': `${params.repoName}`,
        }


        //send to axios_services and take response from it
        var res = await axios_service('POST', url, access_token, data)

        logger.info("\nRepository Branch Response Data : ", res);
        logger.info("\nRepository Branch Object Data : ", res.data[0]);


        //return the response
        return { "message": "Repository created Successfully" }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error in catch : ", err)
        return { "message": "This Repository is already present" }
    }
}







/******************************************************  removeGitRepository  *************************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
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
        var url = `${process.env.DELETE_REPO}${params.ownerName}/${params.repoName}`


        //send to axios_services and take response from it
        var res = await axios_service('DELETE', url, access_token)

        logger.info("\nRepository Branch Response Data : ", res);
        logger.info("\nRepository Branch Object Data : ", res.data[0]);


        //return the response
        return { "message": "Repository deleted Successfully" }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error in catch : ", err)
        return { "message": "This Repository is not present" }
    }
}







/***********************************************************  changeStatusInGithub  ********************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
            return { "message": "user not verified" }
        }



        // Access_token from github
        var access_token = user[0].access_Token



        //fetch github data from github
        const fetch = createApolloFetch({ uri: process.env.GIT_FETCH_REPO });
        fetch.use(({ options }, next) => {
            options.headers = Object.assign({}, options.headers, { Authorization: `Bearer ${access_token}` });
            next();
        });



        //pass the query mutation for data fetching
        const res = await fetch({
            query: `mutation {changeUserStatus(input:{message:${params.status}}){status{message}}}`,
        })

        logger.info("res", res)

        //return the response
        return {
            "message": "Status updated successfully",
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error", err)
        return errorResponse(err)
    }
}





/**********************************************************   gitRepoCommits   *********************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
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
        var url = `${process.env.DELETE_REPO}${params.ownerName}/${params.repoName}/commits`


        //send to axios_services and take response from it
        var res = await axios_service('GET', url, access_token)

       logger.info("res", res.data[0]);


        //create a for loop for seprate data
        for (var i = 0; i < res.data.length; i++) {
            logger.info("\nRepository Commits Details  : ", res.data[i].commit.committer)
            logger.info("Repository Commits message  : ", res.data[i].commit.message);
        }

        //return the response
        return {
            "message": "commits fetch successfully",
            "data": res.data
        }
    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error in catch : ", err)
        return { "message": "Repository commits fetch UnSuccessfully" }
    }
}







/*********************************************************   gitRepoWebhook   **********************************************************/
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
        if (!user || !user.length || !user[0].access_Token) {
            return { "message": "user not verified" }
        }



        // Access_token
        var access_token = user[0].access_Token


        /**
         * @function (Axios), which is used to handle http request
         * @method (POST), post  data in response when hit the url
         * @param {headers}
         * @purpose : get response from given url
         */
        var url = `${process.env.DELETE_REPO}${params.ownerName}/${params.repoName}/hooks`
        var data =
        {
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
        }


        //send to axios_services and take response from it
        var res = await axios_service('POST', url, access_token, data)

        logger.info("\nGithub response : ", res)
        //return the response
        return {
            "message": "Repository webhook response successfully",
        }

    } catch (err) {
        logger.error("!Error", err)
        console.log("!Error in catch : ", err)
        return { "message": "Repository webhook response Unsuccessfully" }
    }
}







/**
* @exports gitAuthMutation
*/
module.exports = new gitAuthMutation()