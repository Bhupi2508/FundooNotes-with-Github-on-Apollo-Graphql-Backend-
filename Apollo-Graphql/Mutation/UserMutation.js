/********************************************************************************************************************
 *  @Execution      : default node          : cmd> userMutations.js
 *                      
 * 
 *  @Purpose        : perform operations by using users
 * 
 *  @description    : By using mutation we can manipulate the data (CURD)
 * 
 *  @overview       : fundoo application  
 *  @author         : Bhupendra Singh
 *  @version        : 1.0
 *  @since          : 27-april-2019
 *
 *******************************************************************************************************************/
/**
 * @requires files
 */
const { AuthenticationError } = require('apollo-server')
var redis = require('async-redis')
var bcrypt = require('bcrypt')
var userModel = require('../../model/userSchema')
var labelModel = require('../../model/labelSchema')
var sendMail = require('../../sendMailer/sendMail')
var logger = require('../../services/logger');
var { errorResponse } = require('../../services/errors');
var tokenVerify = require('../../Authentication/authenticationUser')

//create a redis client
var client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT
})

//base URL put into emailed links (override with APP_URL)
function appUrl(context) {
    return process.env.APP_URL || (context && context.origin) || `http://localhost:${process.env.PORT}`
}

//saltrounds for hash password
var saltRounds = 10;

//create a empty function
var userMutation = function () { }




/*********************************************************     signup     **********************************************************/
/**
 * @description : register APIs for register a new user using apollo-graphql
 * @purpose : register user in database
 * @param {root}, which has data information
 * @param {params}, input by users
 * @param {context}, req from queries, headers, server
 */
