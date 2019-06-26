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
const { AuthenticationError } = require('apollo-server')
var redis = require('async-redis')
var bcrypt = require('bcrypt')
var jsonwebtoken = require('jsonwebtoken')
var userModel = require('../../model/userSchema')
var labelModel = require('../../model/labelSchema')
var sendMail = require('../../sendMailer/sendMail')
var tokenVerify = require('../../Authentication/authenticationUser')

//create a redis client
var client = redis.createClient({
    host: 'localhost',
    port: process.env.REDIS_PORT
})

//saltrounds for hash password
var saltRounds = 10;

//create a empty function
var userMutation = function () { }

//error message
var errorMessage = {
    "message": "Something bad happend",
}

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
        params.password = await bcrypt.hashSync(params.password, saltRounds)
        var usersMdl = new userModel(params)



        //save in database
        const uModel = usersMdl.save();
        if (!uModel) {
            //throw new AuthenticationError('Register unsuccessfull');
            return { "message": "Register unsuccessfull" }
        } else {

            /**
             * @param {token}, a token and send for verification
             */
            var token = jsonwebtoken.sign({ email: params.email }, process.env.SECRET_KEY, { expiresIn: 86400000 })



            // var url = `${process.env.link}${token}`
            /**
             * @purpose : we can also use origin(port) from headers for 
             *             query, instead of hard code
             * @param {String} token
             */
            var url = `${context.origin}?token=${token}`


            //send mail
            sendMail.sendEmailFunction(url, params.email)


            //return the response
            return {
                "message": "Register successfull",
                "token": token
            }
        }


    }
    catch (err) {
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
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
        if (!afterVerify > 0) {
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
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
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
        var token = jsonwebtoken.sign({ email: params.email, userID: user[0].id }, process.env.SECRET_KEY, { expiresIn: 86400000 })



        //create a url
        //var url = `${context.origin}?token=${token}`



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
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
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
        var token = jsonwebtoken.sign({ email: params.email }, process.env.SECRET_KEY, { expiresIn: 86400000 });



        //send token to sendmail function, which is send to the link(token)
        var url = `http://localhost:4000/?token=${token}`
        //var url = `${context.origin}/graphql?token=${token}`



        /**
         * @param {token}, for sending mail to the mail
         * @returns {String} message
         */
        var mail = sendMail.sendEmailFunction(url, params.email)
        if (!mail > 0) {
            //throw new AuthenticationError('!Error, mail not send ');
            return { "mesage": "!Error, mail not send " }
        }

        //return the response
        return {
            "message": "Mail sent to your given email id",
            "token": token
        }



    } catch (err) {
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
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
        if (!afterVerify > 0) {
            //throw new AuthenticationError('token is not verify');
            return { "message": "token is not verify" }
        }



        //password matching
        if (params.newPassword != params.confirmPassword) {
            //throw new AuthenticationError('password and confirm password are not match');
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
            //throw new AuthenticationError('Password not reset');
            return { "message": "Password not reset" }
        }

        //return the response
        return { "message": "resetPassword Successfully" }

    } catch (err) {
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
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
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
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
userMutation.prototype.remove = async (root, params) => {

    try {


        //find id and remove from the user Data
        const removeduser = await userModel.findByIdAndRemove(params.id).exec();

        if (!removeduser) {
            //throw new AuthenticationError('check user id, try again');
            return { "message": "check user id, try again" }
        }

        //return the response
        return { "message": "user delete successfully" };


    } catch (err) {
        if (err instanceof ReferenceError || err instanceof SyntaxError || err instanceof TypeError || err instanceof RangeError) {
            return errorMessage;
        }
        else {
            errorMessage.message = err.message;
            return errorMessage
        }
    }
}

/**
 * @exports userMutation
 */
module.exports = new userMutation()