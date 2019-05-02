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
        var url = `https://github.com/login/oauth/authorize?client_id=${process.env.ClientID}&redirect_uri=${process.env.Git_Link}`

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
        url: `https://github.com/login/oauth/access_token?client_id=${process.env.ClientID}&client_secret=${process.env.ClientSecret}&code=${context.code}`,
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
            url: `https://api.github.com/user?access_token=${access_token}`,
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
@description : pullGitRepository APIs for fetching repository Details using apollo-graphql
@purpose : For gitAuth verification by using CURD operation
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



        //get response from given url
        axios({
            method: 'get',
            url: `https://api.github.com/user/repos?access_token=${access_token}`,
            headers: {
                accept: 'application/json'
            }
        }).then((res) => {

            for (var i = 0; i < res.data.length; i++) {
                console.log("\n", i, ". Repository Names : ", res.data[i].name)
                console.log(i, ". Repository Description : ", res.data[i].description)

                for (var j = 0; j < res.data.length; j++) {
                    var findRepo = noteModel.find({ "title": res.data[j].name })

                    //save those data in user database
                    var model = new noteModel({
                        title: res.data[i].name,
                        description: res.data[i].description,
                        userID: afterVerify.userID
                    });

                    continue
                }
                //save data in database
                const note = model.save()
            }
        })

        return { "message": "note added successfully" }

    } catch (err) {
        console.log("!Error", err)
        return { "message": err }
    }
}


/**
* @exports gitAuthMutation
*/
module.exports = new gitAuthMutation()