userMutation.prototype.signup = async (root, params, context) => {

    try {

        //for email validation
        var emailformat = (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

        if (!emailformat.test(params.email)) {
            //throw new AuthenticationError('not valid email');
            return { "message": "not valid email", }
        }



        /**
         * @param {number}, password validation 
         */
        if (params.password.length < 8) {
            //throw new AuthenticationError('Enter pasword more than 8 letters ');
            return { "message": "Enter pasword more than 8 letters " }
        }



        //for email id cheking
        var verify = await userModel.find({ "email": params.email })
        if (verify.length > 0) {
            //throw new AuthenticationError('email already exists');
            return { "message": "email already exists" }
        }



        //for bcrypt password
        params.password = await bcrypt.hash(params.password, saltRounds)
        var usersMdl = new userModel(params)



        //save in database
        const uModel = await usersMdl.save();
        if (!uModel) {
            //throw new AuthenticationError('Register unsuccessfull');
            return { "message": "Register unsuccessfull" }
        } else {

            /**
             * @param {token}, a token and send for verification
             */
            var token = tokenVerify.sign({ email: params.email }, '1d')



            // var url = `${process.env.link}${token}`
            /**
             * @purpose : we can also use origin(port) from headers for 
             *             query, instead of hard code
             * @param {String} token
             */
            var url = `${appUrl(context)}?token=${token}`


            //send mail
            await sendMail.sendEmailFunction(url, params.email)


            //return the response
            return {
                "message": "Register successfull, check your mail to verify the email",
                "token": tokenVerify.tokenForResponse(token)
            }
        }


    }
    catch (err) {
        return errorResponse(err)
    }

}




/*****************************************************    emailVerify    **************************************************************/
/**
 * @description : emailverification APIs for verify a email that is valid or not using apollo-graphql
 * @purpose : For register emailverification by using CURD operation
 * @param {root}, which has data information
 * @param {params}, input by users
 * @param {context}, req from queries, headers, server
 */
userMutation.prototype.emailVerify = async (root, params, context) => {
    try {


        /**
         * @param {token}, send token for verify
         * @returns {String} message, token verification
         */
        var afterVerify = tokenVerify.verification(context.token)
        if (!afterVerify || !afterVerify.email) {
            //throw new AuthenticationError('token is not verify');
            return { "message": "token is not verify" }
        }



        /**
         * @param {String} email
         * @returns {String} message
         * @param {$set}, for verification
         */
        var update = await userModel.updateOne({ "email": afterVerify.email },
            { $set: { verification: true } },
            { new: true })


        if (!update) {
            //throw new AuthenticationError('verification unsuccessfull');
            return { "message": "verification unsuccessfull" }
        }

        //return the response
        return { "message": "verification successfull" }


    } catch (err) {
        return errorResponse(err)
    }
}





/*****************************************************    login    **************************************************************/
/**
 * @description : Login APIs for login user using apollo-graphql
 * @purpose : For login user by which is already exists in database using CURD operation
 * @param {root}, which has data information
 * @param {params}, input by users
 * @param {context}, req from queries, headers, server
 */
userMutation.prototype.login = async (root, params, context) => {

    try {

        //regex for email
        var emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        /**
         * @return {String} message
         */
        if (!emailformat.test(params.email)) {
            logger.error("not valid email")
            throw new AuthenticationError('not valid email');
            //return { "message": "not valid email" }
        }



        //find email that is present in database or not
        var user = await userModel.find({ "email": params.email })
        if (!user.length > 0) {
            throw new AuthenticationError('email is not present');
            //return { "message": "email is not present" }
        }


        if (user[0].verification === false) {
            //throw new AuthenticationError('Email not verified');
            return { "message": "Email not verified" }
        }


        /**
         * @param {token}, generate a token with expire time and provide a secret key
         */
        var token = tokenVerify.sign({ email: params.email, userID: user[0].id })



        //create a url
        //var url = `${appUrl(context)}?token=${token}`



        //take id for current user from database
        var id = user[0].id



        //compare password that is present in database or not
        const valid = await bcrypt.compare(params.password, user[0].password)
        if (!valid) {
            throw new AuthenticationError('unauthonticate password');
            //return { "message": "unauthonticate password" }
        }


        //find user Id from database
        var labelFind = await labelModel.find({ userID: user[0]._id })

        //set the labels in redis
        await client.set('labels' + user[0]._id, JSON.stringify(labelFind))


        /**
         * @return {token}
         * @return {number} id
         * @return {String} message, response
         */
        return {
            "token": token,
            "id": id,
            "message": "!Login....Successfully"
        }

    }

    catch (err) {
        return errorResponse(err)
    }
}





/*******************************************************   forgotPassword   ************************************************************/
/**
 * @description : forgotPassword APIs for updatePassword user using apollo-graphql
 * @purpose : For deletion by using CURD operation
 * @param {*} root
 * @param {*} params
 */
userMutation.prototype.forgotPassword = async (root, params, context) => {

    try {

        //regex for email
        var emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


        /**
         * @purpose : check that email is valid or not
         * @return {String} message
         */
        if (!emailformat.test(params.email)) {
            //throw new AuthenticationError('not valid email');
            return { "message": "not valid email" }
        }



        /**
         * @purpose : find email that is present in database or not
         * @return {String} message
         */
        var user = await userModel.find({ "email": params.email })
        if (!user.length > 0) {
            //throw new AuthenticationError('email is not present in database');
            return { "message": "email is not present in database" }
        }



        /**
         * @purpose : generate a token for send a mail
         */
        var token = tokenVerify.sign({ email: params.email }, '1h');



        //send token to sendmail function, which is send to the link(token)
        var url = `${appUrl(context)}?token=${token}`
        //var url = `${context.origin}/graphql?token=${token}`



        /**
         * @param {token}, for sending mail to the mail
         * @returns {String} message
         */
        var mail = await sendMail.sendEmailFunction(url, params.email)
        if (!mail.sent && process.env.NODE_ENV !== "test") {
            return { "message": "!Error, mail not send " }
        }

        //return the response
        return {
            "message": "Mail sent to your given email id",
            "token": tokenVerify.tokenForResponse(token)
        }



    } catch (err) {
        return errorResponse(err)
    }
}




/***************************************************    resetPassword    ****************************************************************/
/**
 * @description : resetPassword APIs for resetPassword user using apollo-graphql
 * @purpose : For resetPassword by using CURD operation
 * @param {*} root
 * @param {*} params
 * @param {*} context 
 */
userMutation.prototype.resetPassword = async (root, params, context) => {
    try {


        /**
         * @purpose : for token verification
         * @returns {String} message
         */
        var afterVerify = tokenVerify.verification(context.token)
        if (!afterVerify || !afterVerify.email) {
            //throw new AuthenticationError('token is not verify');
            return { "message": "token is not verify" }
        }



        //password matching
        if (params.newPassword != params.confirmPassword) {
            //throw new AuthenticationError('password and confirm password are not match');
            return { "message": "password and confirm password are not match" }
        }



        //bcrypt new password
        params.newPassword = await bcrypt.hash(params.newPassword, saltRounds)



        /**
         * @purpose : for updated password
         * @param {String}, message
         * @param {$set}, new passowrd in database
         * @returns {String} message
         */
        var update = await userModel.updateOne({ "email": afterVerify.email },
            { $set: { password: params.newPassword } },
            { new: true })

        if (!update) {
            //throw new AuthenticationError('Password not reset');
            return { "message": "Password not reset" }
        }

        //return the response
        return { "message": "resetPassword Successfully" }

    } catch (err) {
        return errorResponse(err)
    }
}




/*****************************************************     update    **************************************************************/
/**
 * @description : update APIs for updateUser data using apollo-graphql
 * @purpose : For updation by using CURD operation
 * @param {*} root
 * @param {*} params
 */
userMutation.prototype.update = async (root, params, context) => {

    try {
        tokenVerify.requireUser(context)


        /** 
        * @purpose : for token v erification
        * @returns {String} mess age
        */
        var afterVerify = tokenVerify.verification(context.token)
        if (!afterVerify > 0) {
            //throw new AuthenticationError('token is not verify');
            return { "message": "token is not verify" }
        }

        var update = await userModel.updateOne({ _id: afterVerify.userID },
            {
                $set:
                {
                    firstName: params.firstName,
                }
            },
            { new: true }
        )

        if (!update) {
            //throw new AuthenticationError('check user id or name, try again');
            return { "message": "check user id or name, try again" }
        }

        //return the response
        return { "message": "user update successfully" };


    } catch (err) {
        return errorResponse(err)
    }
}




/*********************************************************     remove     **********************************************************/
/**
 * @description : REMOVE APIs for remove data from database using apollo-graphql
 * @purpose : remove user from database by using CURD operation
 * @param {*} root
 * @param {*} params
 * @returns {number} remove user id
 */
userMutation.prototype.remove = async (root, params, context) => {

    try {
        //only the account owner may delete the account
        var payload = tokenVerify.requireUser(context)
        if (String(params.id) !== String(payload.userID)) {
            return { "message": "You can only delete your own account" }
        }


        //find id and remove from the user Data
        const removeduser = await userModel.findByIdAndRemove(params.id).exec();

        if (!removeduser) {
            //throw new AuthenticationError('check user id, try again');
            return { "message": "check user id, try again" }
        }

        //return the response
        return { "message": "user delete successfully" };


    } catch (err) {
        return errorResponse(err)
    }
}

/**
 * @exports userMutation
 */
module.exports = new userMutation()