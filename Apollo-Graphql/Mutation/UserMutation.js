/********************************************************************************************************************
 *  @Execution      : default node          : cmd> userMutations.js
 *                      
 * 
 *  @Purpose        : perform operations by using users
 * 
 *  @description    : By using mutation we can manipulate the data (CURD)
 * 
 *  @overview       : fundoo application  
 *  @author         : Bhupendra Singh <bhupendrasingh.ec18@gmail.com>
 *  @version        : 1.0
 *  @since          : 27-april-2019
 *
 *******************************************************************************************************************/
/**
 * @requires files
 */
var redis = require('redis')
var bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
var userModel = require('../../model/userSchema')
var sendMail = require('../../sendMailer/sendMail')
var tokenVerify = require('../../Authentication/authenticationUser')

//create a redis client
var client = redis.createClient()

//saltrounds for hash password
var saltRounds = 10;

//create a empty function
var userMutation = function () { }


/*******************************************************************************************************************/
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
            return { "message": "not valid email", }
        }

        /**
         * @param {number}, password validation 
         */
        if (params.password.length < 8) {
            return { "message": "Enter pasword more than 8 letters " }
        }

        //for email id cheking
        verify = await userModel.find({ "email": params.email })
        if (verify.length > 0) {
            return { "message": "email already exists" }
        }

        //for bcrypt password
        params.password = await bcrypt.hashSync(params.password, saltRounds)
        const usersMdl = new userModel(params)

        //save in database
        const uModel = usersMdl.save();
        if (!uModel) {
            return { "message": "Register unsuccessfull" }
        } else {

            /**
             * @param {token}, a token and send for verification
             */
            var token = jsonwebtoken.sign({ email: params.email }, process.env.secretKey, { expiresIn: 86400000 })

            /**
             * @purpose : redis cache, save data in ram
             * @returns {String} message
             */
            client.set('token', token)
            client.get('token', function (error, result) {

                if (error) {
                    return { "message": "Redis cache cannot get result" }
                }
                // console.log('Get result from redis -> ' + result);
            });

            /**
             * @param {token}, send token for verification to the mail
             * @returns {String} message
             */

            // var url = `${process.env.link}${token}`
            /**
             * @purpose : we can also use origin(port) from headers for 
             *             query, instead of hard code
             * @param {String} token
             */
            var url = `${context.origin}?token=${token}`

            sendMail.sendEmailFunction(url, params.email)
            return { "message": "Register successfull" }
        }
    } catch (err) {
        console.log("!Error")
        return { "message": err }
    }
}




/*******************************************************************************************************************/
/**
 * @description : emailverification APIs for verify a eamil that is valid or not using apollo-graphql
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
        if (!afterVerify > 0) {
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
            return { "message": "verification unsuccessfull" }
        }
        return { "message": "verification successfull" }

    } catch (err) {
        console.log("!Error")
        return { "message": err }
    }
}





/*******************************************************************************************************************/
/**
 * @description : Login APIs for login user using apollo-graphql
 * @purpose : For login user by which is already exists in database using CURD operation
 * @param {root}, which has data information
 * @param {params}, input by users
 * @param {context}, req from queries, headers, server
 */
userMutation.prototype.login = async (root, params, context) => {

    try {
        var emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        /**
         * @return {String} message
         */
        if (!emailformat.test(params.email)) {
            return { "message": "not valid email" }
        }

        //find email that is present in database or not
        user = await userModel.find({ "email": params.email })
        if (!user.length > 0) {
            return { "message": "email is not present" }
        }
        if (user[0].verification === false) {
            return { "message": "Email not verified" }
        }

        /**
         * @param {token}, generate a token with expire time and provide a secret key
         */
        var token = jsonwebtoken.sign({ email: params.email, userID: user[0].id }, process.env.secretKey, { expiresIn: 86400000 })

        //create a url
        var url = `${context.origin}?token=${token}`

        //send to mail
        sendMail.sendEmailFunction(url, params.email)

        //take id for current user from database
        var id = user[0].id

        //compare password that is present in database or not
        const valid = await bcrypt.compare(params.password, user[0].password)

        if (!valid) {
            return { "message": "unauthonticate password" }
        }

        /**
         * @return {token}
         * @return {number} id
         * @return {String} message
         */
        return {
            "token": token,
            "id": id,
            "message": "!Login....Successfully"
        }

    } catch (err) {
        console.log("!Error")
        return { "message": err }
    }
}





/*******************************************************************************************************************/
/**
 * @description : forgotPassword APIs for updatePassword user using apollo-graphql
 * @purpose : For deletion by using CURD operation
 * @param {*} root
 * @param {*} params
 */
userMutation.prototype.forgotPassword = async (root, params, context) => {

    try {
        var emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        /**
         * @purpose : check that email is valid or not
         * @return {String} message
         */
        if (!emailformat.test(params.email)) {
            return { "message": "not valid email" }
        }

        /**
         * @purpose : find email that is present in database or not
         * @return {String} message
         */
        user = await userModel.find({ "email": params.email })
        if (!user.length > 0) {
            return { "message": "email is not present in database" }
        }

        /**
         * @purpose : generate a token for send a mail
         */
        var token = jsonwebtoken.sign({ email: params.email }, process.env.secretKey, { expiresIn: 86400000 });

        //send token to sendmail function, which is send to the link(token)
        var url = `${context.origin}?token=${token}`
        //var url = `${context.origin}/graphql?token=${token}`

        /**
         * @param {token}, for sending mail to the mail
         * @returns {String} message
         */
        var mail = sendMail.sendEmailFunction(url, params.email)
        if (!mail > 0) {
            return { "mesage": "!Error, mail not send " }
        }
        return { "message": "Mail sent to your given email id" }

    } catch (err) {
        console.log("!Error")
        return { "message": err }
    }
}




/*******************************************************************************************************************/
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
        if (!afterVerify > 0) {
            return { "message": "token is not verify" }
        }

        //password matching
        if (params.newPassword != params.confirmPassword) {
            return { "message": "password and confirm password are not match" }
        }

        //bcrypt new password
        params.newPassword = await bcrypt.hashSync(params.newPassword, saltRounds)

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
            return { "message": "Password not reset" }
        }
        return { "message": "resetPassword Successfully" }

    } catch (err) {
        console.log("!Error")
        return { "message": err }
    }
}




/*******************************************************************************************************************/
/**
 * @description : update APIs for updateUser data using apollo-graphql
 * @purpose : For updation by using CURD operation
 * @param {*} root
 * @param {*} params
 */
userMutation.prototype.update = async (root, params, context) => {

    try {

        /**
        * @purpose : for token verification
        * @returns {String} message
        */
        var afterVerify = tokenVerify.verification(context.token)
        if (!afterVerify > 0) {
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
            return { "message": "check user id or name, try again" }
        }
        return { "message": "user update successfully" };


    } catch (err) {
        console.log("!Error in catch")
        return { "message": err }
    }
}




/*******************************************************************************************************************/
/**
 * @description : REMOVE APIs for remove data from database using apollo-graphql
 * @purpose : remove user from database by using CURD operation
 * @param {*} root
 * @param {*} params
 * @returns {number} remove user id
 */
userMutation.prototype.remove = async (root, params) => {

    try {
        //find id and remove from the user Data
        const removeduser = await userModel.findByIdAndRemove(params.id).exec();
        if (!removeduser) {
            return { "message": "check user id, try again" }
        }
        return { "message": "user delete successfully" };

    } catch (err) {
        console.log("!Error")
        return { "message": err }
    }
}

/**
 * @exports userMutation
 */
module.exports = new userMutation()