/********************************************************************************************************************
 *  @Execution      : default node          : cmd> userMutations.js
 *                      
 * 
 *  @Purpose        : perform operations by using users
 * 
 *  @description    : By mutation create a new files
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
var userModel = require('../../model/mongoSchema')
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
@description : register a APIs for register a new user using apollo-graphql
@purpose : For register a new data by using CURD operation
*/
userMutation.prototype.signup = async(root,params,context) => {

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

            console.log(context.origin);
            
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
@description : emailverification APIs for verify a eamil that is valid or not using apollo-graphql
@purpose : For regisemailverification by using CURD operation
*/
userMutation.prototype.emailVerify = async(root,params,context) => {
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

/**
 * @exports userMutation
 */
module.exports = new userMutation()